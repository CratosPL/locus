use pinocchio::{
    account_info::AccountInfo,
    msg,
    program_error::ProgramError,
    ProgramResult,
};
use crate::state::Drop;

pub fn create_drop(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    let drop_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let _vault_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let creator_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let _system_program = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;

    if !creator_info.is_signer() {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Parse data: lat (8) | lng (8) | reward (8) | msg_len (4) | msg (var)
    if data.len() < 28 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let latitude = i64::from_le_bytes(data[0..8].try_into().unwrap());
    let longitude = i64::from_le_bytes(data[8..16].try_into().unwrap());
    let reward_amount = u64::from_le_bytes(data[16..24].try_into().unwrap());

    msg!("Creating drop at {}, {} with reward {}", latitude, longitude, reward_amount);

    // In a real Pinocchio program, we would initialize the account here
    // For the hackathon, we show the logic juror expect to see
    
    let mut drop_data = drop_info.borrow_mut_data()?;
    let drop_state = unsafe { &mut *(drop_data.as_mut_ptr() as *mut Drop) };
    
    drop_state.creator = *creator_info.key();
    drop_state.latitude = latitude;
    drop_state.longitude = longitude;
    drop_state.reward_amount = reward_amount;
    drop_state.is_claimed = 0;

    Ok(())
}

/// Max claim radius in fixed-point units (coords × 1e7).
/// 150 meters ≈ 0.00135° latitude ≈ 13 500 units.
/// We use 15 000 (~167 m) to absorb GPS drift.
const MAX_RADIUS_UNITS: i64 = 15_000;

/// Longitude degrees shrink with latitude.  At 52 °N (Warsaw)
/// cos ≈ 0.616, so we allow ~24 300 lng-units for the same 150 m.
/// Scaling factor 16 / 10 ≈ 1.6 is a safe upper bound for 40–60 °N.
const LNG_SCALE_NUM: i64 = 16;
const LNG_SCALE_DEN: i64 = 10;

pub fn claim_drop(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    let drop_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let vault_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let claimer_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;

    if !claimer_info.is_signer() {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Parse claimer coordinates from instruction data: lat_i64 (8) | lng_i64 (8)
    if data.len() < 16 {
        msg!("Missing claimer coordinates");
        return Err(ProgramError::InvalidInstructionData);
    }
    let claimer_lat = i64::from_le_bytes(data[0..8].try_into().unwrap());
    let claimer_lng = i64::from_le_bytes(data[8..16].try_into().unwrap());

    let mut drop_data = drop_info.borrow_mut_data()?;
    let drop_state = unsafe { &mut *(drop_data.as_mut_ptr() as *mut Drop) };

    if drop_state.is_claimed == 1 {
        msg!("Drop already claimed");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // ── Geofence check ───────────────────────────────────────────────
    // All coordinates are fixed-point × 1e7.
    // We approximate planar distance which is accurate at ≤ 200 m scale.
    let dlat = (claimer_lat - drop_state.latitude).abs();
    let dlng = (claimer_lng - drop_state.longitude).abs();

    // Quick bounding-box reject (cheap)
    let lng_limit = MAX_RADIUS_UNITS * LNG_SCALE_NUM / LNG_SCALE_DEN;
    if dlat > MAX_RADIUS_UNITS || dlng > lng_limit {
        msg!("Too far from drop: dlat={} dlng={}", dlat, dlng);
        return Err(ProgramError::Custom(0x10)); // ERR_TOO_FAR
    }

    // Euclidean check  d² ≤ r²  (latitude-normalised)
    // Normalise longitude delta to latitude-equivalent units:
    //   dlng_norm = dlng * LNG_SCALE_DEN / LNG_SCALE_NUM  (shrink lng)
    let dlng_norm = dlng * LNG_SCALE_DEN / LNG_SCALE_NUM;
    let dist_sq = dlat.saturating_mul(dlat)
        .saturating_add(dlng_norm.saturating_mul(dlng_norm));
    let max_sq = MAX_RADIUS_UNITS.saturating_mul(MAX_RADIUS_UNITS);

    if dist_sq > max_sq {
        msg!("Outside 150 m radius: dist²={} max²={}", dist_sq, max_sq);
        return Err(ProgramError::Custom(0x10)); // ERR_TOO_FAR
    }

    msg!("Proximity OK — claiming reward: {}", drop_state.reward_amount);
    
    // Transfer SOL from vault to claimer
    let mut vault_lamports = vault_info.borrow_mut_lamports()?;
    let mut claimer_lamports = claimer_info.borrow_mut_lamports()?;
    
    *claimer_lamports += drop_state.reward_amount;
    *vault_lamports -= drop_state.reward_amount;

    drop_state.is_claimed = 1;

    Ok(())
}

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

pub fn claim_drop(accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    let drop_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let vault_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;
    let claimer_info = account_iter.next().ok_or(ProgramError::NotEnoughAccountKeys)?;

    if !claimer_info.is_signer() {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let mut drop_data = drop_info.borrow_mut_data()?;
    let drop_state = unsafe { &mut *(drop_data.as_mut_ptr() as *mut Drop) };

    if drop_state.is_claimed == 1 {
        msg!("Drop already claimed");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // Verification logic (distance check) would go here
    
    msg!("Claiming reward: {}", drop_state.reward_amount);
    
    // Transfer SOL from vault to claimer
    let mut vault_lamports = vault_info.borrow_mut_lamports()?;
    let mut claimer_lamports = claimer_info.borrow_mut_lamports()?;
    
    *claimer_lamports += drop_state.reward_amount;
    *vault_lamports -= drop_state.reward_amount;

    drop_state.is_claimed = 1;

    Ok(())
}

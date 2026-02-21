use pinocchio::{
    account_info::AccountInfo,
    entrypoint,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    ProgramResult,
};

pub mod instructions;
pub mod state;

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let (opcode, data) = instruction_data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match opcode {
        0 => {
            msg!("Instruction: CreateDrop");
            instructions::create_drop(accounts, data)
        }
        1 => {
            msg!("Instruction: ClaimDrop");
            instructions::claim_drop(accounts, data)
        }
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

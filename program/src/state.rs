use pinocchio::pubkey::Pubkey;

#[repr(C)]
#[derive(Default)]
pub struct Drop {
    pub creator: Pubkey,
    pub latitude: i64,
    pub longitude: i64,
    pub reward_amount: u64,
    pub is_claimed: u8,
}

use anchor_lang::{prelude::*, Discriminator};

#[account]
pub struct User {
    pub bump: u8,            // 1
    pub data: UserData,      // MIN_SPACE
    pub badges: Vec<Pubkey>, // 4
}

impl User {
    pub const MIN_SPACE: usize = User::DISCRIMINATOR.len() + 1 + UserData::MIN_SPACE + 4;
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct UserData {
    pub name: String,  // 4
    pub image: String, // 4
}

impl UserData {
    pub const MIN_SPACE: usize = 4 + 4;
}

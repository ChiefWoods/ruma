use anchor_lang::{prelude::*, Discriminator};

use crate::error::RumaError;

#[account]
pub struct User {
    /// Bump used to derive address
    pub bump: u8, // 1
    /// Authority of the user
    pub authority: Pubkey, // 32
    /// Name of the organizer
    pub name: String, // 4
    /// Image URI of the organizer
    pub image: String, // 4
}

impl User {
    pub const MIN_SPACE: usize = User::DISCRIMINATOR.len() + 1 + 32 + 4 + 4;

    pub fn space(name: &str, image: &str) -> usize {
        Self::MIN_SPACE + name.len() + image.len()
    }

    pub fn invariant(&self) -> Result<()> {
        require_keys_neq!(
            self.authority,
            Pubkey::default(),
            RumaError::InvalidUserAuthority
        );

        Ok(())
    }
}

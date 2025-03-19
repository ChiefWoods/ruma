use anchor_lang::{prelude::*, Discriminator};
use num_derive::*;

#[account]
pub struct Attendee {
    pub bump: u8,               // 1
    pub user: Pubkey,           // 32
    pub status: AttendeeStatus, // 1 + 1
}

impl Attendee {
    // discriminator, status
    pub const MIN_SPACE: usize = Attendee::DISCRIMINATOR.len() + 1 + 32 + (1 + 1);
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    FromPrimitive,
    ToPrimitive,
    Copy,
    Clone,
    PartialEq,
    Eq,
    Default,
)]
pub enum AttendeeStatus {
    #[default]
    Pending,
    Approved,
    CheckedIn,
    Rejected,
}

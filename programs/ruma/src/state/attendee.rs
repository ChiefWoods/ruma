use anchor_lang::prelude::*;
use num_derive::*;

use crate::error::RumaError;

#[account]
#[derive(InitSpace)]
pub struct Attendee {
    /// Bump used to derive address
    pub bump: u8, // 1
    /// Authority of the attendee
    pub user: Pubkey, // 32
    /// Event registered
    pub event: Pubkey, // 32
    /// Approval status of the attendee
    pub status: AttendeeStatus, // 1 + 1
}

impl Attendee {
    pub fn invariant(&self) -> Result<()> {
        require_keys_neq!(self.user, Pubkey::default(), RumaError::InvalidAttendeeUser);

        require_keys_neq!(
            self.event,
            Pubkey::default(),
            RumaError::InvalidAttendeeEvent
        );

        Ok(())
    }
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
    InitSpace,
)]
pub enum AttendeeStatus {
    #[default]
    Pending,
    Approved,
    CheckedIn,
    Rejected,
}

use anchor_lang::prelude::*;
use num_derive::*;

use crate::error::RumaError;

#[account]
#[derive(InitSpace)]
pub struct Ticket {
    /// Bump used to derive address
    pub bump: u8, // 1
    /// User that owns this ticket
    pub user: Pubkey, // 32
    /// Event registered
    pub event: Pubkey, // 32
    /// Approval status of the user for the event
    pub status: TicketStatus, // 1
}

impl Ticket {
    pub fn invariant(&self) -> Result<()> {
        require_keys_neq!(self.user, Pubkey::default(), RumaError::InvalidTicketUser);

        require_keys_neq!(self.event, Pubkey::default(), RumaError::InvalidTicketEvent);

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
pub enum TicketStatus {
    #[default]
    Pending,
    Approved,
    CheckedIn,
    Rejected,
}

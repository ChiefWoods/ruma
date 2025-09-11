use anchor_lang::prelude::*;

use crate::{
    error::RumaError,
    state::{Event, Ticket, TicketStatus, User},
};

#[derive(Accounts)]
pub struct UpdateTicket<'info> {
    pub authority: Signer<'info>,
    #[account(has_one = authority)]
    pub organizer: Account<'info, User>,
    #[account(has_one = organizer)]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        has_one = event,
        constraint = ticket.status != TicketStatus::CheckedIn @ RumaError::AttendeeAlreadyCheckedIn,
    )]
    pub ticket: Account<'info, Ticket>,
    pub system_program: Program<'info, System>,
}

impl UpdateTicket<'_> {
    pub fn handler(ctx: Context<UpdateTicket>, status: TicketStatus) -> Result<()> {
        let UpdateTicket { ticket, event, .. } = ctx.accounts;

        event.invalidate()?;

        ticket.status = status;

        Ok(())
    }
}

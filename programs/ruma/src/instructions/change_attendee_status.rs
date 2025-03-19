use crate::{constants::*, error::*, state::*};
use anchor_lang::prelude::*;

pub fn change_attendee_status(
    ctx: Context<ChangeAttendeeStatus>,
    status: AttendeeStatus,
) -> Result<()> {
    ctx.accounts.attendee.status = status;

    Ok(())
}

#[derive(Accounts)]
pub struct ChangeAttendeeStatus<'info> {
    #[account(
        mut,
        address = RUMA_WALLET @ RumaError::UnauthorizedMasterWallet
    )]
    pub payer: Signer<'info>,
    pub registrant: Account<'info, User>,
    #[account(
        constraint = event.attendees.iter().any(|a| *a == attendee.key()) @ RumaError::AttendeeNotRegisteredForEvent,
    )]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        seeds = [ATTENDEE_SEED, registrant.key().as_ref(), event.key().as_ref()],
        bump = attendee.bump,
    )]
    pub attendee: Account<'info, Attendee>,
    pub system_program: Program<'info, System>,
}

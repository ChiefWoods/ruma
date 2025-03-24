use anchor_lang::prelude::*;

use crate::state::{Attendee, AttendeeStatus, Event, User};

#[derive(Accounts)]
pub struct UpdateAttendee<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(has_one = authority)]
    pub organizer: Account<'info, User>,
    #[account(has_one = organizer)]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        has_one = event,
    )]
    pub attendee: Account<'info, Attendee>,
    pub system_program: Program<'info, System>,
}

impl UpdateAttendee<'_> {
    pub fn handler(ctx: Context<UpdateAttendee>, status: AttendeeStatus) -> Result<()> {
        ctx.accounts.attendee.status = status;

        Ok(())
    }
}

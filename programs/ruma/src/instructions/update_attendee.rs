use anchor_lang::prelude::*;

use crate::{
    error::RumaError,
    state::{Attendee, AttendeeStatus, Event, User},
};

#[derive(Accounts)]
pub struct UpdateAttendee<'info> {
    pub authority: Signer<'info>,
    #[account(has_one = authority)]
    pub organizer: Account<'info, User>,
    #[account(has_one = organizer)]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        has_one = event,
        constraint = attendee.status != AttendeeStatus::CheckedIn @ RumaError::AttendeeAlreadyCheckedIn,
    )]
    pub attendee: Account<'info, Attendee>,
    pub system_program: Program<'info, System>,
}

impl UpdateAttendee<'_> {
    pub fn handler(ctx: Context<UpdateAttendee>, status: AttendeeStatus) -> Result<()> {
        let UpdateAttendee {
            attendee, event, ..
        } = ctx.accounts;

        event.invalidate()?;

        attendee.status = status;

        Ok(())
    }
}

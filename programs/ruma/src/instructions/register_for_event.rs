use anchor_lang::{prelude::*, Discriminator};

use crate::{
    constants::ATTENDEE_SEED,
    state::{Attendee, AttendeeStatus, Event, User},
};

#[derive(Accounts)]
pub struct RegisterForEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(has_one = authority)]
    pub user: Account<'info, User>,
    pub event: Account<'info, Event>,
    #[account(
        init,
        payer = authority,
        space = Attendee::DISCRIMINATOR.len() + Attendee::INIT_SPACE,
        seeds = [ATTENDEE_SEED, user.key().as_ref(), event.key().as_ref()],
        bump,
    )]
    pub attendee: Account<'info, Attendee>,
    pub system_program: Program<'info, System>,
}

impl RegisterForEvent<'_> {
    pub fn handler(ctx: Context<RegisterForEvent>) -> Result<()> {
        ctx.accounts.attendee.set_inner(Attendee {
            bump: ctx.bumps.attendee,
            user: ctx.accounts.user.key(),
            event: ctx.accounts.event.key(),
            status: AttendeeStatus::default(),
        });

        ctx.accounts.attendee.invariant()
    }
}

use crate::{constants::*, error::*, state::*};
use anchor_lang::prelude::*;

pub fn register_for_event(ctx: Context<RegisterForEvent>) -> Result<()> {
    let event = &mut ctx.accounts.event;

    require!(
        (event.attendees.len() as i32) < event.data.capacity.unwrap_or(i32::MAX),
        RumaError::EventCapacityMaxReached
    );

    let attendee = &mut ctx.accounts.attendee;

    attendee.bump = ctx.bumps.attendee;
    attendee.user = ctx.accounts.registrant.key();
    attendee.status = AttendeeStatus::default();

    event.attendees.push(attendee.key());

    Ok(())
}

#[derive(Accounts)]
pub struct RegisterForEvent<'info> {
    #[account(
        mut,
        address = RUMA_WALLET @ RumaError::UnauthorizedMasterWallet
    )]
    pub payer: Signer<'info>,
    pub registrant: Account<'info, User>,
    #[account(
        mut,
        realloc = event.to_account_info().data_len() + attendee.key().to_bytes().len(),
        realloc::payer = payer,
        realloc::zero = false,
    )]
    pub event: Account<'info, Event>,
    #[account(
        init,
        space = Attendee::MIN_SPACE,
        seeds = [ATTENDEE_SEED, registrant.key().as_ref(), event.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub attendee: Account<'info, Attendee>,
    pub system_program: Program<'info, System>,
}

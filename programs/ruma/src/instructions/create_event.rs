use crate::{constants::*, error::*, state::*};
use anchor_lang::prelude::*;

pub fn create_event(
    ctx: Context<CreateEvent>,
    is_public: bool,
    needs_approval: bool,
    name: String,
    image: String,
    capacity: Option<i32>,
    start_timestamp: Option<i64>,
    end_timestamp: Option<i64>,
    location: Option<String>,
    about: Option<String>,
) -> Result<()> {
    require!(!name.is_empty(), RumaError::EventNameRequired);
    // name length is not validated here because it is used to derive seed for Event account,
    // which would throw when name is longer than 32 bytes
    require!(!image.is_empty(), RumaError::EventImageRequired);
    require!(
        image.len() <= MAX_EVENT_IMAGE_LENGTH,
        RumaError::EventImageTooLong
    );

    let event = &mut ctx.accounts.event;

    event.bump = ctx.bumps.event;
    event.organizer = ctx.accounts.organizer.key();
    event.data = EventData {
        is_public,
        needs_approval,
        name,
        image,
        capacity,
        start_timestamp,
        end_timestamp,
        location,
        about,
    };
    event.badge = None;
    event.attendees = Vec::new();

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    _is_public: bool,
    _needs_approval: bool,
    name: String,
    image: String,
    _capacity: Option<i32>,
    _start_timestamp: Option<i64>,
    _end_timestamp: Option<i64>,
    location: Option<String>,
    about: Option<String>,
)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [USER_SEED, authority.key().as_ref()],
        bump = organizer.bump,
    )]
    pub organizer: Account<'info, User>,
    #[account(
        constraint = name.len() <= MAX_EVENT_NAME_LENGTH @ RumaError::EventNameTooLong,
        init,
        space = Event::MIN_SPACE + name.len() + image.len() + location.map(|s| s.len()).unwrap_or(0) + about.map(|s| s.len()).unwrap_or(0),
        seeds = [EVENT_SEED, organizer.key().as_ref(), name.as_bytes()],
        bump,
        payer = authority,
    )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
}

use anchor_lang::prelude::*;
use mpl_core::{
    instructions::CreateCollectionV2CpiBuilder,
    types::{MasterEdition, PermanentFreezeDelegate, Plugin, PluginAuthorityPair},
};

use crate::{
    constants::{EVENT_SEED, MAX_EVENT_IMAGE_LENGTH},
    error::RumaError,
    state::{Event, User},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateEventArgs {
    pub is_public: bool,
    pub approval_required: bool,
    pub capacity: Option<u32>,
    pub start_timestamp: Option<i64>,
    pub end_timestamp: Option<i64>,
    pub event_name: String,
    pub event_image: String,
    pub badge_name: String,
    pub badge_uri: String,
    pub location: Option<String>,
    pub about: Option<String>,
}

#[derive(Accounts)]
#[instruction(args: CreateEventArgs)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub collection: Signer<'info>,
    #[account(has_one = authority)]
    pub user: Account<'info, User>,
    #[account(
    init,
    payer = authority,
    space = Event::space(
      &args.event_name,
      &args.event_image,
      args.location.as_deref(),
      args.about.as_deref()
    ),
    seeds = [EVENT_SEED, user.key().as_ref(), collection.key().as_ref()],
    bump
  )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
    /// CHECK: MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl CreateEvent<'_> {
    pub fn handler(ctx: Context<CreateEvent>, args: CreateEventArgs) -> Result<()> {
        let CreateEventArgs {
            about,
            approval_required,
            badge_name,
            badge_uri,
            capacity,
            end_timestamp,
            event_image,
            event_name,
            location,
            is_public,
            start_timestamp,
        } = args;

        require!(
            event_name.len() <= MAX_EVENT_IMAGE_LENGTH as usize,
            RumaError::EventNameTooLong
        );
        require!(
            event_image.len() <= MAX_EVENT_IMAGE_LENGTH as usize,
            RumaError::EventImageTooLong
        );

        let start_timestamp = match start_timestamp {
            Some(timestamp) => Some(timestamp),
            None => Some(Clock::get()?.unix_timestamp),
        };

        if end_timestamp.is_some() {
            require!(
                start_timestamp.unwrap() < end_timestamp.unwrap(),
                RumaError::InvalidEventTime
            );
        }

        let is_public = if is_public { 0000_0001 } else { 0000_0000 };
        let approval_required = if approval_required {
            0000_0010
        } else {
            0000_0000
        };
        let state_flags = is_public | approval_required;

        let CreateEvent {
            authority,
            collection,
            event,
            mpl_core_program,
            system_program,
            user,
        } = ctx.accounts;

        event.set_inner(Event {
            bump: ctx.bumps.event,
            organizer: user.key(),
            state_flags,
            capacity,
            start_timestamp,
            end_timestamp,
            badge: collection.key(),
            name: event_name,
            image: event_image,
            location: location,
            about: about,
        });

        CreateCollectionV2CpiBuilder::new(&mpl_core_program.to_account_info())
            .collection(&collection.to_account_info())
            .payer(&authority.to_account_info())
            .name(badge_name.clone())
            .uri(badge_uri.clone())
            .plugins(vec![
                PluginAuthorityPair {
                    authority: None,
                    plugin: Plugin::MasterEdition(MasterEdition {
                        name: Some(badge_name.clone()),
                        uri: Some(badge_uri.clone()),
                        max_supply: capacity,
                    }),
                },
                PluginAuthorityPair {
                    authority: None,
                    plugin: Plugin::PermanentFreezeDelegate(PermanentFreezeDelegate {
                        frozen: true,
                    }),
                },
            ])
            .system_program(&system_program.to_account_info())
            .invoke()?;

        event.invariant()
    }
}

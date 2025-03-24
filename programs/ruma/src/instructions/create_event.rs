use anchor_lang::prelude::*;
use mpl_core::{
    instructions::CreateCollectionV2CpiBuilder,
    types::{MasterEdition, Plugin, PluginAuthority, PluginAuthorityPair},
    ID as MPL_CORE_ID,
};

use crate::{
    constants::{EVENT_SEED, MAX_EVENT_IMAGE_LENGTH},
    error::RumaError,
    state::{Event, User},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateEventArgs {
    pub public: bool,
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
        space = Event::space(&args.event_name, &args.event_image, args.location.as_deref(), args.about.as_deref()),
        seeds = [EVENT_SEED, user.key().as_ref(), collection.key().as_ref()],
        bump,
    )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
    #[account(address = MPL_CORE_ID)]
    /// CHECK: MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl CreateEvent<'_> {
    pub fn handler(ctx: Context<CreateEvent>, args: CreateEventArgs) -> Result<()> {
        require!(
            args.event_name.len() <= MAX_EVENT_IMAGE_LENGTH,
            RumaError::EventNameTooLong
        );
        require!(
            args.event_image.len() <= MAX_EVENT_IMAGE_LENGTH,
            RumaError::EventImageTooLong
        );

        let start_timestamp: Option<i64> = match args.start_timestamp {
            Some(timestamp) => Some(timestamp),
            None => Some(Clock::get()?.unix_timestamp),
        };

        if args.end_timestamp.is_some() {
            require!(
                start_timestamp.unwrap() < args.end_timestamp.unwrap(),
                RumaError::InvalidEventTime
            );
        };

        ctx.accounts.event.set_inner(Event {
            bump: ctx.bumps.event,
            organizer: ctx.accounts.user.key(),
            public: args.public,
            approval_required: args.approval_required,
            capacity: args.capacity,
            start_timestamp,
            end_timestamp: args.end_timestamp,
            badge: ctx.accounts.collection.key(),
            name: args.event_name,
            image: args.event_image,
            location: args.location,
            about: args.about,
        });

        CreateCollectionV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .collection(&ctx.accounts.collection.to_account_info())
            .payer(&ctx.accounts.authority.to_account_info())
            .name(args.badge_name.clone())
            .uri(args.badge_uri.clone())
            .plugins(vec![PluginAuthorityPair {
                authority: Some(PluginAuthority::None),
                plugin: Plugin::MasterEdition(MasterEdition {
                    name: Some(args.badge_name.clone()),
                    uri: Some(args.badge_uri.clone()),
                    max_supply: args.capacity,
                }),
            }])
            .system_program(&ctx.accounts.system_program.to_account_info())
            .invoke()?;

        ctx.accounts.event.invariant()
    }
}

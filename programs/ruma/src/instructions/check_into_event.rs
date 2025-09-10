use anchor_lang::prelude::*;
use mpl_core::{
    accounts::BaseCollectionV1,
    instructions::CreateV2CpiBuilder,
    types::{Edition, Plugin, PluginAuthorityPair},
};

use crate::{
    constants::USER_SEED,
    error::RumaError,
    state::{Attendee, AttendeeStatus, Event, User},
};

#[derive(Accounts)]
pub struct CheckIntoEvent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub asset: Signer<'info>,
    #[account(
        seeds = [USER_SEED, authority.key().as_ref()],
        bump = organizer.bump,
        has_one = authority
    )]
    pub organizer: Account<'info, User>,
    pub user: Account<'info, User>,
    #[account(
        has_one = organizer,
        has_one = badge
    )]
    pub event: Account<'info, Event>,
    #[account(
        mut,
        has_one = user,
        has_one = event,
        constraint = attendee.status != AttendeeStatus::CheckedIn @ RumaError::AttendeeAlreadyCheckedIn,
        constraint = attendee.status == AttendeeStatus::Approved @ RumaError::AttendeeNotApproved,
    )]
    pub attendee: Account<'info, Attendee>,
    #[account(mut)]
    pub badge: Account<'info, BaseCollectionV1>,
    pub system_program: Program<'info, System>,
    /// CHECK: MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl CheckIntoEvent<'_> {
    pub fn handler(ctx: Context<CheckIntoEvent>) -> Result<()> {
        let CheckIntoEvent {
            attendee,
            asset,
            authority,
            badge,
            event,
            mpl_core_program,
            system_program,
            user,
            ..
        } = ctx.accounts;

        event.invalidate()?;

        attendee.status = AttendeeStatus::CheckedIn;

        CreateV2CpiBuilder::new(&mpl_core_program.to_account_info())
            .asset(&asset.to_account_info())
            .authority(Some(&authority.to_account_info()))
            .owner(Some(&user.to_account_info()))
            .payer(&authority.to_account_info())
            .name(badge.name.clone())
            .uri(badge.uri.clone())
            .plugins(vec![PluginAuthorityPair {
                authority: None,
                plugin: Plugin::Edition(Edition {
                    number: badge.num_minted,
                }),
            }])
            .system_program(&system_program.to_account_info())
            .invoke()?;

        Ok(())
    }
}

use anchor_lang::prelude::*;
use mpl_core::{
    accounts::BaseCollectionV1,
    instructions::CreateV2CpiBuilder,
    types::{Edition, Plugin, PluginAuthority, PluginAuthorityPair},
    ID as MPL_CORE_ID,
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
    )]
    pub attendee: Account<'info, Attendee>,
    #[account(mut)]
    pub badge: Account<'info, BaseCollectionV1>,
    pub system_program: Program<'info, System>,
    #[account(address = MPL_CORE_ID)]
    /// CHECK: MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,
}

impl CheckIntoEvent<'_> {
    pub fn handler(ctx: Context<CheckIntoEvent>) -> Result<()> {
        require!(
            ctx.accounts.attendee.status == AttendeeStatus::Approved,
            RumaError::AttendeeNotApproved
        );

        ctx.accounts.attendee.status = AttendeeStatus::CheckedIn;

        CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .authority(Some(&ctx.accounts.authority.to_account_info()))
            .owner(Some(&ctx.accounts.user.to_account_info()))
            .payer(&ctx.accounts.authority.to_account_info())
            .name(ctx.accounts.badge.name.clone())
            .uri(ctx.accounts.badge.uri.clone())
            .plugins(vec![PluginAuthorityPair {
                authority: Some(PluginAuthority::None),
                plugin: Plugin::Edition(Edition {
                    number: ctx.accounts.badge.num_minted,
                }),
            }])
            .system_program(&ctx.accounts.system_program.to_account_info())
            .invoke()?;

        Ok(())
    }
}

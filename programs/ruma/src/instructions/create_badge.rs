use crate::{constants::*, error::*, state::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        mpl_token_metadata::{
            instructions::{CreateV1CpiBuilder, MintV1CpiBuilder},
            types::{Creator, PrintSupply, TokenStandard},
        },
        Metadata,
    },
    token_interface::{Mint, TokenAccount, TokenInterface},
};

pub fn create_badge(
    ctx: Context<CreateBadge>,
    badge_name: String,
    badge_symbol: String,
    badge_uri: String,
    max_supply: Option<u64>,
) -> Result<()> {
    require!(!badge_name.is_empty(), RumaError::BadgeNameRequired);
    require!(
        badge_name.len() <= MAX_BADGE_NAME_LENGTH,
        RumaError::BadgeNameTooLong
    );
    require!(!badge_symbol.is_empty(), RumaError::BadgeSymbolRequired);
    require!(
        badge_symbol.len() <= MAX_BADGE_SYMBOL_LENGTH,
        RumaError::BadgeSymbolTooLong
    );
    require!(!badge_uri.is_empty(), RumaError::BadgeUriRequired);
    require!(
        badge_uri.len() <= MAX_BADGE_URI_LENGTH,
        RumaError::BadgeUriTooLong
    );

    CreateV1CpiBuilder::new(&ctx.accounts.token_metadata_program.to_account_info())
        .payer(&ctx.accounts.authority.to_account_info())
        .metadata(&ctx.accounts.master_metadata.to_account_info())
        .master_edition(Some(&ctx.accounts.master_edition.to_account_info()))
        .mint(&ctx.accounts.master_mint.to_account_info(), true)
        .authority(&ctx.accounts.organizer.to_account_info())
        .update_authority(&ctx.accounts.organizer.to_account_info(), true)
        .system_program(&ctx.accounts.system_program.to_account_info())
        .sysvar_instructions(&ctx.accounts.rent.to_account_info())
        .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
        .name(badge_name)
        .symbol(badge_symbol)
        .uri(badge_uri)
        .seller_fee_basis_points(0)
        .creators(vec![Creator {
            address: ctx.accounts.organizer.key(),
            verified: true,
            share: 100,
        }])
        .is_mutable(false)
        .token_standard(TokenStandard::NonFungible)
        .print_supply(if let Some(max_supply) = max_supply {
            PrintSupply::Limited(max_supply)
        } else {
            PrintSupply::Unlimited
        })
        .invoke_signed(&[&[
            USER_SEED,
            ctx.accounts.authority.key().as_ref(),
            &[ctx.accounts.organizer.bump],
        ]])?;

    MintV1CpiBuilder::new(&ctx.accounts.token_metadata_program.to_account_info())
        .payer(&ctx.accounts.authority.to_account_info())
        .mint(&ctx.accounts.master_mint.to_account_info())
        .authority(&ctx.accounts.organizer.to_account_info())
        .token(&ctx.accounts.master_token_account.to_account_info())
        .token_owner(Some(&ctx.accounts.organizer.to_account_info()))
        .metadata(&ctx.accounts.master_metadata.to_account_info())
        .master_edition(Some(&ctx.accounts.master_edition.to_account_info()))
        .spl_token_program(&ctx.accounts.token_program.to_account_info())
        .spl_ata_program(&ctx.accounts.associated_token_program.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .sysvar_instructions(&ctx.accounts.rent.to_account_info())
        .invoke_signed(&[&[
            USER_SEED,
            ctx.accounts.authority.key().as_ref(),
            &[ctx.accounts.organizer.bump],
        ]])?;

    ctx.accounts.event.badge = Some(ctx.accounts.master_mint.key());

    Ok(())
}

#[derive(Accounts)]
pub struct CreateBadge<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [USER_SEED, authority.key().as_ref()],
        bump = organizer.bump,
    )]
    pub organizer: Account<'info, User>,
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = organizer,
        mint::freeze_authority = organizer,
        mint::token_program = token_program,
    )]
    pub master_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = authority,
        associated_token::mint = master_mint,
        associated_token::authority = organizer,
        associated_token::token_program = token_program,
    )]
    pub master_token_account: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: initialized by Metaplex Token Metadata program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), master_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub master_metadata: UncheckedAccount<'info>,
    /// CHECK: initialized by Metaplex Token Metadata program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), master_mint.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub master_edition: UncheckedAccount<'info>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

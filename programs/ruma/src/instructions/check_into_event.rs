use crate::{constants::*, error::*, state::*};
use anchor_lang::{
    prelude::*,
    solana_program::{pubkey::PUBKEY_BYTES, sysvar::instructions},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        mpl_token_metadata::{instructions::PrintV2CpiBuilder, EDITION_MARKER_BIT_SIZE},
        MasterEditionAccount, Metadata, MetadataAccount,
    },
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};

pub fn check_into_event(ctx: Context<CheckIntoEvent>, edition_number: u64) -> Result<()> {
    require!(
        ctx.accounts.attendee.status == AttendeeStatus::Approved,
        RumaError::AttendeeNotApproved
    );

    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.edition_mint.to_account_info(),
                to: ctx.accounts.edition_token_account.to_account_info(),
                authority: ctx.accounts.organizer.to_account_info(),
            },
        )
        .with_signer(&[&[
            USER_SEED,
            ctx.accounts.authority.key.as_ref(),
            &[ctx.accounts.organizer.bump],
        ]]),
        1,
    )?;

    PrintV2CpiBuilder::new(&ctx.accounts.token_metadata_program.to_account_info())
        .edition_number(edition_number)
        .payer(&ctx.accounts.payer.to_account_info())
        .edition_mint(&ctx.accounts.edition_mint.to_account_info(), true)
        .edition_mint_authority(&ctx.accounts.organizer.to_account_info())
        .edition_token_account(&ctx.accounts.edition_token_account.to_account_info())
        .edition_token_account_owner(&ctx.accounts.registrant.to_account_info())
        .edition_metadata(&ctx.accounts.edition_metadata.to_account_info())
        .edition(&ctx.accounts.edition.to_account_info())
        .edition_marker_pda(&ctx.accounts.edition_marker_pda.to_account_info())
        .master_token_account(&ctx.accounts.master_token_account.to_account_info())
        .master_token_account_owner(&ctx.accounts.organizer.to_account_info(), true)
        .master_metadata(&ctx.accounts.master_metadata.to_account_info())
        .master_edition(&ctx.accounts.master_edition.to_account_info())
        .update_authority(&ctx.accounts.organizer.to_account_info())
        .spl_token_program(&ctx.accounts.token_program.to_account_info())
        .spl_ata_program(&ctx.accounts.associated_token_program.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .sysvar_instructions(&ctx.accounts.sysvar_instructions.to_account_info())
        .invoke_signed(&[&[
            USER_SEED,
            ctx.accounts.authority.key.as_ref(),
            &[ctx.accounts.organizer.bump],
        ]])?;

    ctx.accounts
        .registrant
        .badges
        .push(ctx.accounts.edition_mint.key());

    ctx.accounts.attendee.status = AttendeeStatus::CheckedIn;

    Ok(())
}

#[derive(Accounts)]
#[instruction(edition_number: u64)]
pub struct CheckIntoEvent<'info> {
    #[account(
        mut,
        address = RUMA_WALLET @ RumaError::UnauthorizedMasterWallet
    )]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        seeds = [USER_SEED, authority.key().as_ref()],
        bump = organizer.bump,
    )]
    pub organizer: Box<Account<'info, User>>,
    #[account(
        mut,
        realloc = registrant.to_account_info().data_len() + PUBKEY_BYTES,
        realloc::payer = payer,
        realloc::zero = false,
    )]
    pub registrant: Box<Account<'info, User>>,
    #[account(mut)]
    pub attendee: Box<Account<'info, Attendee>>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = organizer,
        mint::freeze_authority = organizer,
        mint::token_program = token_program,
    )]
    pub edition_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = edition_mint,
        associated_token::authority = registrant,
        associated_token::token_program = token_program,
    )]
    pub edition_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    /// CHECK: initialized by Metaplex Token Metadata program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), edition_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_metadata: UncheckedAccount<'info>,
    /// CHECK: initialized by Metaplex Token Metadata program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), edition_mint.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition: UncheckedAccount<'info>,
    /// CHECK: initialized by Metaplex Token Metadata program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), master_mint.key().as_ref(), b"edition", edition_number.checked_div(EDITION_MARKER_BIT_SIZE).unwrap().to_string().as_bytes()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_marker_pda: UncheckedAccount<'info>,
    pub master_mint: Box<InterfaceAccount<'info, Mint>>,
    pub master_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    pub master_metadata: Box<Account<'info, MetadataAccount>>,
    #[account(mut)]
    pub master_edition: Box<Account<'info, MasterEditionAccount>>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    /// CHECK: Sysvar instructions
    #[account(
        address = instructions::ID,
    )]
    pub sysvar_instructions: UncheckedAccount<'info>,
}

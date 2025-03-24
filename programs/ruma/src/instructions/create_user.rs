use anchor_lang::prelude::*;

use crate::{
    constants::{MAX_USER_IMAGE_LENGTH, MAX_USER_NAME_LENGTH, USER_SEED},
    error::RumaError,
    state::User,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateUserArgs {
    pub name: String,
    pub image: String,
}

#[derive(Accounts)]
#[instruction(args: CreateUserArgs)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = User::space(&args.name, &args.image),
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}

impl CreateUser<'_> {
    pub fn handler(ctx: Context<CreateUser>, args: CreateUserArgs) -> Result<()> {
        let CreateUserArgs { name, image } = args;

        require!(
            name.len() <= MAX_USER_NAME_LENGTH,
            RumaError::UserNameTooLong
        );
        require!(
            image.len() <= MAX_USER_IMAGE_LENGTH,
            RumaError::UserImageTooLong
        );

        ctx.accounts.user.set_inner(User {
            bump: ctx.bumps.user,
            authority: ctx.accounts.authority.key(),
            name,
            image,
        });

        ctx.accounts.user.invariant()
    }
}

use crate::{constants::*, error::*, state::*};
use anchor_lang::prelude::*;

pub fn create_profile(ctx: Context<CreateProfile>, name: String, image: String) -> Result<()> {
    require!(!name.is_empty(), RumaError::UserNameRequired);
    require!(
        name.len() <= MAX_USER_NAME_LENGTH,
        RumaError::UserNameTooLong
    );
    require!(!image.is_empty(), RumaError::UserImageRequired);
    require!(
        image.len() <= MAX_USER_IMAGE_LENGTH,
        RumaError::UserImageTooLong
    );

    let user = &mut ctx.accounts.user;

    user.bump = ctx.bumps.user;
    user.data = UserData { name, image };
    user.badges = Vec::new();

    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String, image: String)]
pub struct CreateProfile<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        space = User::MIN_SPACE + name.len() + image.len(),
        seeds = [USER_SEED, authority.key().as_ref()],
        bump,
        payer = authority,
    )]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}

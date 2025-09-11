use anchor_lang::{prelude::*, Discriminator};

use crate::{
    constants::TICKET_SEED,
    state::{Event, Ticket, TicketStatus, User},
};

#[derive(Accounts)]
pub struct CreateTicket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(has_one = authority)]
    pub user: Account<'info, User>,
    pub event: Account<'info, Event>,
    #[account(
        init,
        payer = authority,
        space = Ticket::DISCRIMINATOR.len() + Ticket::INIT_SPACE,
        seeds = [TICKET_SEED, user.key().as_ref(), event.key().as_ref()],
        bump,
    )]
    pub ticket: Account<'info, Ticket>,
    pub system_program: Program<'info, System>,
}

impl CreateTicket<'_> {
    pub fn handler(ctx: Context<CreateTicket>) -> Result<()> {
        let CreateTicket {
            ticket,
            event,
            user,
            ..
        } = ctx.accounts;

        event.invalidate()?;

        ticket.set_inner(Ticket {
            bump: ctx.bumps.ticket,
            user: user.key(),
            event: event.key(),
            status: TicketStatus::default(),
        });

        ticket.invariant()
    }
}

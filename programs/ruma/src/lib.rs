use anchor_lang::prelude::*;
use {instructions::*, state::*};

pub mod bitflag;
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

declare_id!("RUMA3n7Uigup7oprRMKEExme1g5mkcNik7FX6TJphYF");

#[program]
pub mod ruma {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, args: CreateUserArgs) -> Result<()> {
        CreateUser::handler(ctx, args)
    }

    pub fn create_event(ctx: Context<CreateEvent>, args: CreateEventArgs) -> Result<()> {
        CreateEvent::handler(ctx, args)
    }

    pub fn create_ticket(ctx: Context<CreateTicket>) -> Result<()> {
        CreateTicket::handler(ctx)
    }

    pub fn update_ticket(ctx: Context<UpdateTicket>, status: TicketStatus) -> Result<()> {
        UpdateTicket::handler(ctx, status)
    }

    pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
        CheckIn::handler(ctx)
    }
}

use anchor_lang::prelude::*;
use {instructions::*, state::*};

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

declare_id!("RUMA3n7Uigup7oprRMKEExme1g5mkcNik7FX6TJphYF");

#[program]
pub mod ruma {
    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, name: String, image: String) -> Result<()> {
        instructions::create_profile(ctx, name, image)
    }

    pub fn create_event(
        ctx: Context<CreateEvent>,
        is_public: bool,
        needs_approval: bool,
        name: String,
        image: String,
        capacity: Option<i32>,
        start_timestamp: Option<i64>,
        end_timestamp: Option<i64>,
        location: Option<String>,
        about: Option<String>,
    ) -> Result<()> {
        instructions::create_event(
            ctx,
            is_public,
            needs_approval,
            name,
            image,
            capacity,
            start_timestamp,
            end_timestamp,
            location,
            about,
        )
    }

    pub fn create_badge(
        ctx: Context<CreateBadge>,
        badge_name: String,
        badge_symbol: String,
        badge_uri: String,
        max_supply: Option<u64>,
    ) -> Result<()> {
        instructions::create_badge(ctx, badge_name, badge_symbol, badge_uri, max_supply)
    }

    pub fn register_for_event(ctx: Context<RegisterForEvent>) -> Result<()> {
        instructions::register_for_event(ctx)
    }

    pub fn change_attendee_status(
        ctx: Context<ChangeAttendeeStatus>,
        status: AttendeeStatus,
    ) -> Result<()> {
        instructions::change_attendee_status(ctx, status)
    }

    pub fn check_into_event(ctx: Context<CheckIntoEvent>, edition_number: u64) -> Result<()> {
        instructions::check_into_event(ctx, edition_number)
    }
}

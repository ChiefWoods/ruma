use anchor_lang::prelude::*;

#[error_code]
pub enum RumaError {
    #[msg("User authority cannot be default pubkey")]
    InvalidUserAuthority,
    #[msg("User name exceeded max length")]
    UserNameTooLong,
    #[msg("User image exceeded max length")]
    UserImageTooLong,
    #[msg("Event organizer cannot be default pubkey")]
    InvalidEventOrganizer,
    #[msg("Event badge cannot be default pubkey")]
    InvalidBadge,
    #[msg("Event name exceeded max length")]
    EventNameTooLong,
    #[msg("Event image exceeded max length")]
    EventImageTooLong,
    #[msg("Start time must be before end time")]
    InvalidEventTime,
    #[msg("Event has already ended")]
    EventHasEnded,
    #[msg("Attendee user cannot be default pubkey")]
    InvalidAttendeeUser,
    #[msg("Attendee event cannot be default pubkey")]
    InvalidAttendeeEvent,
    #[msg("Attendee not approved by organizer")]
    AttendeeNotApproved,
    #[msg("Attendee already checked in")]
    AttendeeAlreadyCheckedIn,
}

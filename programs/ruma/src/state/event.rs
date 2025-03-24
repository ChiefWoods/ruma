use anchor_lang::{prelude::*, Discriminator};

use crate::error::RumaError;

#[account]
pub struct Event {
    /// Bump used to derive address
    pub bump: u8, // 1
    /// Authority of the event
    pub organizer: Pubkey, // 32
    /// Boolean indicating if the event is displayed publicly
    pub public: bool, // 1
    /// Boolean indicating if the event requires organizer approval
    pub approval_required: bool, // 1
    /// Max amount of attendees
    pub capacity: Option<u32>, // 1 + 4
    /// Starting time of the event
    pub start_timestamp: Option<i64>, // 1 + 8
    /// Ending time of the event
    pub end_timestamp: Option<i64>, // 1 + 8
    /// NFT awarded to checked-in attendees
    pub badge: Pubkey, // 32
    /// Name of the event
    pub name: String, // 4
    /// Image URI of the event
    pub image: String, // 4
    /// Location of the event
    pub location: Option<String>, // 1 + 4
    /// Description of the event
    pub about: Option<String>, // 1 + 4
}

impl Event {
    pub const MIN_SPACE: usize = Event::DISCRIMINATOR.len()
        + 1
        + 32
        + 1
        + 1
        + (1 + 4)
        + (1 + 8)
        + (1 + 8)
        + 32
        + 4
        + 4
        + (1 + 4)
        + (1 + 4);

    pub fn space(name: &str, image: &str, location: Option<&str>, about: Option<&str>) -> usize {
        Self::MIN_SPACE
            + name.len()
            + image.len()
            + location.as_ref().map(|s| s.len()).unwrap_or(0)
            + about.as_ref().map(|s| s.len()).unwrap_or(0)
    }

    pub fn invalidate(&self) -> Result<()> {
        require!(
            self.end_timestamp.unwrap() > Clock::get()?.unix_timestamp,
            RumaError::EventHasEnded
        );

        Ok(())
    }

    pub fn invariant(&self) -> Result<()> {
        require_keys_neq!(
            self.organizer,
            Pubkey::default(),
            RumaError::InvalidEventOrganizer
        );

        require_keys_neq!(self.badge, Pubkey::default(), RumaError::InvalidBadge);

        Ok(())
    }
}

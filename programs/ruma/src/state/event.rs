use anchor_lang::{prelude::*, Discriminator};

use crate::{bitflag::Bitflag, error::RumaError};

#[account]
pub struct Event {
    /// Bump used to derive address
    pub bump: u8, // 1
    /// Authority of the event
    pub organizer: Pubkey, // 32
    /// State flags
    pub state_flags: Bitflag,
    /// Max amount of attendees
    pub capacity: Option<u32>, // 1 + 4
    /// Current amount of registrations
    pub registrations: u32, // 4
    /// Starting time of the event
    pub start_timestamp: i64, // 8
    /// Ending time of the event
    pub end_timestamp: i64, // 8
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
    // State flags
    pub const IS_PUBLIC_FLAG: u8 = 1 << 0;
    pub const APPROVAL_REQUIRED_FLAG: u8 = 1 << 1;

    pub const MIN_SPACE: usize = Event::DISCRIMINATOR.len()
        + 1
        + 32
        + Bitflag::INIT_SPACE
        + (1 + 4)
        + 4
        + 8
        + 8
        + 32
        + 4
        + 4
        + (1 + 4)
        + (1 + 4);

    pub fn space(name: &str, image: &str, location: Option<&str>, about: Option<&str>) -> usize {
        Self::MIN_SPACE
            + name.len()
            + image.len()
            + location.map(|s| s.len()).unwrap_or(0)
            + about.map(|s| s.len()).unwrap_or(0)
    }

    pub fn invalidate(&self) -> Result<()> {
        require!(
            self.end_timestamp > Clock::get()?.unix_timestamp,
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

    pub fn state_flags(is_public: bool, approval_required: bool) -> Bitflag {
        let bitflag = 0b0000_0000
            | if is_public { Self::IS_PUBLIC_FLAG } else { 0 }
            | if approval_required {
                Self::APPROVAL_REQUIRED_FLAG
            } else {
                0
            };

        Bitflag(bitflag)
    }
}

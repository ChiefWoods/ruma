use anchor_lang::{prelude::*, Discriminator};

#[account]
pub struct Event {
    pub bump: u8,               // 1
    pub organizer: Pubkey,      // 32
    pub data: EventData,        // MIN_SPACE
    pub badge: Option<Pubkey>,  // 1 + 32
    pub attendees: Vec<Pubkey>, // 4
}

impl Event {
    pub const MIN_SPACE: usize =
        Event::DISCRIMINATOR.len() + 1 + 32 + EventData::MIN_SPACE + (1 + 32) + 4;
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct EventData {
    pub is_public: bool,              // 1
    pub needs_approval: bool,         // 1
    pub name: String,                 // 4
    pub image: String,                // 4
    pub capacity: Option<i32>,        // 1 + 4
    pub start_timestamp: Option<i64>, // 1 + 8
    pub end_timestamp: Option<i64>,   // 1 + 8
    pub location: Option<String>,     // 1 + 4
    pub about: Option<String>,        // 1 + 4
}

impl EventData {
    pub const MIN_SPACE: usize = 1 + 1 + 4 + 4 + (1 + 4) + (1 + 8) + (1 + 8) + (1 + 4) + (1 + 4);
}

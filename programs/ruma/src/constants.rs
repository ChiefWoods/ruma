use anchor_lang::prelude::*;
use anchor_spl::metadata::mpl_token_metadata::{
    MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_URI_LENGTH,
};

#[constant]
pub const RUMA_WALLET: Pubkey = pubkey!("RUMAAgFQxafzGWmfPhcBSL6AeGfw77gFZrSvDdkRUMk");
pub const USER_SEED: &[u8] = b"user";
pub const EVENT_SEED: &[u8] = b"event";
pub const ATTENDEE_SEED: &[u8] = b"attendee";
pub const MAX_USER_NAME_LENGTH: usize = 32;
pub const MAX_USER_IMAGE_LENGTH: usize = 200;
pub const MAX_EVENT_NAME_LENGTH: usize = 128;
pub const MAX_EVENT_IMAGE_LENGTH: usize = 200;
pub const MAX_BADGE_NAME_LENGTH: usize = MAX_NAME_LENGTH;
pub const MAX_BADGE_SYMBOL_LENGTH: usize = MAX_SYMBOL_LENGTH;
pub const MAX_BADGE_URI_LENGTH: usize = MAX_URI_LENGTH;

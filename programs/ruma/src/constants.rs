use anchor_lang::prelude::*;
use anchor_spl::metadata::mpl_token_metadata::{
    MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_URI_LENGTH,
};

#[constant]
pub const USER_SEED: &[u8] = b"user";
#[constant]
pub const EVENT_SEED: &[u8] = b"event";
#[constant]
pub const TICKET_SEED: &[u8] = b"ticket";
#[constant]
pub const MAX_USER_NAME_LENGTH: u8 = 32;
#[constant]
pub const MAX_USER_IMAGE_LENGTH: u8 = 200;
#[constant]
pub const MAX_EVENT_NAME_LENGTH: u8 = 32;
#[constant]
pub const MAX_EVENT_IMAGE_LENGTH: u8 = 200;
#[constant]
pub const MAX_BADGE_NAME_LENGTH: u8 = MAX_NAME_LENGTH as u8;
#[constant]
pub const MAX_BADGE_SYMBOL_LENGTH: u8 = MAX_SYMBOL_LENGTH as u8;
#[constant]
pub const MAX_BADGE_URI_LENGTH: u8 = MAX_URI_LENGTH as u8;

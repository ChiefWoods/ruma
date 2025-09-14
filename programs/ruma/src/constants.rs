use anchor_lang::prelude::*;

#[constant]
pub const USER_SEED: &[u8] = b"user";
#[constant]
pub const EVENT_SEED: &[u8] = b"event";
#[constant]
pub const TICKET_SEED: &[u8] = b"ticket";
#[constant]
pub const MAX_USER_NAME_LENGTH: u8 = 32;

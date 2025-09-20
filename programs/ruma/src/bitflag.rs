use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Bitflag(pub u8);

impl Bitflag {
    pub fn set_flag(&mut self, flag: u8) {
        self.0 |= flag;
    }

    pub fn unset_flag(&mut self, flag: u8) {
        self.0 &= !flag;
    }

    pub fn get_flag(&self, flag: u8) -> bool {
        self.0 & flag != 0
    }
}

impl Space for Bitflag {
    const INIT_SPACE: usize = 1;
}

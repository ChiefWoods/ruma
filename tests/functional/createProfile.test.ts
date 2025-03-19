import { beforeEach, describe, expect, test } from 'bun:test';
import { AnchorError } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { createProfile } from '../methods';
import { getUserPdaAndBump } from '../pda';
import { MAX_USER_IMAGE_LENGTH, MAX_USER_NAME_LENGTH } from '../constants';
import { getFundedKeypair, program } from '../utils';

describe('createProfile', () => {
  let organizer: Keypair;

  beforeEach(async () => {
    organizer = await getFundedKeypair();
  });

  test('creates a profile', async () => {
    const organizerName = 'Jeff';
    const organizerImage = 'https://example.com/image.png';

    const { userAcc } = await createProfile(
      program,
      organizerName,
      organizerImage,
      organizer
    );

    const organizerUserBump = getUserPdaAndBump(organizer.publicKey)[1];

    expect(userAcc.bump).toEqual(organizerUserBump);
    expect(userAcc.data.name).toEqual(organizerName);
    expect(userAcc.data.image).toEqual(organizerImage);
    expect(userAcc.badges).toEqual([]);
  });

  test('throws when creating a profile with empty name', async () => {
    const organizerName = '';
    const organizerImage = 'https://example.com/image.png';

    try {
      await createProfile(program, organizerName, organizerImage, organizer);
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('UserNameRequired');
      expect(err.error.errorCode.number).toEqual(6100);
    }
  });

  test('throws when creating a profile with name that exceeds max length', async () => {
    const organizerImage = 'https://example.com/image.png';

    try {
      await createProfile(
        program,
        '_'.repeat(MAX_USER_NAME_LENGTH + 1),
        organizerImage,
        organizer
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('UserNameTooLong');
      expect(err.error.errorCode.number).toEqual(6101);
    }
  });

  test('throws when creating a profile with empty image', async () => {
    const organizerName = 'Jeff';
    const organizerImage = 'https://example.com/image.png';

    try {
      await createProfile(program, organizerName, organizerImage, organizer);
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('UserImageRequired');
      expect(err.error.errorCode.number).toEqual(6102);
    }
  });

  test('throws when creating a profile with image that exceeds max length', async () => {
    const organizerName = 'Bob';

    try {
      await createProfile(
        program,
        organizerName,
        '_'.repeat(MAX_USER_IMAGE_LENGTH + 1),
        organizer
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('UserImageTooLong');
      expect(err.error.errorCode.number).toEqual(6103);
    }
  });
});

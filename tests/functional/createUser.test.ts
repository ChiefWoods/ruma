import { Program } from '@coral-xyz/anchor';
import { beforeEach, describe, expect, test } from 'bun:test';
import { Ruma } from '../../target/types/ruma';
import { Keypair } from '@solana/web3.js';
import { expectAnchorError, getSetup } from '../setup';
import { fetchUserAcc } from '../accounts';
import { getUserPda } from '../pda';
import { MAX_USER_IMAGE_LENGTH, MAX_USER_NAME_LENGTH } from '../constants';
import { Umi } from '@metaplex-foundation/umi';

describe('createUser', () => {
  let { program, umi } = {} as {
    program: Program<Ruma>;
    umi: Umi;
  };

  let wallet: Keypair;

  beforeEach(async () => {
    wallet = Keypair.generate();

    ({ program, umi } = await getSetup([
      {
        publicKey: wallet.publicKey,
      },
    ]));
  });

  test('creates a user account', async () => {
    const name = 'User';
    const image = 'https://example.com/image.png';

    await program.methods
      .createUser({
        name,
        image,
      })
      .accounts({
        authority: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();

    const userPda = getUserPda(wallet.publicKey);
    const userAcc = await fetchUserAcc(program, userPda);

    expect(userAcc.authority).toStrictEqual(wallet.publicKey);
    expect(userAcc.name).toBe(name);
    expect(userAcc.image).toBe(image);
  });

  test('throws if name is too long', async () => {
    const name = '_'.repeat(MAX_USER_NAME_LENGTH);
    const image = 'https://example.com/image.png';

    try {
      await program.methods
        .createUser({
          name,
          image,
        })
        .accounts({
          authority: wallet.publicKey,
        })
        .signers([wallet])
        .rpc();
    } catch (err) {
      expectAnchorError(err, 'UserNameTooLong');
    }
  });

  test('throws if image is too long', async () => {
    const name = 'User';
    const image = '_'.repeat(MAX_USER_IMAGE_LENGTH);

    try {
      await program.methods
        .createUser({
          name,
          image,
        })
        .accounts({
          authority: wallet.publicKey,
        })
        .signers([wallet])
        .rpc();
    } catch (err) {
      expectAnchorError(err, 'UserImageTooLong');
    }
  });
});

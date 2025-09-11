import { AnchorError, Program } from '@coral-xyz/anchor';
import { BankrunProvider } from 'anchor-bankrun';
import { beforeEach, describe, expect, test } from 'bun:test';
import { ProgramTestContext } from 'solana-bankrun';
import { Ruma } from '../../target/types/ruma';
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { getBankrunSetup } from '../setup';
import { fetchUserAcc } from '../accounts';
import { getUserPda } from '../pda';
import { MAX_USER_IMAGE_LENGTH, MAX_USER_NAME_LENGTH } from '../constants';

describe('createUser', () => {
  let { context, provider, program } = {} as {
    context: ProgramTestContext;
    provider: BankrunProvider;
    program: Program<Ruma>;
  };

  const wallet = Keypair.generate();

  beforeEach(async () => {
    ({ context, provider, program } = await getBankrunSetup([
      {
        address: wallet.publicKey,
        info: {
          data: new Uint8Array(Buffer.alloc(0)),
          executable: false,
          owner: SystemProgram.programId,
          lamports: LAMPORTS_PER_SOL,
        },
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
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('UserNameTooLong');
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
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('UserImageTooLong');
    }
  });
});

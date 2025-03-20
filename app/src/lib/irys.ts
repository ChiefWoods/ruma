import { CONNECTION, RUMA_WALLET } from '@/lib/constants';
import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';
import bs58 from 'bs58';

const irysUploader = await Uploader(Solana)
  .withWallet(bs58.encode(RUMA_WALLET.secretKey))
  .withRpc(CONNECTION.rpcEndpoint)
  .devnet();

export async function upload(file: File) {
  const price = await irysUploader.getPrice(file.size);
  await irysUploader.fund(price);

  const receipt = await irysUploader.upload(
    Buffer.from(await file.arrayBuffer()),
    {
      tags: [
        {
          name: 'Content-Type',
          value: file.type,
        },
        {
          name: 'Name',
          value: file.name,
        },
      ],
    }
  );

  const link = `https://gateway.irys.xyz/${receipt.id}`;
  console.log(`Uploaded to ${link}`);

  return link;
}

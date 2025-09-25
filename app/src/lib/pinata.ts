import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataGateway: process.env.PINATA_GATEWAY,
  pinataJwt: process.env.PINATA_JWT,
});

export async function upload(file: File) {
  try {
    const { cid } = await pinata.upload.public.file(file);

    return cid;
  } catch (err) {
    console.error(err);
    throw new Error((err as Error).message);
  }
}

export async function get(cid: string) {
  try {
    const { data, contentType } = await pinata.gateways.public.get(cid);

    return { data, contentType };
  } catch (err) {
    console.error(err);
    throw new Error((err as Error).message);
  }
}

export function getUrl(cid: string) {
  return `${process.env.PINATA_GATEWAY}/ipfs/${cid}`;
}

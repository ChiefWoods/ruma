import { SURFPOOL_RPC_URL } from './constants';

export enum TimeTravelConfig {
  Epoch = 'absoluteEpoch',
  Slot = 'absoluteSlot',
  Timestamp = 'absoluteTimestamp',
}

export class Surfpool {
  static async setAccount({
    publicKey,
    data = null,
    executable = null,
    lamports = null,
    owner = null,
    rentEpoch = null,
  }: {
    publicKey: string;
    data?: string;
    executable?: boolean;
    lamports?: number;
    owner?: string;
    rentEpoch?: number;
  }) {
    await fetch(SURFPOOL_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: crypto.randomUUID(),
        method: 'surfnet_setAccount',
        params: [
          publicKey,
          {
            data,
            executable,
            lamports,
            owner,
            rentEpoch,
          },
        ],
      }),
    });
  }

  static async timeTravel({
    config,
    value,
  }: {
    config: TimeTravelConfig;
    value: number;
  }) {
    await fetch(SURFPOOL_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: crypto.randomUUID(),
        method: 'surfnet_timeTravel',
        params: [
          {
            [config]: value,
          },
        ],
      }),
    });
  }
}

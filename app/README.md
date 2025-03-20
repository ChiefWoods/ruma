## Setting up `client/`

> [!IMPORTANT]
> Navigate to `client/` before running any of the following commands. <br>
> Remember to run `bun i` to install all the dependencies.

#### 1. Update the `.env` file

```bash
cp .env.example .env.development
```

Replace the values in the `.env.development` file with your own.

- `NEXT_PUBLIC_RUMA_WALLET` is the private keypair of Solana wallet.
- `NEXT_PUBLIC_RPC_URL` is the RPC URL of Solana network.
  - For local deployment, use `http://localhost:8899` by default. <br> Or check local URL by running `solana config get` in `anchor/`.
  - For devnet deployment, acquire the RPC URL from online providers. <br> Or use `https://api.devnet.solana.com` by default.
- `NEXT_PUBLIC_RPC_CLUSTER` is the cluster of the Solana network.
  - `localnet` if you deployed the program locally.
  - `devnet` if you deployed the program on the devnet.

#### 2. Run the client

```bash
bun run dev
```

> [!WARNING]
> Make sure you ran `bun run sync` in `anchor/` before running the client.

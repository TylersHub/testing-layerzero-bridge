# LayerZero Testnet Bridge Setup Guide

This repository is meant to help you set up and test a LayerZero bridge flow on testnets.

The goal is simple:

1. Set up a wallet.
2. Fund it with testnet ETH.
3. Deploy bridge contracts.
4. Wire the contracts together.
5. Send test tokens from Sepolia to Arbitrum Sepolia and back.

## Read This First

As of March 27, 2026, the checked-in `contracts/` workspace is still a sample Hardhat `Counter` project, not a finished OFT bridge implementation. That means:

- this repo is not yet ready for a full end-to-end LayerZero bridge test as-is
- the wallet, faucet, environment, and deployment steps below are the correct setup flow
- the bridge-specific commands only make sense after the contracts workspace contains a real LayerZero OFT contract and related config

If you use this README as your guide, treat it as the clean setup checklist for getting ready to test the bridge properly.

## What You Need

- MetaMask or another EVM wallet
- Node.js 18+
- npm
- Sepolia ETH for gas
- Arbitrum Sepolia ETH for gas
- a wallet address you control
- RPC URLs for Sepolia and Arbitrum Sepolia
- a private key for the wallet you will deploy from

## Your Wallet Address

Anywhere you see `0xYourAddress`, replace it with your actual wallet address from MetaMask.

To find it in MetaMask:

1. Open MetaMask.
2. Click your account name at the top.
3. Copy the address shown there.

That copied `0x...` value is your wallet address.

## Networks You Should Have In MetaMask

You need both of these testnets:

- `Sepolia`
- `Arbitrum Sepolia`

Important:

- Sepolia gas is paid in Sepolia ETH.
- Arbitrum Sepolia gas is paid in Arbitrum Sepolia ETH.
- You should keep some ETH on both networks.

## If You Do Not Have Arbitrum Sepolia ETH Yet

That is normal. You have a few options:

1. Use an Arbitrum Sepolia faucet.
2. Use a provider faucet that supports Arbitrum Sepolia.
3. If needed, bridge test ETH from Sepolia to Arbitrum Sepolia using the official Arbitrum bridge.

## Faucet Checklist

Before you try to deploy or bridge anything, fund the same wallet address on both networks.

### Sepolia ETH

Try one of these:

- Alchemy Sepolia faucet
- Infura Sepolia faucet
- QuickNode Sepolia faucet
- Ethereum Ecosystem faucet

### Arbitrum Sepolia ETH

Try one of these:

- Alchemy Arbitrum Sepolia faucet
- QuickNode Arbitrum Sepolia faucet
- Chainlink Arbitrum Sepolia faucet

### Backup Option

If faucets are rate-limited or unavailable, try the official Arbitrum bridge:

- bridge Sepolia ETH to Arbitrum Sepolia

## Before You Run Commands

Make sure all of the following are true:

- your wallet is set up in MetaMask
- you copied your wallet address
- your wallet has Sepolia ETH
- your wallet has Arbitrum Sepolia ETH
- you know which wallet private key you want to use for deployment

## Project Structure

```text
testing-layerzero-bridge/
|-- contracts/   Hardhat workspace
`-- web-app/     optional frontend folder
```

## Setup

Open a terminal in the repo root, then move into `contracts/`.

```powershell
cd contracts
```

## Install Dependencies

Because of the current dependency state in this repo, plain `npm install` may fail with peer dependency resolution errors.

Use:

```powershell
npm install --legacy-peer-deps
```

## Environment Variables

Create or update `contracts/.env` with your values:

```env
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
SEPOLIA_RPC=https://your-sepolia-rpc-url
ARBITRUM_SEPOLIA_RPC=https://your-arbitrum-sepolia-rpc-url
```

You can also use these variable names if your config expects them:

```env
RPC_URL_SEPOLIA=https://your-sepolia-rpc-url
RPC_URL_ARBITRUM_SEPOLIA=https://your-arbitrum-sepolia-rpc-url
```

Notes:

- use a test wallet, not your main wallet
- never commit `.env`
- the deploying wallet needs test ETH on both networks

## Hardhat Network Values

These are the values you are working with:

### Sepolia

- Chain ID: `11155111`
- LayerZero Endpoint ID: `40161`

### Arbitrum Sepolia

- Chain ID: `421614`
- LayerZero Endpoint ID: `40231`

## What A Successful Bridge Test Looks Like

For a real LayerZero OFT bridge test, the normal flow is:

1. Compile the contracts.
2. Deploy the OFT to Sepolia.
3. Deploy the OFT to Arbitrum Sepolia.
4. Configure peer connections in `layerzero.config.ts`.
5. Wire the contracts together.
6. Mint test tokens.
7. Send tokens from one chain to the other.
8. Confirm the message and balances updated.

## Compile

Once the contracts workspace contains a real OFT implementation, compile with:

```powershell
npx hardhat compile
```

## Deploy

Deploy to Sepolia:

```powershell
npx hardhat lz:deploy --network sepolia
```

Deploy to Arbitrum Sepolia:

```powershell
npx hardhat lz:deploy --network arbitrumSepolia
```

Deployment artifacts are usually written under a `deployments/` directory inside the contracts workspace.

## Wire The Two Contracts Together

After both contracts are deployed, define them in `layerzero.config.ts`.

Example shape:

```ts
const sepolia = { contract: "MyOFT", eid: 40161 };
const arbSepolia = { contract: "MyOFT", eid: 40231 };

export default {
  contracts: [sepolia, arbSepolia],
  connections: [
    { from: sepolia, to: arbSepolia },
    { from: arbSepolia, to: sepolia },
  ],
};
```

Then wire peers:

```powershell
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

If supported by your project setup, verify peers:

```powershell
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```

## Mint Test Tokens

If your OFT project includes a mint task, mint to your own wallet address:

```powershell
npx hardhat mint --network sepolia --to 0xYourAddress --amount 1000
```

Replace `0xYourAddress` with the address you copied from MetaMask.

## Send Tokens Across The Bridge

### Sepolia to Arbitrum Sepolia

```powershell
npx hardhat lz:oft:send --src-eid 40161 --dst-eid 40231 --amount 10 --to 0xYourAddress
```

### Arbitrum Sepolia to Sepolia

```powershell
npx hardhat lz:oft:send --src-eid 40231 --dst-eid 40161 --amount 10 --to 0xYourAddress
```

Use your own wallet address for `--to` if you want to bridge to yourself.

## How To Verify The Bridge Worked

Check all three of these:

1. The transaction succeeded on the source chain.
2. The LayerZero message appears in LayerZero Scan.
3. The token balance changes on the destination chain.

Helpful explorers:

- Sepolia Etherscan
- Arbitrum Sepolia explorer
- LayerZero Scan

## Quick Wallet Reality Check

Before testing the bridge, confirm:

- MetaMask is connected to the correct network
- you copied the right wallet address
- you have gas on Sepolia
- you have gas on Arbitrum Sepolia
- your `.env` private key belongs to the same wallet you expect to use

## Common Problems

### I only have Sepolia ETH

You still need Arbitrum Sepolia ETH for destination-chain actions. Use an Arbitrum Sepolia faucet or the Arbitrum bridge.

### My command says `0xYourAddress`

That is just a placeholder. Replace it with your actual wallet address.

### `npm install` fails

Use:

```powershell
npm install --legacy-peer-deps
```

### `npx hardhat compile` or `npx hardhat test` fails immediately

That is currently expected in this repo until the LayerZero bridge contracts and dependency issues are fully fixed.

## Recommended Order For A First Successful Test

1. Set up MetaMask.
2. Add Sepolia and Arbitrum Sepolia.
3. Copy your wallet address.
4. Get Sepolia ETH.
5. Get Arbitrum Sepolia ETH.
6. Fill in `contracts/.env`.
7. Install dependencies in `contracts/`.
8. Make sure the contracts workspace contains a real LayerZero OFT project.
9. Compile.
10. Deploy to both networks.
11. Wire the peers.
12. Mint test tokens.
13. Send tokens across the bridge.
14. Verify the message and balances.

## Useful Links

- MetaMask network setup: https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/
- Ethereum testnet overview and faucet list: https://ethereum.org/developers/docs/networks/
- LayerZero OFT quickstart: https://docs.layerzero.network/v2/developers/evm/oft/quickstart
- LayerZero network setup guide: https://docs.layerzero.network/v2/get-started/create-lz-oapp/adding-networks
- Arbitrum bridge: https://bridge.arbitrum.io/
- LayerZero Scan: https://layerzeroscan.com/

## Current Repo Status

Right now this repo still needs actual bridge contracts before the full test flow can succeed.

The wallet and funding steps in this README are still the correct first steps, and they are the exact steps you should finish before attempting deployment.

# LayerZero OFT Bridge Test Guide

This repo now contains a minimal LayerZero OFT setup for testing token bridging between:

- `Sepolia`
- `Arbitrum Sepolia`

The flow is:

1. Set up MetaMask.
2. Fund the same wallet on both testnets.
3. Configure `contracts/.env`.
4. Install dependencies.
5. Compile and test locally.
6. Deploy `MyOFT` to both chains.
7. Wire the peers together.
8. Mint test tokens.
9. Bridge tokens across chains.

## What This Repo Contains

```text
testing-layerzero-bridge/
|-- contracts/
|   |-- contracts/MyOFT.sol
|   |-- deploy/MyOFT.ts
|   |-- layerzero.config.ts
|   `-- tasks/
`-- web-app/   optional frontend folder
```

## Prerequisites

- MetaMask or another EVM wallet
- Node.js 18+
- npm
- Sepolia ETH for gas
- Arbitrum Sepolia ETH for gas
- Sepolia RPC URL
- Arbitrum Sepolia RPC URL

## Your Wallet Address

Anywhere you see `0xYourAddress`, replace it with your MetaMask wallet address.

This is the same `0x...` public address you use for:

- faucets
- minting test tokens to yourself
- receiving bridged tokens

## Networks

You should have these networks available in MetaMask:

- `Sepolia`
- `Arbitrum Sepolia`

Network values used in this repo:

### Sepolia

- Chain ID: `11155111`
- LayerZero Endpoint ID: `40161`

### Arbitrum Sepolia

- Chain ID: `421614`
- LayerZero Endpoint ID: `40231`

## Get Testnet ETH

You need gas on both chains before deploying or bridging.

### Sepolia ETH

Try:

- Alchemy Sepolia faucet
- Infura Sepolia faucet
- QuickNode Sepolia faucet
- Ethereum ecosystem faucet list

### Arbitrum Sepolia ETH

Try:

- Alchemy Arbitrum Sepolia faucet
- QuickNode Arbitrum Sepolia faucet
- Chainlink faucet

If faucet access is limited, bridge test ETH from Sepolia with the official Arbitrum bridge.

## Setup

Open a terminal in the repo root:

```powershell
cd contracts
```

## Install Dependencies

Use:

```powershell
npm install --legacy-peer-deps
```

## Environment Variables

Copy `contracts/.env.example` to `contracts/.env`, then fill in your values:

```env
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
SEPOLIA_RPC=https://your-sepolia-rpc-url
ARBITRUM_SEPOLIA_RPC=https://your-arbitrum-sepolia-rpc-url
ETH_WALLET_ADDRESS=0xYOUR_PUBLIC_WALLET_ADDRESS
```

Notes:

- `PRIVATE_KEY` is the deployer key
- `ETH_WALLET_ADDRESS` is optional convenience only
- the config accepts either `SEPOLIA_RPC` / `ARBITRUM_SEPOLIA_RPC` or `RPC_URL_SEPOLIA` / `RPC_URL_ARBITRUM_SEPOLIA`
- the deployer wallet must be funded on both chains

## Verify The Project Locally

Compile:

```powershell
npx hardhat compile
```

Run the local tests:

```powershell
npx hardhat test
```

## Deploy The OFT

Deploy to Sepolia:

```powershell
npx hardhat lz:deploy --network sepolia --tags MyOFT
```

Deploy to Arbitrum Sepolia:

```powershell
npx hardhat lz:deploy --network arbitrumSepolia --tags MyOFT
```

Deployment files will be written under:

```text
contracts/deployments/sepolia/
contracts/deployments/arbitrumSepolia/
```

## Wire The Two Contracts

This repo already includes `contracts/layerzero.config.ts` for:

- Sepolia <-> Arbitrum Sepolia

Wire the contracts:

```powershell
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

Optionally inspect peers/config:

```powershell
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```

## Mint Test Tokens

Mint tokens to your wallet on Sepolia:

```powershell
npx hardhat mint --network sepolia --to 0xYourAddress --amount 1000
```

You can also mint on Arbitrum Sepolia if you want to test both directions:

```powershell
npx hardhat mint --network arbitrumSepolia --to 0xYourAddress --amount 1000
```

## Bridge Tokens

### Sepolia -> Arbitrum Sepolia

```powershell
npx hardhat lz:oft:send --src-eid 40161 --dst-eid 40231 --amount 10 --to 0xYourAddress
```

### Arbitrum Sepolia -> Sepolia

```powershell
npx hardhat lz:oft:send --src-eid 40231 --dst-eid 40161 --amount 10 --to 0xYourAddress
```

The send task prints:

- the LayerZero Scan URL
- the source transaction hash or explorer link

## How To Confirm It Worked

Check these:

1. The source-chain transaction succeeded.
2. The message appears on LayerZero Scan.
3. The destination-chain balance updates.

Helpful links:

- Sepolia explorer
- Arbitrum Sepolia explorer
- LayerZero Scan

## Recommended First End-To-End Test

1. Fund the same wallet on Sepolia and Arbitrum Sepolia.
2. Fill in `contracts/.env`.
3. Run `npm install --legacy-peer-deps`.
4. Run `npx hardhat compile`.
5. Run `npx hardhat test`.
6. Deploy `MyOFT` on Sepolia.
7. Deploy `MyOFT` on Arbitrum Sepolia.
8. Run the wire command.
9. Mint tokens to your own wallet on Sepolia.
10. Send a small amount, like `1` or `10`, to your own wallet on Arbitrum Sepolia.
11. Confirm the message on LayerZero Scan.

## Common Problems

### I only have Sepolia ETH

You still need Arbitrum Sepolia ETH for gas on the destination chain.

### `0xYourAddress` is in the command

That is a placeholder. Replace it with your real wallet address.

### `npm install` fails

Use:

```powershell
npm install --legacy-peer-deps
```

### My private key does not start with `0x`

This repo normalizes it automatically, but using the `0x...` format is still recommended.

## Useful Links

- MetaMask network setup: https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/
- Ethereum testnet overview: https://ethereum.org/developers/docs/networks/
- LayerZero OFT quickstart: https://docs.layerzero.network/v2/developers/evm/oft/quickstart
- LayerZero network setup guide: https://docs.layerzero.network/v2/get-started/create-lz-oapp/adding-networks
- Arbitrum bridge: https://bridge.arbitrum.io/
- LayerZero Scan: https://layerzeroscan.com/

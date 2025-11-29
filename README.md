# LayerZero Bridge Demo (OFT v2)

This project demonstrates how to use the **LayerZero v2 Bridging SDK** with a simple **demo dapp**.  
It includes:

- **Contracts (`contracts/`)** → Hardhat + TypeScript + Solidity project that deploys Omnichain Fungible Token (OFT v2) contracts.
- **Frontend (`web/`)** → Next.js + wagmi + RainbowKit + LayerZero SDK demo app to send tokens across chains.
- **Setup scripts and configs** to run everything with **pnpm** on Windows + VS Code.

---

## 📦 Prerequisites

- Windows + [VS Code](https://code.visualstudio.com/)
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
  ```powershell
  npm i -g pnpm
  ```

# LayerZero V2 OFT Bridging – Project README

This project demonstrates how to deploy, configure, and test a **LayerZero V2 Omnichain Fungible Token (OFT)** between **Ethereum Sepolia** and **Arbitrum Sepolia** using **Hardhat**.

## 📁 Project Structure

```
testing-layerzero-bridge/
├── contracts/     # Hardhat workspace for OFT + LayerZero tasks
└── web/           # (optional) frontend UI (React/Vite)
```

# 🚀 1. Setup & Installation

## Install dependencies (inside /contracts)

### npm (recommended on Windows)

```
npm install
npm install --save-dev @layerzerolabs/devtools-evm @layerzerolabs/toolbox-hardhat tsx typescript fp-ts
```

### pnpm

```
pnpm install
pnpm add -D @layerzerolabs/devtools-evm @layerzerolabs/toolbox-hardhat tsx typescript fp-ts
```

## Environment variables (.env)

```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
RPC_URL_SEPOLIA=https://...
RPC_URL_ARBITRUM_SEPOLIA=https://...
```

## hardhat.config.ts should include:

```ts
import "@layerzerolabs/devtools-evm";
import "@layerzerolabs/toolbox-hardhat";
import "dotenv/config";
```

---

# 🧱 2. Compile Contracts

```
npx hardhat compile
```

---

# 🌐 3. Deploy Contracts

## Sepolia

```
npx hardhat lz:deploy --network sepolia
```

## Arbitrum Sepolia

```
npx hardhat lz:deploy --network arbitrumSepolia
```

Deployment results appear in:

```
contracts/deployments/<network>/
```

---

# 🔗 4. Wire OFT Contracts

Edit `layerzero.config.ts`:

```ts
const sepolia = { contract: "MyOFT", eid: 40161 };
const arbSep = { contract: "MyOFT", eid: 40231 };

export default {
  contracts: [sepolia, arbSep],
  connections: [
    { from: sepolia, to: arbSep },
    { from: arbSep, to: sepolia },
  ],
};
```

## Wire peers

```
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

## Verify peers

```
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```

---

# 🪙 5. Mint Test Tokens

If your scaffold includes a mint task:

```
npx hardhat mint --network sepolia --to 0xYourAddress --amount 1000
```

---

# 🔁 6. Bridge Tokens

## Sepolia → Arbitrum Sepolia

```
npx hardhat lz:oft:send --src-eid 40161 --dst-eid 40231 --amount 10 --to 0xYourAddress
```

## Arbitrum Sepolia → Sepolia

```
npx hardhat lz:oft:send --src-eid 40231 --dst-eid 40161 --amount 10 --to 0xYourAddress
```

The CLI will quote fees, send transactions, and provide a message ID.

---

# 📡 7. Verify Bridging

## LayerZero Scan

Track your message:

```
https://layerzeroscan.com
```

## Check your balances

- Sepolia: https://sepolia.etherscan.io
- Arbitrum Sepolia: https://sepolia.arbiscan.io

---

# 🌐 8. MetaMask Networks

## Sepolia

- Chain ID: **11155111**
- RPC: https://rpc.sepolia.org

## Arbitrum Sepolia

- Chain ID: **421614**
- RPC: https://sepolia-rollup.arbitrum.io/rpc

## Test ETH Faucets

- Sepolia: https://sepoliafaucet.com
- Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia
- Or bridge Sepolia → Arbitrum Sepolia at https://bridge.arbitrum.io

---

# 🧪 9. Quick Command Reference

### Compile

```
npx hardhat compile
```

### Deploy

```
npx hardhat lz:deploy --network sepolia
npx hardhat lz:deploy --network arbitrumSepolia
```

### Wire

```
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```

### Mint

```
npx hardhat mint --network sepolia --to 0xYourAddr --amount 1000
```

### Bridge

```
npx hardhat lz:oft:send --src-eid 40161 --dst-eid 40231 --amount 10 --to 0xYourAddr
npx hardhat lz:oft:send --src-eid 40231 --dst-eid 40161 --amount 10 --to 0xYourAddr
```

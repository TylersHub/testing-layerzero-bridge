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

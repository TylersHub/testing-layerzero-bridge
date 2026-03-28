# Contracts Workspace

This folder contains the Hardhat workspace for the LayerZero OFT bridge example.

If you are looking for:

- setup and run instructions, see the root [README.md](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/README.md)
- architecture and concept explanations, see [how-it-works.md](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/how-it-works.md)
- recorded testnet transaction history, see [transactions.md](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/transactions.md)

## What Is In This Folder

- [contracts/MyOFT.sol](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/contracts/MyOFT.sol)
  The omnichain fungible token contract used for bridge testing.

- [deploy/MyOFT.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/deploy/MyOFT.ts)
  The deployment script for Sepolia and Arbitrum Sepolia.

- [layerzero.config.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/layerzero.config.ts)
  The LayerZero pathway and peer wiring configuration.

- [tasks/](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/tasks)
  Custom Hardhat tasks for minting and cross-chain sending.

- [scripts/bridge-workflow.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/scripts/bridge-workflow.ts)
  A convenience automation wrapper for the most common workflow steps.

## Main Commands

Run these from the `contracts` directory.

### Manual Hardhat Commands

```powershell
npx hardhat compile
npx hardhat test
npx hardhat lz:deploy --network sepolia --tags MyOFT
npx hardhat lz:deploy --network arbitrumSepolia --tags MyOFT
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
npx hardhat mint --network sepolia --to 0xYourAddress --amount 1000
npx hardhat lz:oft:send --src-eid 40161 --dst-eid 40231 --amount 10 --to 0xYourAddress
```

### Package Scripts

```powershell
npm run compile
npm run test
npm run deploy:sepolia
npm run deploy:arbitrum
npm run deploy:all
npm run wire
npm run peers
```

### Automation Helper

```powershell
npm run bridge:prepare
npm run mint:sepolia
npm run mint:arbitrum
npm run send:s2a
npm run send:a2s
```

## Notes

- This workspace is configured for `Sepolia` and `Arbitrum Sepolia`.
- The wallet and RPC values are read from `contracts/.env`.
- `mint()` exists for testnet convenience and should not be treated as production token logic.

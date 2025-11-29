import "@layerzerolabs/devtools-evm";
import "@layerzerolabs/toolbox-hardhat";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

const PK = process.env.PRIVATE_KEY ?? "";
const SEPOLIA_RPC = process.env.SEPOLIA_RPC ?? process.env.RPC_URL_SEPOLIA ?? "";
const ARB_SEPOLIA_RPC = process.env.ARBITRUM_SEPOLIA_RPC ?? process.env.RPC_URL_ARBITRUM_SEPOLIA ?? "";

const accounts = PK ? [PK] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  // defaultNetwork: "sepolia", // optional
  networks: {
    // built-in "hardhat" stays implicit
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC,
      chainId: 11155111,
      accounts,
      eid: 40161, // <-- LayerZero Endpoint ID (Ethereum Sepolia)
    },
    arbitrumSepolia: {
      type: "http",
      url: ARB_SEPOLIA_RPC,
      chainId: 421614,
      accounts,
      eid: 40231, // <-- LayerZero Endpoint ID (Arbitrum Sepolia)
    },
  },
};

export default config;

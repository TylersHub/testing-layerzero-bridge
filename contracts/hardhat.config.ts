import "@layerzerolabs/toolbox-hardhat";
import "@nomiclabs/hardhat-ethers";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";

const PK = process.env.PRIVATE_KEY ?? "";
const SEPOLIA_RPC = process.env.SEPOLIA_RPC ?? process.env.RPC_URL_SEPOLIA ?? "";
const ARB_SEPOLIA_RPC = process.env.ARBITRUM_SEPOLIA_RPC ?? process.env.RPC_URL_ARBITRUM_SEPOLIA ?? "";

const accounts = PK ? [PK] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC,
      chainId: 11155111,
      accounts
      // eid: 40161  // okay as a comment; don't rely on Hardhat reading it
    },
    arbitrumSepolia: {
      url: ARB_SEPOLIA_RPC,
      chainId: 421614,
      accounts
      // eid: 40231
    }
  }
};

export default config;

import "hardhat/types/config";

declare module "hardhat/types/config" {
  interface HttpNetworkUserConfig { eid?: number }
  interface HttpNetworkConfig { eid?: number }
  interface HardhatNetworkUserConfig { eid?: number }
  interface HardhatNetworkConfig { eid?: number }
}

export {};

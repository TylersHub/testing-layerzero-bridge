import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'

import { EndpointId } from '@layerzerolabs/lz-definitions'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import './tasks'

const normalizePrivateKey = (value?: string) => {
    if (!value) return undefined
    return value.startsWith('0x') ? value : `0x${value}`
}

const MNEMONIC = process.env.MNEMONIC
const PRIVATE_KEY = normalizePrivateKey(process.env.PRIVATE_KEY)

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        sepolia: {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            chainId: 11155111,
            url: process.env.SEPOLIA_RPC ?? process.env.RPC_URL_SEPOLIA ?? 'https://sepolia.drpc.org',
            accounts,
        },
        arbitrumSepolia: {
            eid: EndpointId.ARBSEP_V2_TESTNET,
            chainId: 421614,
            url:
                process.env.ARBITRUM_SEPOLIA_RPC ??
                process.env.RPC_URL_ARBITRUM_SEPOLIA ??
                'https://arbitrum-sepolia.gateway.tenderly.co',
            accounts,
        },
        hardhat: {
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}

export default config

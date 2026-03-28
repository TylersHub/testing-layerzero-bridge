import path from 'path'

import { endpointIdToNetwork } from '@layerzerolabs/lz-definitions'

import type { OmniPointHardhat } from '@layerzerolabs/devtools-evm-hardhat'
import type { HardhatRuntimeEnvironment } from 'hardhat/types'

export const deploymentMetadataUrl = 'https://metadata.layerzero-api.com/v1/metadata/deployments'

export enum MsgType {
    SEND = 1,
}

export function isEmptyOptionsEvm(optionsHex?: string): boolean {
    return !optionsHex || optionsHex === '0x' || optionsHex === '0x0003'
}

export function getLayerZeroScanLink(txHash: string, isTestnet = false): string {
    const baseUrl = isTestnet ? 'https://testnet.layerzeroscan.com' : 'https://layerzeroscan.com'
    return `${baseUrl}/tx/${txHash}`
}

export async function getBlockExplorerLink(srcEid: number, txHash: string): Promise<string | undefined> {
    const network = endpointIdToNetwork(srcEid)
    const res = await fetch(deploymentMetadataUrl)
    if (!res.ok) return undefined

    const all = (await res.json()) as Record<string, { blockExplorers?: { url: string }[] }>
    const explorer = all[network]?.blockExplorers?.[0]?.url
    return explorer ? `${explorer.replace(/\/+$/, '')}/tx/${txHash}` : undefined
}

export async function getOAppInfoByEid(
    eid: number,
    oappConfig: string,
    hre: HardhatRuntimeEnvironment,
    overrideAddress?: string
): Promise<{ address: string; contractName?: string }> {
    if (overrideAddress) {
        return { address: overrideAddress }
    }

    const layerZeroConfig = (await import(path.resolve('./', oappConfig))).default
    const { contracts } = typeof layerZeroConfig === 'function' ? await layerZeroConfig() : layerZeroConfig
    const wrapper = contracts.find((c: { contract: OmniPointHardhat }) => c.contract.eid === eid)
    if (!wrapper) throw new Error(`No config found for EID ${eid}`)

    const contractName = wrapper.contract.contractName
    const address = contractName ? (await hre.deployments.get(contractName)).address : wrapper.contract.address || ''

    return { address, contractName }
}

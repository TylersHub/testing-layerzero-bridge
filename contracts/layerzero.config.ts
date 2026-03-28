import { EndpointId } from '@layerzerolabs/lz-definitions'
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat'

import type { OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'MyOFT',
}

const arbitrumSepoliaContract: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT',
}

const enforcedOptions: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 80000,
        value: 0,
    },
]

const pathways: TwoWayConfig[] = [
    [
        sepoliaContract,
        arbitrumSepoliaContract,
        [['LayerZero Labs'], []],
        [1, 1],
        [enforcedOptions, enforcedOptions],
    ],
]

export default async function () {
    const connections = await generateConnectionsConfig(pathways)

    return {
        contracts: [{ contract: sepoliaContract }, { contract: arbitrumSepoliaContract }],
        connections,
    }
}

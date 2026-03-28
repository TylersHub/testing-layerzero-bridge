import { task, types } from 'hardhat/config'

import { types as cliTypes } from '@layerzerolabs/devtools-evm-hardhat'
import { endpointIdToNetwork } from '@layerzerolabs/lz-definitions'

import { sendEvm } from './sendEvm'
import { getBlockExplorerLink } from './utils'

task('lz:oft:send', 'Sends OFT tokens cross-chain between EVM testnets')
    .addParam('srcEid', 'Source endpoint ID', undefined, types.int)
    .addParam('dstEid', 'Destination endpoint ID', undefined, types.int)
    .addParam('amount', 'Human-readable token amount to send', undefined, types.string)
    .addParam('to', 'Recipient EVM address', undefined, types.string)
    .addOptionalParam('oappConfig', 'Path to the LayerZero config file', 'layerzero.config.ts', types.string)
    .addOptionalParam('minAmount', 'Minimum amount to receive after slippage', undefined, types.string)
    .addOptionalParam(
        'extraLzReceiveOptions',
        'Extra lzReceive options as repeated gas,value pairs',
        undefined,
        cliTypes.csv
    )
    .addOptionalParam('oftAddress', 'Override the deployed source OFT address', undefined, types.string)
    .setAction(async (args, hre) => {
        const result = await sendEvm(args, hre)
        const srcNetwork = endpointIdToNetwork(args.srcEid)
        const dstNetwork = endpointIdToNetwork(args.dstEid)

        console.log(`Sent ${args.amount} OFT from ${srcNetwork} to ${dstNetwork}.`)
        console.log(`LayerZero Scan: ${result.scanLink}`)

        const explorerLink = await getBlockExplorerLink(args.srcEid, result.txHash)
        if (explorerLink) {
            console.log(`Source tx: ${explorerLink}`)
        } else {
            console.log(`Source tx hash: ${result.txHash}`)
        }
    })

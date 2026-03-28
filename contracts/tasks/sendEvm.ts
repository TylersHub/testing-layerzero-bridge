import path from 'path'

import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { OmniPointHardhat, createGetHreByEid } from '@layerzerolabs/devtools-evm-hardhat'
import { createLogger } from '@layerzerolabs/io-devtools'
import { ChainType, endpointIdToChainType } from '@layerzerolabs/lz-definitions'
import { Options, addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'

import { SendResult } from './types'
import { MsgType, getLayerZeroScanLink, isEmptyOptionsEvm } from './utils'

const logger = createLogger()

async function getOAppAddressByEid(
    eid: number,
    oappConfig: string,
    hre: HardhatRuntimeEnvironment,
    overrideAddress?: string
): Promise<string> {
    if (overrideAddress) {
        return overrideAddress
    }

    const layerZeroConfig = (await import(path.resolve('./', oappConfig))).default
    const { contracts } = typeof layerZeroConfig === 'function' ? await layerZeroConfig() : layerZeroConfig
    const wrapper = contracts.find((c: { contract: OmniPointHardhat }) => c.contract.eid === eid)

    if (!wrapper || !wrapper.contract.contractName) {
        throw new Error(`No LayerZero config entry found for EID ${eid}`)
    }

    return (await hre.deployments.get(wrapper.contract.contractName)).address
}

export interface EvmArgs {
    srcEid: number
    dstEid: number
    amount: string
    to: string
    oappConfig: string
    minAmount?: string
    extraLzReceiveOptions?: string[]
    oftAddress?: string
}

export async function sendEvm(
    { srcEid, dstEid, amount, to, oappConfig, minAmount, extraLzReceiveOptions, oftAddress }: EvmArgs,
    hre: HardhatRuntimeEnvironment
): Promise<SendResult> {
    if (endpointIdToChainType(srcEid) !== ChainType.EVM) {
        throw new Error(`Only EVM source chains are supported. Received EID ${srcEid}.`)
    }

    const getHreByEid = createGetHreByEid(hre)
    const srcHre = await getHreByEid(srcEid)
    const dstHre = await getHreByEid(dstEid)
    const signer = (await srcHre.ethers.getSigners())[0]

    const wrapperAddress = await getOAppAddressByEid(srcEid, oappConfig, srcHre, oftAddress)
    const dstWrapperAddress = await getOAppAddressByEid(dstEid, oappConfig, dstHre)

    const oftArtifact = await srcHre.artifacts.readArtifact('OFT')
    const oft = await srcHre.ethers.getContractAt(oftArtifact.abi, wrapperAddress, signer)

    const underlying = await oft.token()
    const erc20 = await srcHre.ethers.getContractAt('ERC20', underlying, signer)
    const decimals: number = await erc20.decimals()
    const amountLD: BigNumber = parseUnits(amount, decimals)
    const minAmountLD: BigNumber = parseUnits(minAmount ?? amount, decimals)

    try {
        const approvalRequired = await oft.approvalRequired()
        if (approvalRequired) {
            const currentAllowance = await erc20.allowance(signer.address, wrapperAddress)
            if (currentAllowance.lt(amountLD)) {
                const approvalTx = await erc20.approve(wrapperAddress, amountLD)
                await approvalTx.wait()
            }
        }
    } catch {
        logger.info('Approval not required for direct OFT token.')
    }

    let options = Options.newOptions()
    if (extraLzReceiveOptions && extraLzReceiveOptions.length > 0) {
        if (extraLzReceiveOptions.length % 2 !== 0) {
            throw new Error('extraLzReceiveOptions must be provided as gas,value pairs.')
        }

        for (let i = 0; i < extraLzReceiveOptions.length; i += 2) {
            options = options.addExecutorLzReceiveOption(
                extraLzReceiveOptions[i],
                extraLzReceiveOptions[i + 1] ?? 0
            )
        }
    }

    const extraOptions = options.toHex()
    if (isEmptyOptionsEvm(extraOptions)) {
        const enforcedOptions = await oft.enforcedOptions(dstEid, MsgType.SEND)
        if (isEmptyOptionsEvm(enforcedOptions)) {
            throw new Error(
                'No extra options were provided and no enforced options are configured. Wire the contracts first or pass receive gas options.'
            )
        }
    }

    const sendParam = {
        dstEid,
        to: addressToBytes32(to),
        amountLD: amountLD.toString(),
        minAmountLD: minAmountLD.toString(),
        extraOptions,
        composeMsg: '0x',
        oftCmd: '0x',
    }

    const endpointDep = await srcHre.deployments.get('EndpointV2')
    const endpoint = new Contract(endpointDep.address, endpointDep.abi, signer)
    const outboundNonce = (await endpoint.outboundNonce(wrapperAddress, dstEid, addressToBytes32(dstWrapperAddress))).add(1)

    logger.info('Quoting LayerZero fees...')
    const msgFee = await oft.quoteSend(sendParam, false)

    let tx: ContractTransaction
    tx = await oft.send(sendParam, msgFee, signer.address, { value: msgFee.nativeFee })
    const receipt = await tx.wait()
    const txHash = receipt.transactionHash

    logger.info(`Send submitted with outbound nonce ${outboundNonce.toString()}.`)

    return {
        txHash,
        scanLink: getLayerZeroScanLink(txHash, srcEid >= 40000 && srcEid < 50000),
    }
}

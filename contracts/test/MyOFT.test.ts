import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('MyOFT', function () {
    const srcEid = 1
    const dstEid = 2

    let oftFactory: ContractFactory
    let endpointFactory: ContractFactory
    let signerA: any
    let signerB: any
    let endpointOwner: any
    let ownerA: string
    let ownerB: string
    let srcOft: Contract
    let dstOft: Contract
    let srcEndpoint: Contract
    let dstEndpoint: Contract

    before(async function () {
        oftFactory = await ethers.getContractFactory('MyOFT')

        ;[signerA, signerB, endpointOwner] = await ethers.getSigners()
        ownerA = signerA.address
        ownerB = signerB.address

        const endpointArtifact = await deployments.getArtifact('EndpointV2Mock')
        endpointFactory = new ContractFactory(endpointArtifact.abi, endpointArtifact.bytecode, endpointOwner)
    })

    beforeEach(async function () {
        srcEndpoint = await endpointFactory.deploy(srcEid)
        dstEndpoint = await endpointFactory.deploy(dstEid)

        srcOft = await oftFactory.deploy('Source OFT', 'SOFT', srcEndpoint.address, ownerA)
        dstOft = await oftFactory.deploy('Destination OFT', 'DOFT', dstEndpoint.address, ownerB)

        await srcEndpoint.setDestLzEndpoint(dstOft.address, dstEndpoint.address)
        await dstEndpoint.setDestLzEndpoint(srcOft.address, srcEndpoint.address)

        await srcOft.connect(signerA).setPeer(dstEid, ethers.utils.zeroPad(dstOft.address, 32))
        await dstOft.connect(signerB).setPeer(srcEid, ethers.utils.zeroPad(srcOft.address, 32))
    })

    it('mints test tokens to the owner', async function () {
        const mintAmount = ethers.utils.parseEther('10')

        await srcOft.mint(ownerA, mintAmount)

        expect((await srcOft.balanceOf(ownerA)).toString()).to.equal(mintAmount.toString())
    })

    it('bridges tokens from source to destination', async function () {
        const startingBalance = ethers.utils.parseEther('100')
        const sendAmount = ethers.utils.parseEther('1')
        const receiveOptions = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex()

        await srcOft.mint(ownerA, startingBalance)

        const sendParam = [
            dstEid,
            ethers.utils.zeroPad(ownerB, 32),
            sendAmount,
            sendAmount,
            receiveOptions,
            '0x',
            '0x',
        ]

        const [nativeFee] = await srcOft.quoteSend(sendParam, false)
        await srcOft.send(sendParam, [nativeFee, 0], ownerA, { value: nativeFee })

        expect((await srcOft.balanceOf(ownerA)).toString()).to.equal(startingBalance.sub(sendAmount).toString())
        expect((await dstOft.balanceOf(ownerB)).toString()).to.equal(sendAmount.toString())
    })
})

import { parseUnits } from 'ethers/lib/utils'
import { task, types } from 'hardhat/config'

task('mint', 'Mints test OFT tokens to a recipient address')
    .addParam('to', 'Recipient wallet address')
    .addParam('amount', 'Human-readable token amount to mint', undefined, types.string)
    .addOptionalParam('contractName', 'Deployment name to mint from', 'MyOFT', types.string)
    .setAction(async ({ amount, contractName, to }, hre) => {
        const deployment = await hre.deployments.get(contractName)
        const [signer] = await hre.ethers.getSigners()
        const contract = await hre.ethers.getContractAt(contractName, deployment.address, signer)
        const decimals = await contract.decimals()
        const amountLD = parseUnits(amount, decimals)

        console.log(`Minting ${amount} ${contractName} tokens to ${to} on ${hre.network.name}...`)

        const tx = await contract.mint(to, amountLD)
        await tx.wait()

        console.log(`Mint complete. Tx hash: ${tx.hash}`)
    })

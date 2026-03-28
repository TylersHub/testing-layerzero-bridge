import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'MyOFT'

const deploy: DeployFunction = async (hre) => {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    const endpointV2Deployment = await deployments.get('EndpointV2')

    const { address } = await deploy(contractName, {
        from: deployer,
        args: ['Bridge Test OFT', 'BTOFT', endpointV2Deployment.address, deployer],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed ${contractName} on ${network.name}: ${address}`)
}

deploy.tags = [contractName]

export default deploy

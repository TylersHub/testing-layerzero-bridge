import 'dotenv/config'

import { spawnSync } from 'child_process'

type NetworkName = 'sepolia' | 'arbitrumSepolia'

const NETWORK_TO_EID: Record<NetworkName, number> = {
    sepolia: 40161,
    arbitrumSepolia: 40231,
}

function fail(message: string): never {
    console.error(message)
    process.exit(1)
}

function run(command: string, args: string[]) {
    console.log(`\n> ${command} ${args.join(' ')}`)
    const result = spawnSync(command, args, {
        stdio: 'inherit',
        shell: true,
        env: process.env,
    })

    if (result.status !== 0) {
        process.exit(result.status ?? 1)
    }
}

function getWalletAddress(explicitAddress?: string) {
    const address = explicitAddress || process.env.ETH_WALLET_ADDRESS
    if (!address) {
        fail('Missing wallet address. Pass one explicitly or set ETH_WALLET_ADDRESS in .env.')
    }
    return address
}

function getAmount(explicitAmount: string | undefined, defaultAmount: string) {
    const amount = explicitAmount || defaultAmount
    if (!amount) {
        fail('Missing amount. Pass an amount argument, for example: npm run mint:sepolia -- 1000')
    }
    return amount
}

function prepare() {
    run('npx', ['hardhat', 'compile'])
    run('npx', ['hardhat', 'test'])
    run('npx', ['hardhat', 'lz:deploy', '--network', 'sepolia', '--tags', 'MyOFT'])
    run('npx', ['hardhat', 'lz:deploy', '--network', 'arbitrumSepolia', '--tags', 'MyOFT'])
    run('npx', ['hardhat', 'lz:oapp:wire', '--oapp-config', 'layerzero.config.ts'])
}

function mint(network: string, explicitAmount?: string, explicitAddress?: string) {
    const amount = getAmount(explicitAmount, '1000')
    const address = getWalletAddress(explicitAddress)

    run('npx', ['hardhat', 'mint', '--network', network, '--to', address, '--amount', amount])
}

function send(srcNetwork: string, dstNetwork: string, explicitAmount?: string, explicitAddress?: string) {
    const amount = getAmount(explicitAmount, '10')
    const address = getWalletAddress(explicitAddress)
    const srcEid = NETWORK_TO_EID[srcNetwork as NetworkName]
    const dstEid = NETWORK_TO_EID[dstNetwork as NetworkName]

    if (!srcEid || !dstEid) {
        fail(`Unknown network mapping: ${srcNetwork} -> ${dstNetwork}`)
    }

    run('npx', [
        'hardhat',
        'lz:oft:send',
        '--src-eid',
        String(srcEid),
        '--dst-eid',
        String(dstEid),
        '--amount',
        amount,
        '--to',
        address,
    ])
}

const [, , action, arg1, arg2, arg3, arg4] = process.argv

switch (action) {
    case 'prepare':
        prepare()
        break
    case 'mint':
        if (!arg1) {
            fail('Usage: npx ts-node scripts/bridge-workflow.ts mint <network> [amount] [walletAddress]')
        }
        mint(arg1, arg2, arg3)
        break
    case 'send':
        if (!arg1 || !arg2) {
            fail(
                'Usage: npx ts-node scripts/bridge-workflow.ts send <srcNetwork> <dstNetwork> [amount] [walletAddress]'
            )
        }
        send(arg1, arg2, arg3, arg4)
        break
    default:
        fail(
            [
                'Unknown action.',
                'Available actions:',
                '  prepare',
                '  mint <network> [amount] [walletAddress]',
                '  send <srcNetwork> <dstNetwork> [amount] [walletAddress]',
            ].join('\n')
        )
}

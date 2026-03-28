# How This Bridge Works

This document explains what the project is doing and how the cross-chain token flow works.

It is intentionally not a setup guide. The step-by-step commands live in the root `README.md`.

## High-Level Idea

This project uses LayerZero to connect two token contracts:

- `MyOFT` on `Sepolia`
- `MyOFT` on `Arbitrum Sepolia`

Those two contracts behave like one token system spread across two chains.

When you send tokens from one chain to the other:

1. tokens are removed from circulation on the source chain
2. a LayerZero message is sent across chains
3. tokens are created on the destination chain

So the token supply moves between chains instead of being duplicated.

## What OFT Means

`OFT` stands for `Omnichain Fungible Token`.

It is LayerZero's token standard for a fungible token that can move between chains while keeping a unified supply model.

In this repo, `MyOFT` is the actual token contract that uses the OFT standard.

## What OApp Means

`OApp` stands for `Omnichain Application`.

It is the broader LayerZero pattern for an application that sends and receives cross-chain messages.

Relationship:

- `OApp` = the general messaging application model
- `OFT` = a token-specific implementation built on top of that model

So your `MyOFT` contract is an OApp-based token bridge.

## The Main Contract

The core contract is:

- [MyOFT.sol](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/contracts/MyOFT.sol)

It does three important things:

1. It inherits from LayerZero's `OFT` contract.
2. It sets the LayerZero endpoint and contract owner during deployment.
3. It exposes a testnet-only `mint()` function so you can create tokens for bridge testing.

Important detail:

- `mint()` is only for convenience on testnets
- in a production token, minting rules would need to be much stricter

## Why There Are Two Deployments

You deploy `MyOFT` once on each chain:

- one deployment on Sepolia
- one deployment on Arbitrum Sepolia

These are two separate contracts on two separate chains.

They become one cross-chain token system only after they are wired together.

## What "Wiring" Means

Wiring is the process of configuring each contract so it trusts the matching contract on the other chain.

That configuration is driven by:

- [layerzero.config.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/layerzero.config.ts)

Wiring tells LayerZero:

- which contract on Sepolia talks to which contract on Arbitrum Sepolia
- which endpoint IDs are involved
- what message execution settings to enforce
- which verification path to use

Without wiring:

- both contracts may be deployed
- but they do not yet trust each other as peers
- cross-chain sends will not behave correctly

## Endpoint IDs

LayerZero identifies chains with endpoint IDs, often called `EIDs`.

In this project:

- `40161` = Sepolia
- `40231` = Arbitrum Sepolia

These endpoint IDs are what the send command uses to describe the source chain and destination chain.

## What `layerzero.config.ts` Is Doing

That file defines:

1. the Sepolia contract identity
2. the Arbitrum Sepolia contract identity
3. the pathway between them
4. the enforced execution options

The enforced option in this repo is:

- `LZ_RECEIVE` gas = `80000`

That means the destination chain should reserve that execution budget for handling the inbound LayerZero token message.

## Why Execution Options Matter

Cross-chain delivery is not just "send bytes and hope."

The destination chain still needs gas to process the inbound message.

That is why LayerZero uses execution options:

- they describe how much execution budget is needed on the destination side
- the sender pays the corresponding messaging cost on the source chain

If these options are wrong or missing:

- fee quoting may fail
- delivery may fail
- the message may not execute properly on the destination chain

## What Happens During Deployment

Deployment is handled by:

- [deploy/MyOFT.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/deploy/MyOFT.ts)

During deployment, the script:

1. gets the deployer account
2. looks up the LayerZero `EndpointV2` deployment for that network
3. deploys `MyOFT`
4. passes:
   - token name
   - token symbol
   - the local endpoint address
   - the owner/delegate address

So each chain gets its own local OFT instance connected to its local LayerZero endpoint.

## What Happens During Minting

Minting is handled by:

- [tasks/mint.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/tasks/mint.ts)

The mint task:

1. finds the deployed `MyOFT` contract for the selected network
2. converts the human-readable amount into token units
3. calls `mint(to, amount)`

This is just normal token creation on one chain.

It does not bridge anything by itself.

## What Happens During A Bridge Send

Cross-chain sending is handled by:

- [tasks/sendOFT.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/tasks/sendOFT.ts)
- [tasks/sendEvm.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/tasks/sendEvm.ts)

The send flow is:

1. resolve the source OFT contract
2. resolve the destination OFT contract
3. normalize the token amount using token decimals
4. build the LayerZero send parameters
5. quote the LayerZero messaging fee
6. send the transaction on the source chain
7. wait for the LayerZero message to be delivered
8. receive/mint tokens on the destination chain

## What Actually Happens To Tokens During A Send

Conceptually:

- on the source chain, tokens are debited from the sender
- a LayerZero message carries the transfer intent to the destination chain
- on the destination chain, the OFT credits the recipient

This is why OFT behaves like a single token across multiple chains instead of two unrelated tokens.

## Why The Same Wallet Address Works On Both Chains

Your MetaMask `Ethereum` address is the same account identity across EVM chains.

That means the same `0x...` wallet address can:

- hold Sepolia ETH on Sepolia
- hold Arbitrum Sepolia ETH on Arbitrum Sepolia
- receive `MyOFT` on either chain

The address does not change.

What changes is:

- the chain you are connected to
- the balances visible on that chain
- the contracts deployed on that chain

## What The Transaction Hash Represents

A transaction hash is the unique ID of a specific on-chain transaction.

Examples:

- a deploy transaction hash identifies the deployment transaction
- a mint transaction hash identifies the mint transaction
- a send transaction hash identifies the source-chain transaction that initiated the bridge transfer

Important distinction:

- the source-chain transaction hash is not the whole cross-chain story
- LayerZero also creates a cross-chain message that you can track separately in LayerZero Scan

## Where To View Activity

You can inspect activity in three places:

### 1. Source chain explorer

Use this for:

- deployment transactions
- mint transactions
- the original bridge send transaction

Examples:

- Sepolia explorer
- Arbitrum Sepolia explorer

### 2. LayerZero Scan

Use this for:

- the cross-chain message itself
- delivery status
- source and destination linkage

### 3. MetaMask

Use this for:

- checking whether the final token balance changed on the destination chain

## Why You Need Gas On Both Chains

Even if the send starts on only one chain, you still usually want native gas on both networks.

Why:

- the source chain needs gas to submit the bridge send transaction
- the destination chain needs gas for any wallet actions you want to do afterward

Also, real testing is easier when your wallet is already funded on both sides.

## What The Local Tests Prove

The local test file is:

- [test/MyOFT.test.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/test/MyOFT.test.ts)

These tests prove two core behaviors:

1. the contract can mint correctly
2. the OFT message flow can debit on one side and credit on the other in a mocked environment

This does not replace live testnet verification, but it does prove the contract logic and OFT wiring pattern are functioning locally.

## What This Repo Is Really Demonstrating

This project is not a frontend product or a production token system.

It is a focused testnet bridge example showing:

- how to deploy a LayerZero OFT on two chains
- how to wire the peer relationship
- how to mint test tokens
- how to bridge those tokens between Sepolia and Arbitrum Sepolia
- how to inspect the source transaction and the cross-chain message

## Mental Model To Keep

The easiest mental model is:

- `MyOFT` on Sepolia and `MyOFT` on Arbitrum Sepolia are two ends of the same token system
- LayerZero is the messaging layer connecting them
- wiring establishes trust and pathway configuration
- minting creates test balances
- sending moves token value across chains
- explorers show chain-specific transactions
- LayerZero Scan shows the cross-chain message lifecycle

## Related Files

- [README.md](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/README.md)
- [transactions.md](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/transactions.md)
- [MyOFT.sol](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/contracts/MyOFT.sol)
- [MyOFT.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/deploy/MyOFT.ts)
- [layerzero.config.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/layerzero.config.ts)
- [sendOFT.ts](/c:/Users/callo/Desktop/Remora/Projects_Repos/Project-3/bridge-test-project/layerzero-sdk-test/testing-layerzero-bridge/contracts/tasks/sendOFT.ts)

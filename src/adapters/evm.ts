import type { Account } from '@near-js/accounts'
import { chainAdapters } from 'chainsig.js'
import { encodeFunctionData, getAddress, type PublicClient } from 'viem'

import type { MPC } from '../mpc'

import type { ChainAdapter } from '.'

type EVMAddress = `0x${string}`

// Minimal ERC-20 ABI fragments for balanceOf & transfer
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
]

export class EVMAdapter implements ChainAdapter<EVMAddress> {
  publicClient: PublicClient

  private readonly chainAdapter: chainAdapters.evm.EVM
  private readonly mpc: MPC

  constructor(publicClient: PublicClient, mpc: MPC) {
    const adapter = new chainAdapters.evm.EVM({
      publicClient: publicClient as any,
      contract: mpc as any,
    })

    this.publicClient = publicClient
    this.chainAdapter = adapter
    this.mpc = mpc
  }

  async getAddressControlledBy({
    nearAddress,
    derivationIndex = 0,
  }: {
    nearAddress: string
    derivationIndex?: number
  }) {
    const { address } = await this.chainAdapter.deriveAddressAndPublicKey(
      nearAddress,
      derivationIndex.toString()
    )
    return address as EVMAddress
  }

  async getBalance({
    address,
    tokenAddress,
  }: {
    address: EVMAddress
    tokenAddress?: EVMAddress
  }) {
    let balance = 0n
    if (!tokenAddress) {
      balance = await this.publicClient.getBalance({
        address,
      })
    } else {
      balance = (await this.publicClient.readContract({
        address: getAddress(tokenAddress),
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint
    }

    return balance.toString()
  }

  async transfer({
    to,
    amount,
    nearAccount,
    tokenAddress,
    derivationIndex = 0,
  }: {
    to: EVMAddress
    amount: string
    nearAccount: Account
    tokenAddress?: EVMAddress
    derivationIndex?: number
  }) {
    let txParams: any

    const controlledAddress = await this.getAddressControlledBy({
      nearAddress: nearAccount.accountId,
      derivationIndex,
    })

    to = getAddress(to)
    let from = getAddress(controlledAddress)
    if (tokenAddress) tokenAddress = getAddress(tokenAddress)

    if (tokenAddress) {
      // ERC-20 transfer: call transfer(recipient, amount) on token contract
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, BigInt(amount)],
      })
      txParams = {
        account: from,
        from,
        to: tokenAddress,
        data,
        value: 0n,
      }
    } else {
      // Native transfer
      txParams = {
        from,
        to,
        value: BigInt(amount),
      }
    }

    const { transaction, hashesToSign } =
      await this.chainAdapter.prepareTransactionForSigning(txParams)

    const rsvSignatures = await this.mpc.sign({
      payloads: hashesToSign,
      path: derivationIndex.toString(),
      keyType: 'Ecdsa',
      signerAccount: nearAccount,
    })

    const finalizedTransaction = this.chainAdapter.finalizeTransactionSigning({
      transaction,
      rsvSignatures,
    })

    const transactionHash =
      await this.chainAdapter.broadcastTx(finalizedTransaction)

    return transactionHash.hash
  }
}

import { Account } from '@near-js/accounts'
import type { Provider } from '@near-js/providers'
import { FungibleToken, NEAR } from '@near-js/tokens'

import { type ChainAdapter } from '.'

export class NEARAdapter implements ChainAdapter<string> {
  publicClient: Provider

  constructor(publicClient: Provider) {
    this.publicClient = publicClient
  }

  // Accept an object to match the ChainAdapter signature
  async getControlledAccount({
    nearAccountId,
  }: {
    nearAccountId: string
    path?: string
  }) {
    // path is unused for NEAR for now
    return {
      address: nearAccountId,
      publicKey: null,
    }
  }

  async getBalance({
    address,
    tokenAddress,
  }: {
    address: string
    tokenAddress?: string
  }) {
    let balance = 0n
    let token = NEAR

    if (tokenAddress) {
      token = new FungibleToken(tokenAddress, {
        name: '',
        symbol: '',
        decimals: 0,
      })
    }

    const acc = new Account(address, this.publicClient)
    balance = await acc.getBalance(token)

    return { balance: balance.toString() }
  }

  async transfer({
    from,
    to,
    amount,
    nearAccount,
    tokenAddress,
  }: {
    from: string
    to: string
    amount: string
    nearAccount: Account
    tokenAddress?: string
    path?: string
  }): Promise<string> {
    if (from !== nearAccount.accountId) {
      throw new Error(
        `The 'from' address (${from}) does not match the NEAR account (${nearAccount.accountId})`
      )
    }

    let token = NEAR
    if (tokenAddress)
      token = new FungibleToken(tokenAddress, {
        name: '',
        symbol: '',
        decimals: 0,
      })

    const tx = await nearAccount.transfer({
      receiverId: to,
      amount,
      token,
    })
    return tx.transaction.hash.toString()
  }
}

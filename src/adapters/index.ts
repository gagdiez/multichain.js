import { Account } from '@near-js/accounts'

export * from './evm'
export * from './near'

export type HexString = `0x${string}`

// Base interface - chain agnostic with generics
export interface ChainAdapter<AddressType = string> {
  publicClient: any
  getControlledAccount: ({
    nearAccountId,
    addressIndex,
  }: {
    nearAccountId: string
    addressIndex?: number
  }) => Promise<{
    address: AddressType
    publicKey: string | null
  }>
  getBalance: ({
    address,
    tokenAddress,
  }: {
    address: AddressType
    tokenAddress?: AddressType
  }) => Promise<{ balance: string }>
  transfer: ({
    to,
    amount,
    nearAccount,
    tokenAddress,
    addressIndex,
  }: {
    to: AddressType
    amount: string
    nearAccount: Account
    tokenAddress?: AddressType
    addressIndex?: number
  }) => Promise<string>
}

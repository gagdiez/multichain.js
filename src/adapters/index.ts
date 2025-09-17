import { Account } from '@near-js/accounts'

export * from './evm'
export * from './near'

export type HexString = `0x${string}`

// Base interface - chain agnostic with generics
export interface ChainAdapter<AddressType = string> {
  publicClient: any
  getControlledAccount: ({
    nearAccountId,
    path,
  }: {
    nearAccountId: string
    path?: string
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
    from,
    to,
    amount,
    nearAccount,
    tokenAddress,
    path,
  }: {
    from: AddressType
    to: AddressType
    amount: string
    nearAccount: Account
    tokenAddress?: AddressType
    path?: string
  }) => Promise<string>
}

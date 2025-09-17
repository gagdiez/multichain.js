import { Account } from '@near-js/accounts'

export * from './evm'
export * from './near'

export type HexString = `0x${string}`
type TxHash = string

// Base interface - chain agnostic with generics
export interface ChainAdapter<AddressType = string> {
  publicClient: any
  getAddressControlledBy: ({
    nearAddress,
    derivationIndex,
  }: {
    nearAddress: string
    derivationIndex?: number
  }) => Promise<AddressType>
  getBalance: ({
    address,
    tokenAddress,
  }: {
    address: AddressType
    tokenAddress?: AddressType
  }) => Promise<string>
  transfer: ({
    to,
    amount,
    tokenAddress,
    nearAccount,
    derivationIndex,
  }: {
    to: AddressType
    amount: string
    tokenAddress?: AddressType
    nearAccount: Account
    derivationIndex?: number
  }) => Promise<TxHash>
}

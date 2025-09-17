import type { Provider } from '@near-js/providers'
import type { PublicClient } from 'viem'

import type { EVMAdapter, NEARAdapter } from './adapters'
import type { chains, supportedChains } from './chains'

export type MPCNetworkId = 'mainnet' | 'testnet'
export type EVMChains =
  | typeof chains.ETHEREUM
  | typeof chains.ARBITRUM
  | typeof chains.ETHEREUM_TESTNET
  | typeof chains.ARBITRUM_TESTNET

// Explicit maps make it easier to add new chains with different client/adapters
export type ClientMap = {
  [K in typeof chains.NEAR]: Provider
} & {
  [K in EVMChains]: PublicClient
}

export type AdapterMap = {
  [K in typeof chains.NEAR]: NEARAdapter
} & {
  [K in EVMChains]: EVMAdapter
}

export type ClientForChain<C extends supportedChains> =
  C extends keyof ClientMap ? ClientMap[C & keyof ClientMap] : PublicClient

export type AdapterForChain<C extends supportedChains> =
  C extends keyof AdapterMap ? AdapterMap[C & keyof AdapterMap] : EVMAdapter

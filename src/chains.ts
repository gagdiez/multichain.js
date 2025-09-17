import { JsonRpcProvider } from '@near-js/providers'
import { createPublicClient, http, PublicClient } from 'viem'

type ChainClient = JsonRpcProvider | PublicClient

export const chains = {
  NEAR: 'near',
  ETHEREUM: 'ethereum',
  ARBITRUM: 'arbitrum',
  NEAR_TESTNET: 'near-testnet',
  ETHEREUM_TESTNET: 'ethereum-testnet',
  ARBITRUM_TESTNET: 'arbitrum-testnet',
} as const

export type supportedChains = (typeof chains)[keyof typeof chains]

const EVMClient = (url: string) => {
  return createPublicClient({
    transport: http(url),
  })
}

export const clients: { [K in supportedChains]: ChainClient } = {
  [chains.ARBITRUM]: EVMClient('https://arb1.arbitrum.io/rpc'),
  [chains.ARBITRUM_TESTNET]: EVMClient(
    'https://sepolia-rollup.arbitrum.io/rpc'
  ),
  [chains.ETHEREUM]: EVMClient('https://1rpc.io/eth'),
  [chains.ETHEREUM_TESTNET]: EVMClient('https://sepolia.drpc.org'),
  [chains.NEAR]: new JsonRpcProvider({ url: 'https://free.rpc.fastnear.com' }),
  [chains.NEAR_TESTNET]: new JsonRpcProvider({
    url: 'https://test.rpc.fastnear.com',
  }),
}

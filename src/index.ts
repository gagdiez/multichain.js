import type { Provider } from '@near-js/providers'
import type { PublicClient } from 'viem'

import { EVMAdapter, NEARAdapter } from './adapters'
import { chains, clients, supportedChains } from './chains'
export { chains } from './chains'
import { MPC } from './mpc'
import { AdapterForChain, ClientForChain, MPCNetworkId } from './types'

export function getAdapter<C extends supportedChains>({
  chain,
  publicClient,
  mpcNetwork = 'mainnet',
}: {
  chain: C
  publicClient?: ClientForChain<C>
  mpcNetwork: MPCNetworkId
}): AdapterForChain<C> {
  if (!publicClient) {
    publicClient = clients[chain] as ClientForChain<C>
  }

  let mpc: MPC

  if (mpcNetwork === 'testnet') {
    mpc = new MPC({
      contractId: 'v1.signer-prod.testnet',
      provider: clients[chains.NEAR_TESTNET] as Provider,
    })
  } else {
    mpc = new MPC({
      contractId: 'v1.signer',
      provider: clients[chains.NEAR] as Provider,
    })
  }

  switch (chain) {
    case chains.NEAR:
      return new NEARAdapter(publicClient as Provider) as AdapterForChain<C>
    case chains.ETHEREUM:
    case chains.ARBITRUM:
      return new EVMAdapter(
        publicClient as PublicClient,
        mpc
      ) as AdapterForChain<C>
    default:
      throw new Error(`Unsupported chain: ${chain}`)
  }
}

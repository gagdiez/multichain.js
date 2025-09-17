import { Account } from '@near-js/accounts'
import { KeyPair } from '@near-js/crypto'
import { JsonRpcProvider } from '@near-js/providers'
import { KeyPairSigner } from '@near-js/signers'
import { getAdapter, chains } from 'multichain.js'

async function main() {
  // NEAR Account
  const provider = new JsonRpcProvider({ url: 'https://test.rpc.fastnear.com' })

  const nearAccountId = 'your-account.testnet'
  const signer = new KeyPairSigner(KeyPair.fromString('ed25519:...'))
  const account = new Account(nearAccountId, provider, signer)

  // Ethereum Adapter
  const adapter = getAdapter({ chain: chains.ARBITRUM, mpcNetwork: 'testnet' })
  const { address } = await adapter.getControlledAccount({ nearAccountId })
  console.log('Address:', address)

  const balance = await adapter.getBalance({ address })
  console.log('Balance:', balance)

  const tx = await adapter.transfer({
    to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
    amount: '10000000000000000', // 0.01 ETH
    nearAccount: account,
  })

  console.log('Transaction:', tx)
}

main()

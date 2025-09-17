# Multichain.js

`multichain.js` is a TypeScript library that allows you to control accounts on multiple chains
from a single NEAR Account


## Installation

```bash
yarn add multichain.js
```

## Usage

```js
import { Account } from '@near-js/accounts'
import { KeyPair } from '@near-js/crypto'
import { JsonRpcProvider } from '@near-js/providers'
import { KeyPairSigner } from '@near-js/signers'
import { getAdapter, chains } from 'multichain.js'

async function main() {
  // NEAR Account
  const provider = new JsonRpcProvider({ url: 'https://test.rpc.fastnear.com' })

  const nearAddress = 'your-account.testnet'
  const signer = new KeyPairSigner(KeyPair.fromString('ed25519:...'))
  const account = new Account(nearAddress, provider, signer)

  // Ethereum Adapter
  const adapter = getAdapter({ chain: chains.ARBITRUM, mpcNetwork: 'testnet' })
  const address = await adapter.getAddressControlledBy({ nearAddress })
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
```

<details>

<summary> Testnet </summary>

If you want to use a `testnet` NEAR account be sure to add the `mpcNetwork: testnet` parameter to `getAdapter`

```js
  const adapter = getAdapter({ chain: chains.ARBITRUM, mpcNetwork: 'testnet' })
```

</details>


<details>

<summary> Multiple Accounts </summary>

You can control multiple accounts on each chain, for that you only need to change the `addressIndex` (defaults to `0`)
on both `getControlledAccount` and `transfer`

```js
  const { address } = await adapter.getControlledAccount({ nearAccountId, addressIndex: 1 })

  const txHash = await adapter.transfer({
    to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
    amount: '10000000000000000', // 0.01 ETH
    nearAccount: account,
    addressIndex: 1
  })
```

</details>

## Supported Chains

The library provides chain adapters for the following blockchain networks:

- **EVM Chains**: Ethereum, BSC, Polygon, Arbitrum, Optimism, and other EVM-compatible networks
<!-- - **Bitcoin**: Bitcoin mainnet and testnet with P2WPKH transaction support
- **Cosmos**: Cosmos Hub, Osmosis, and other Cosmos SDK-based chains
- **Solana**: High-performance blockchain with native token transfers
- **Aptos**: Move-based blockchain with Ed25519 signature support
- **SUI**: Move-based blockchain with Ed25519 signature support
- **XRP Ledger**: XRP mainnet, testnet, and devnet with native XRP transfers -->

Each chain adapter provides a unified interface for:
- Check balance of native and fungible tokens
- Transfer native and fungible tokens

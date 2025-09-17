// TODO: Delete this file and use chainsig.js
import type { Provider } from '@near-js/providers'
import { actionCreators } from '@near-js/transactions'
import { getTransactionLastResult } from '@near-js/utils'

import {
  type RSVSignature,
  type UncompressedPubKeySEC1,
  type NajPublicKey,
  type MPCSignature,
  type SignArgs,
  type Ed25519Signature,
} from './types'
import { najToUncompressedPubKeySEC1, uint8ArrayToHex, toRSV } from './utils'

const NEAR_MAX_GAS = '300000000000000'

export class MPC {
  private readonly contractId: string
  private readonly provider: Provider

  constructor({
    contractId,
    provider,
  }: {
    contractId: string
    provider: Provider
  }) {
    this.contractId = contractId
    this.provider = provider
  }

  async sign({
    payloads,
    path,
    keyType,
    signerAccount,
  }: SignArgs): Promise<RSVSignature[]> {
    const transactions = payloads.map((payload) => ({
      signerId: signerAccount.accountId,
      receiverId: this.contractId,
      actions: [
        actionCreators.functionCall(
          'sign',
          {
            request: {
              payload_v2: { [keyType]: uint8ArrayToHex(payload) },
              path,
              domain_id: keyType === 'Eddsa' ? 1 : 0,
            },
          },
          BigInt(NEAR_MAX_GAS),
          BigInt(1)
        ),
      ],
    }))

    const sentTxs = await signerAccount.signAndSendTransactions({
      transactions,
    })

    const results = sentTxs.map((tx) =>
      getTransactionLastResult(tx)
    ) as MPCSignature[]

    const rsvSignatures = results.map((res) => responseToMpcSignature(res))

    return rsvSignatures as RSVSignature[]
  }

  async getPublicKey(): Promise<UncompressedPubKeySEC1> {
    const najPubKey = await this.provider.callFunction(
      this.contractId,
      'public_key',
      {}
    )
    return najToUncompressedPubKeySEC1(najPubKey as NajPublicKey)
  }

  async getDerivedPublicKey(args: {
    path: string
    predecessor: string
    IsEd25519?: boolean
  }): Promise<UncompressedPubKeySEC1 | `Ed25519:${string}`> {
    const najPubKey = await this.provider.callFunction(
      this.contractId,
      'derived_public_key',
      {
        path: args.path,
        predecessor: args.predecessor,
        domain_id: args.IsEd25519 ? 1 : 0,
      }
    )
    return najToUncompressedPubKeySEC1(najPubKey as NajPublicKey)
  }
}

// aux
const responseToMpcSignature = (
  signature: MPCSignature
): RSVSignature | Ed25519Signature | undefined => {
  if (
    'scheme' in signature &&
    signature.scheme === 'Ed25519' &&
    'signature' in signature
  ) {
    return signature as Ed25519Signature
  }
  if (signature) {
    return toRSV(signature)
  } else {
    return undefined
  }
}

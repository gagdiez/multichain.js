import { type Action } from '@near-js/transactions'
import { type FinalExecutionOutcome } from '@near-js/types'

export type Base58String = string

export type NajPublicKey = `secp256k1:${Base58String}`

export type UncompressedPubKeySEC1 = `04${string}`

export type CompressedPubKeySEC1 = `02${string}` | `03${string}`

export type Ed25519PubKey = `Ed25519:${string}`

export interface DerivedPublicKeyArgs {
  path: string
  predecessor: string
}

export interface Signature {
  scheme: string
  signature: number[]
}

export type Scheme = 'secp256k1' | 'ed25519' | 'Ed25519' | 'Secp256k1'

export interface KeyDerivationPath {
  index: number
  scheme: Scheme
}

export interface Ed25519Signature {
  signature: number[]
}

export interface RSVSignature {
  r: string
  s: string
  v: number
}

export interface NearNearMpcSignature {
  big_r: {
    affine_point: string
  }
  s: {
    scalar: string
  }
  recovery_id: number
}

export interface ChainSigNearMpcSignature {
  big_r: string
  s: string
  recovery_id: number
}

export interface ChainSigEvmMpcSignature {
  bigR: { x: bigint; y: bigint }
  s: bigint
  recoveryId: number
}

export type MPCSignature =
  | NearNearMpcSignature
  | ChainSigNearMpcSignature
  | ChainSigEvmMpcSignature
  | { scheme: Scheme }
  | Ed25519Signature

export type HashToSign = number[] | Uint8Array

export interface Transaction {
  signerId?: string
  receiverId: string
  actions: Action[]
}

export interface SignArgs {
  payloads: HashToSign[]
  path: string
  keyType: 'Eddsa' | 'Ecdsa'
  signerAccount: {
    accountId: string
    signAndSendTransactions: (transactions: {
      transactions: Transaction[]
    }) => Promise<FinalExecutionOutcome[]>
  }
}

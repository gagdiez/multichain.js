import { base58 } from '@scure/base'

import {
  type NajPublicKey,
  type MPCSignature,
  type RSVSignature,
  type UncompressedPubKeySEC1,
} from './types'

export const toRSV = (signature: MPCSignature): RSVSignature => {
  // Handle NearNearMpcSignature
  if (
    'big_r' in signature &&
    typeof signature.big_r === 'object' &&
    'affine_point' in signature.big_r &&
    's' in signature &&
    typeof signature.s === 'object' &&
    'scalar' in signature.s
  ) {
    return {
      r: signature.big_r.affine_point.substring(2),
      s: signature.s.scalar,
      v: signature.recovery_id + 27,
    }
  }
  // Handle ChainSigNearMpcSignature
  else if (
    'big_r' in signature &&
    typeof signature.big_r === 'string' &&
    's' in signature &&
    typeof signature.s === 'string'
  ) {
    return {
      r: signature.big_r.substring(2),
      s: signature.s,
      v: signature.recovery_id + 27,
    }
  }
  // Handle ChainSigEvmMpcSignature
  else if (
    'bigR' in signature &&
    'x' in signature.bigR &&
    's' in signature &&
    typeof signature.s === 'bigint'
  ) {
    return {
      r: signature.bigR.x.toString(16).padStart(64, '0'),
      s: signature.s.toString(16).padStart(64, '0'),
      v: signature.recoveryId + 27,
    }
  }

  throw new Error('Invalid signature format')
}

/**
 * Converts a NAJ public key to an uncompressed SEC1 public key.
 *
 * @param najPublicKey - The NAJ public key to convert (e.g. secp256k1:3Ww8iFjqTHufye5aRGUvrQqETegR4gVUcW8FX5xzscaN9ENhpkffojsxJwi6N1RbbHMTxYa9UyKeqK3fsMuwxjR5)
 * @returns The uncompressed SEC1 public key (e.g. 04 || x || y)
 */
export const najToUncompressedPubKeySEC1 = (
  najPublicKey: NajPublicKey
): UncompressedPubKeySEC1 => {
  const decodedKey = base58.decode(najPublicKey.split(':')[1])
  return `04${Buffer.from(decodedKey).toString('hex')}`
}

/**
 * Converts a Uint8Array to a hexadecimal string.
 *
 * @param uint8Array - The Uint8Array to convert.
 * @returns The hexadecimal string representation of the Uint8Array.
 */
export const uint8ArrayToHex = (
  uint8Array: number[] | Uint8Array<ArrayBufferLike>
): string => {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

import {
  Provable,
  Bool,
  Group,
  PublicKey,
  Scalar,
  PrivateKey,
  Field,
  Struct,
  Circuit,
  Experimental,
  UInt32,
  Hash,
} from 'o1js/src';

const HASH_BITS = 256;
const HASH_BYTES = HASH_BITS / 8;
const HEADER_BYTES = 80;
const HEADER_BITS = HEADER_BYTES * 8;

export { BtcHeader };

class Header extends Struct({
  headerBits: Provable.Array(Bool, HEADER_BITS),
  thresholdBits: Provable.Array(Bool, HASH_BITS),
  hash: Provable.Array(Bool, HASH_BITS),
  work: Provable.Array(UInt32, 8),
}) {}

const BtcHeader = {
  validateHeader(header: Header) {

  },
};
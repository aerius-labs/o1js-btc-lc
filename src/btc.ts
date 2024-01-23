import {
  Bytes,
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
import * as assert from 'assert';

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
  validate(header: Header) {
    BtcHeader.validateBits(header.headerBits);
  },
  validateBits(headerBits: Bytes): Header {
    assert(headerBits.length === HEADER_BYTES, 'Invalid header length');

    // calculate double hash of header
    const hash : Bytes = Hash.SHA2_256.hash(Hash.SHA2_256.hash(headerBits));

    // validate threshold


  }
};

const validateThreshold = (headerBits: Bytes, hash: Bytes): Bytes => {
  const zero = Field(0);

  // Extract difficulty exponent from header
  const difficultyExpBits = headerBits.slice(600, 608);
  const difficultyExpInt = Bytes.toUInt32(difficultyExpBits);

  // Assign threshold byte from header bytes
  const thresholdBytes = new Bytes(32);
  for (let i = 0; i < 32; i++) {
    thresholdBytes[i] = Field.random();
  }
  const assignThresholdByte = (
    thresholdByteIndex: number,
    headerBitIndex: number
  ) => {
    const thresholdByteIdx = Field.fromCanonicalUInt32(thresholdByteIndex);
    const accessIdx = Field.sub(thresholdByteIdx, difficultyExpInt);

    const headerByte = Bytes.toUInt32(headerBits.slice(headerBitIndex, headerBitIndex + 8));

    const thresholdByte = thresholdBytes[accessIdx];
    thresholdByte.assign(headerByte);
  };
  assignThresholdByte(32, 592);
  assignThresholdByte(33, 584);
  assignThresholdByte(34, 576);

  // Ensure validity of threshold
  // Check 1: Ensure SHA256(block) < threshold
  const sha1Bytes = new Bytes(32);
  for (let j = 0; j < 32; j++) {
    sha1Bytes[j] = Field.random();

    const byteFromBits = Bytes.toUInt32(sha1Targets.slice(j * 8, (j + 1) * 8));
    sha1Bytes[j].assign(byteFromBits);
  }
  const isLess = Bytes.listLessThanOrEqual(thresholdBytes, sha1Bytes);
  const one = Field.true();
  isLess.assign(one);
  // Check 2: Ensure exponent and mantissa bytes are valid
  const thresholdBits = validateMantissa(thresholdBytes, difficultyExpInt);

  return thresholdBits;
}

const validateMantissa = (thresholdBytes: Bytes, difficultyExpInt: UInt32): Bytes => {
  const zero = Field(0);
  const one = Field(1);
  const const32 = Field(32);

  const thresholdBits = new Bytes(256);
  for (let i = 0; i < 256; i++) {
    thresholdBits[i] = Field.random();
  }

  for (let j = 0; j < 32; j++) {
    const isZero = thresholdBytes[j].isZero();
    const isMantissaByte = (j === 32 - difficultyExpInt.value) || (j === 32 - difficultyExpInt.value + 1) || (j === 32 - difficultyExpInt.value + 2);
    const inRange = isMantissaByte || isZero;
    const mistakeExists = inRange.not();
    thresholdBits[j * 8].assign(mistakeExists);
  }

  for (let j = 0; j < 32; j++) {
    const thresholdBitsToByte = Bytes.toUInt32(thresholdBits.slice(j * 8, (j + 1) * 8));
    thresholdBytes[j].assign(thresholdBitsToByte);
  }

  return thresholdBits;
}
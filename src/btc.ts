import { Bytes, Field, Hash, Provable, Struct, UInt32 } from 'o1js/src';
import { createForeignField } from 'o1js/src';

import assert from 'assert';

class Uint256 extends createForeignField(1n << 256n) {}

// const HASH_BITS = 256;
// const HASH_BYTES = HASH_BITS / 8;
const HEADER_BYTES = 80;
// const HEADER_BITS = HEADER_BYTES * 8;

export { BtcHeader };

class Bytes32 extends Bytes(32) {}
class Bytes80 extends Bytes(80) {}

class Header extends Struct({
  headerBytes: Bytes80,
  threshold: Bytes32,
  hash: Bytes32,
  work: Provable.Array(UInt32, 8),
}) {}

const BtcHeader = {
  validate(header: Header) {
    BtcHeader.validateBits(header.headerBytes);
  },
  validateBits(headerBytes: Bytes): Header {
    assert(headerBytes.length === HEADER_BYTES, 'Invalid header length');

    // calculate double hash of header
    const hash : Bytes = Hash.SHA2_256.hash(Hash.SHA2_256.hash(headerBytes));

    // validate threshold


  }
};

const validateThreshold = (headerBytes: Bytes, hash: Bytes): Bytes => {

  // Extract difficulty exponent from header
  const difficultyExpBits = headerBytes.bytes[75];
  const difficultyExpInt =  difficultyExpBits.toUInt32();

  // Assign threshold byte from header bytes
  const thresholdBytes = Bytes32.from(new Array(32).fill(0));
  const assignThresholdByte = (
    thresholdByteIndex: number,
    headerByteIndex: number
  ) => {
    const thresholdByteIdx = UInt32.from(thresholdByteIndex);
    const accessIdx = thresholdByteIdx.sub(difficultyExpInt);

    thresholdBytes[accessIdx] = headerBytes.bytes[headerByteIndex].toUInt32();
  };
  assignThresholdByte(32, 592);
  assignThresholdByte(33, 584);
  assignThresholdByte(34, 576);

  // Ensure validity of threshold
  // Check 1: Ensure SHA256(block) < threshold
  for (let j = 0; j < 32; j++) {
    const byteFromBits = Bytes.toUInt32(hash.bytes.slice(j * 8, (j + 1) * 8));
    hash[j].assign(byteFromBits);
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

const calculateWork = (thresholdBits: Bytes): UInt32 => {
  const zero = Field(0);
  const one = Field(1);
  const const32 = Field(32);

  const numeratorBits = new Bytes(256);
  for (let i = 0; i < 256; i++) {
    numeratorBits[i] = Field.random();
  }

  for (let j = 0; j < 256; j++) {
    numeratorBits[j].assign(one);
  }

  const numerator = Bytes.toUInt32(numeratorBits);
  const denominator = Bytes.toUInt32(thresholdBits);
  const work = numerator.div(denominator);

  return work;
}
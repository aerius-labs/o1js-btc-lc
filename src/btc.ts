import {
  Field,
  UInt32,
  Provable,
  Hash,
  Struct,
  Bool,
  CanonicalForeignField,
} from 'o1js';
import { Bytes, Gadgets, UInt8 } from 'o1js';
import { createForeignField } from 'o1js';
import { modExp } from './utils';

// class Field256 extends createForeignField(1n << 256n) {}
class Field257 extends createForeignField(1n << 257n) {}

// Define a provable type for 80-byte and 32-byte arrays
class Bytes80 extends Bytes(80) {}
class Bytes32 extends Bytes(32) {}

class Bytes4 extends Bytes(4) {}

// Define a struct for the Bitcoin block header
// @ts-ignore
class BtcHeader extends Struct({
  version: Bytes4.provable,
  prevBlock: Bytes32.provable,
  merkleRoot: Bytes32.provable,
  timestamp: UInt32,
  bits: UInt32,
  nonce: Bytes4.provable,
}) {
  // Method to serialize the header into bytes
  toBytes() {
    return new Bytes80([
      ...this.version.bytes,
      ...this.prevBlock.bytes,
      ...this.merkleRoot.bytes,
      ...Bytes(4).from([
        UInt8.from(this.timestamp.and(UInt32.from(0xff))),
        UInt8.from(this.timestamp.and(UInt32.from(0xff00)).rightShift(8)),
        UInt8.from(this.timestamp.and(UInt32.from(0xff0000)).rightShift(16)),
        UInt8.from(this.timestamp.and(UInt32.from(0xff000000)).rightShift(24)),
      ]).bytes,
      ...Bytes(4).from([
        UInt8.from(this.bits.and(UInt32.from(0xff))),
        UInt8.from(this.bits.and(UInt32.from(0xff00)).rightShift(8)),
        UInt8.from(this.bits.and(UInt32.from(0xff0000)).rightShift(16)),
        UInt8.from(this.bits.and(UInt32.from(0xff000000)).rightShift(24)),
      ]).bytes,
      ...this.nonce.bytes,
    ]);
  }

  // Method to calculate the hash of the header

  hash() {
    const headerBytes = this.toBytes();
    // Perform double SHA256 hash
    return Hash.SHA2_256.hash(Hash.SHA2_256.hash(headerBytes));
  }

  // Method to validate the header

  public validate() {
    const hash = this.hash();
    const hashBits = hash.toFields().flatMap((x) => x.toBits(8));
    const hashU257 = Field257.fromBits(hashBits).assertCanonical();

    const target257 = this.bitsToTarget();

    // Check if the hash is less than the target
    checkTarget(hashU257, target257);
  }

  // Method to convert bits field to target
  bitsToTarget() {
    // Extract the exponent and significand from the bits field
    const exponent = Gadgets.rightShift64(this.bits.value, 24);
    const significand = this.bits.and(UInt32.from(0x00ffffff));

    // Calculate the target
    const expField = modExp(Field.from(256), exponent.sub(Field.from(3)));
    const exp = Field257.fromBits(expField.toBits());
    const target = exp.mul(Field257.fromBits(significand.value.toBits()));
    return target.assertCanonical();
  }
}

const checkTarget = (hash: Field257, target: Field257) => {
  const full = new Field257(1n << 256n);
  const diff = full.sub(target);
  const val = diff.add(hash).assertCanonical();
  const bits = val.toBits();
  bits[256].assertFalse('hash is greater than target');
};

export { BtcHeader, Field257, Bytes80, Bytes32, Bytes4 };

import { Field, UInt32, Provable, Hash, Struct } from 'o1js';
import { Bytes, Gadgets, UInt8 } from 'o1js';
import { createForeignField } from 'o1js';
import { modExp } from './utils';

class Field256 extends createForeignField(1n << 256n) {}

// Define a provable type for 256-bit unsigned integers
class UInt256 extends Struct({
  value: Provable.Array(UInt32, 8)
}) {}

// Define a provable type for 80-byte and 32-byte arrays
class Bytes80 extends Bytes(80) {}
class Bytes32 extends Bytes(32) {}

// Define a struct for the Bitcoin block header
// @ts-ignore
class BtcHeader extends Struct({
  version: UInt32,
  prevBlock: Bytes32,
  merkleRoot: Bytes32,
  timestamp: UInt32,
  bits: UInt32,
  nonce: UInt32

}) {
  // Method to serialize the header into bytes
  toBytes() {
    return new Bytes80([
      ...this.version.toFields().map((x) => UInt8.from(x)),
      ...this.prevBlock.provable.bytes,
      ...this.merkleRoot.provable.bytes,
      ...this.timestamp.toFields().map((x) => UInt8.from(x)),
      ...this.bits.toFields().map((x) => UInt8.from(x)),
      ...this.nonce.toFields().map((x) => UInt8.from(x))
    ]);

  }


  // Method to calculate the hash of the header

  hash() {
    const headerBytes = this.toBytes();
    // Perform double SHA256 hash
    return Hash.SHA2_256.hash(Hash.SHA2_256.hash(headerBytes));
  }

  // Method to validate the header

  validate() {

    const hash = this.hash();
    const hashBits = hash.toFields().flatMap((x) => x.toBits(8));
    const hashU256 = Field256.fromBits(hashBits).assertCanonical();

    const target = this.bitsToTarget();

    // Check if the hash is less than the target


  }


  // Method to convert bits field to target

  bitsToTarget() {

    // Extract the exponent and coefficient from the bits field

    const exponent = Gadgets.rightShift64(this.bits.value, 24);

    const coefficient = this.bits.and(UInt32.from(0x00ffffff));

    // Calculate the target
    // const target = modExp(coefficient.value, exponent.sub(Field.from(3)).mul(Field.from(8)));
    const expU32 = modExp(coefficient.value, exponent.sub(Field.from(3)));
    const exp = Field256.fromBits(expU32.toBits());

    const multiplicand = new Field256.AlmostReduced(8);
    const target = exp.mul(multiplicand);
    return target.assertCanonical();
  }

}

//


export { BtcHeader };
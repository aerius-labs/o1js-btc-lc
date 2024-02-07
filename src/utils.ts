import { Bool, Circuit, Field } from 'o1js';

import { Snarky } from 'o1js/src/snarky';
import { FieldConst } from 'o1js/src/lib/field';
import { Field as Fp } from 'o1js/src/provable/field-bigint';

/**
 * Separates a field into its high and low parts.
 * @param x The field to separate.
 * @returns An array containing the high and low parts of the field.
 */
// const separateHighPart = (x: Field): [Field, Field] => {
//   let [, isOddVar, xDiv2Var] = Snarky.exists(2, () => {
//     let bits = Fp.toBits(x.toBigInt());
//     let highPart = [];
//     for (let i = 0; i < 2; i++) {
//       highPart.push(bits.shift()! ? 1n : 0n);
//     }
//
//     return [
//       0,
//       FieldConst.fromBigint(Fp.fromBits(highPart.map((x) => x === 1n))),
//       FieldConst.fromBigint(Fp.fromBits(bits)),
//     ];
//   });
//   return [new Field(xDiv2Var), new Field(isOddVar)];
// };

/**
 * Determines if one field is less than another.
 * @param a The first field.
 * @param b The second field.
 * @returns A boolean indicating if a is less than b.
 */
// export const lessThanWrapper = (a: Field, b: Field) => {
//   let [aHigh, aLow] = separateHighPart(a);
//   let [bHigh, bLow] = separateHighPart(b);
//
//   let highPartLessThan = aHigh.lessThan(bHigh);
//   let lowPartLessThan = aLow.lessThan(bLow);
//
//   return highPartLessThan
//     .or(lowPartLessThan.and(aHigh.equals(bHigh)))
//     .toField();
// };

/**
 * Selects an element from an array based on an index.
 * @param arr The array to select from.
 * @param index The index of the element to select.
 * @returns The selected element.
 */
export const quinSelector = (arr: Field[], index: Field) => {
  index.lessThan(Field(arr.length)).assertTrue();

  let out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i].mul(index.equals(Field(i)).toField()));
  }

  let res = Field(0);
  for (let i = 0; i < arr.length; i++) {
    res = res.add(out[i]);
  }

  return res;
};


export const modExp = (base: Field, exponent: Field) => {
  let bits = exponent.toBits();
  let n = base;

  // this keeps track of when we can start accumulating
  let start = Bool(false);

  // we have to go in reverse order here because .toBits is in LSB representation, but we need MSB for the algorithm to function
  for (let i = 254; i >= 0; i--) {
    let bit = bits[i];

    // we utilize the square and multiply algorithm
    // if the current bit = 0, square and multiply
    // if bit = 1, just square
    let isOne = start.and(bit.equals(false));
    let isZero = start.and(bit.equals(true));

    let square = n.square();
    // we choose what computation to apply next
    n = Circuit.switch([isOne, isZero, start.not()], Field, [
      square,
      square.mul(base),
      n,
    ]);

    // toggle start to accumulate; we only start accumulating once we have reached the first 1
    start = Circuit.if(bit.equals(true).and(start.not()), Bool(true), start);
  }

  return n;
}
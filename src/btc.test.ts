import { BtcHeader, Bytes32, Bytes4 } from './btc';
import { Bytes, UInt32 } from 'o1js';

// Example header
// 02000000 ........................... Block version: 2
//
// b6ff0b1b1680a2862a30ca44d346d9e8
// 910d334beb48ca0c0000000000000000 ... Hash of previous block's header
// 9d10aa52ee949386ca9385695f04ede2
// 70dda20810decd12bc9b048aaab31471 ... Merkle root
//
// 24d95a54 ........................... [Unix time][unix epoch time]: 1415239972
// 30c31b18 ........................... Target: 0x1bc330 * 256**(0x18-3)
// fe9f0864 ........................... Nonce
describe('Bitcoin Header', () => {
  it('Acceptable header should be validated correctly', () => {
    const version = Bytes4.fromHex('02000000');
    const prevBlock = Bytes32.fromHex(
        'b6ff0b1b1680a2862a30ca44d346d9e8910d334beb48ca0c0000000000000000'
    );
    const merkleRoot = Bytes32.fromHex(
        '9d10aa52ee949386ca9385695f04ede270dda20810decd12bc9b048aaab31471'
    );
    const timestamp = UInt32.from(0x24d95a54);
    const bits = UInt32.from(0x30c31b18);

    let nonce = Bytes4.fromHex('fe9f0864');

    const header = new BtcHeader({
      version: version,
      prevBlock: prevBlock,
      merkleRoot: merkleRoot,
      timestamp: timestamp,
      bits: bits,
      nonce: nonce,
    });

    header.validate();
  });
});

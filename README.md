# o1js Bitcoin Light Client

This repository contains a library for verifying Bitcoin block headers using zero-knowledge proofs with o1js, a JavaScript framework for developing zkApps on the Mina Protocol. The library demonstrates how to construct, serialize, and validate Bitcoin block headers in a way that's compatible with zk proofs, leveraging the power of o1js to ensure privacy and security in blockchain interactions.

A bitcoing header light client implemented in o1js

## Getting started

### Prerequisites
* Node.js: Make sure you have Node.js installed on your system to run JavaScript code.
* o1js (Optional): This project is built using o1js, which requires the o1js library to be installed. Follow the installation guide on the [Mina Protocol documentation](https://docs.minaprotocol.com/zkapps/o1js) to set up o1js.

### Installation
1. Clone the rpository
- Begin by cloning the repository to your local machine.
```bash
git clone https://github.com/aerius-labs/o1js-btc-lc.git
```
2. Install Dependencies
    - Navigate into the project directory and install the required npm packages.
```bash
cd o1js-btc-lc
npm install
```

3. Build

```bash
npm run build
```

### Usage
This library provides the functionality to validate Bitcoin block headers using zk proofs. To use it, you need to import the BtcHeader class from the library and create instances of it with the Bitcoin block header data you wish to verify.

1. Import the library
- Import the BtcHeader class into your project.
```ts
import { BtcHeader } from './path/to/o1js-btc-lc';
```
2. Create and Validate a Bitcoin Block Header
- Use the BtcHeader class to create a new Bitcoin block header instance inside your smart contract (zkApp) and validate it.
```ts
const header = new BtcHeader({
  version: /* version */,
  prevBlock: /* previous block hash */,
  merkleRoot: /* merkle root */,
  timestamp: /* timestamp */,
  bits: /* target bits */,
  nonce: /* nonce */
});

header.validate();

```
Replace the placeholders with actual data from a Bitcoin block header you wish to verify.

## Understanding the Code

The library includes several key components:

- BtcHeader: A class representing a Bitcoin block header. It includes methods to serialize the header into bytes, calculate the double SHA-256 hash, and validate the header by ensuring the hash is below the target specified in the bits field.
- Field257: A custom field type used for calculations involving the 257-bit numbers required for the target and hash comparison.
- Bytes(x) - A Byte wrapped for x number of bytes
- modExp: A utility function for performing modular exponentiation, used in converting the bits field to a target number.
- Tests: The library includes a test case demonstrating how to create a BtcHeader instance with real Bitcoin block header data and validate it.

## Testing

```sh
npm run test
npm run testw # watch mode
```

## How to run coverage

```sh
npm run coverage
```

## Additional Information

For more details on o1js and its capabilities, refer to the [Mina Protocol documentation](https://docs.minaprotocol.com/zkapps/o1js). This documentation provides comprehensive guidance on developing zkApps, including creating zero-knowledge proofs, defining custom circuits, and more.

## Contributing

Contributions to the library are welcome. Please follow the standard GitHub pull request process to submit your improvements or bug fixes.

## License

[Apache-2.0](LICENSE)

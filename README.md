# BIMcontracts Demo (bim-contracts)

## Requirements

- [NodeJS](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/de)
- [Yarn](https://yarnpkg.com/lang/en/docs/install)
- [Ganache CLI](https://github.com/trufflesuite/ganache-cli)

## Installation

Application config resides in `bim-contracts.config.js`

**1)** Install dependencies

```bash
yarn install
```

**2)** Create a mongodb database and update config

```javascript
  mongodb: {
    uri: '<MONGODB_URI>',
  }
```

**3)** Start Ganache Blockchain

```bash
yarn dev:network
```

**4)** Start Server and Client application

```bash
yarn dev
```

**5)** Update contract address in config

```javascript
  contract: {
    development: '<CONTRACT_ADDRESS>',
  }
```

## Usage

**1)** Create a minimum of two example accounts and remind their address and private keys

**2)** Create a new building project from one account and fill in the other account as contractor

**3)** Contractor can now start services and create new service agreements. Client can approve and reject finished services.

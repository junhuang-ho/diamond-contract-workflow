# setup

yarn add --dev hardhat
npx hardhat
---copy this to new repo's README.md
yarn add --dev dotenv
yarn add --dev hardhat-deploy
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers [this command is to override hardhat-ethers to use hardhat-deploy-ethers - check package.json]

add `"resolveJsonModule": true` in tsconfig.json

add .env

setup hardhat.config.ts

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("hardhat-deploy");
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

interface CustomConfig extends HardhatUserConfig {
  namedAccounts: any;
}

const config: CustomConfig = {
  solidity: {
    compilers: [
      //   { version: "0.8.0" }, // MUST SAME AS .sol FILES VERSION !!! IF NOT HAVE VERIFY ISSUE !!!
      { version: "0.8.17" },
      //   { version: "0.5.11" },
      //   { version: "0.4.24" }, // for mocks
      // { version: "0.4.16" },
      //   { version: "0.6.6" }, // for mocks
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    mumbai: {
      chainId: 80001,
      url: process.env.ALCHEMY_API_URL!,
      accounts: [process.env.PRIVATE_KEY_1!, process.env.PRIVATE_KEY_2!],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY!,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      mmumbai: 0,
    },
  },
};

export default config;

import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
// import "hardhat-ethernal";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// extendEnvironment((hre) => {
//   hre.ethernalSync = true;
//   hre.ethernalWorkspace = "Marketplace";
//   hre.ethernalTrace = false;
//   hre.ethernalResetOnStart = "Hardhat";
//   hre.ethernalUploadAst = true;
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      mining: {
        auto: true,
      },
      chainId: 1337,
      accounts: {
        mnemonic:
          "soldier urge coach loud bamboo pole sting faith acoustic action cement fame",
        count: 20,
        accountsBalance: "100000000000000000000000",
      },
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        "821046cfc9a8253ef4df6b012724c4b7bf12aa740d29e3e22944c68383326a3e",
      ],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

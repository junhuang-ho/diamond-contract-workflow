const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");

export const CURRENT_DEPLOYED_FOLDER = "mumbai_1673085947127";
export const CONTRACT_PARENT_FOLDER = "livethree-contracts";
const developmentChains = ["hardhat", "localhost"];
const CHAIN_ID_HARDHAT = 31337;
export const CURRENT_DEPLOYED_FOLDER_DIR = __dirname
  .substring(0, __dirname.lastIndexOf("/"))
  .concat(`/deployments/${CURRENT_DEPLOYED_FOLDER}`);

const networkConfig = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
  },
  1: {
    name: "mainnet",
  },
  5: {
    name: "goerli",
  },
  137: {
    name: "polygon",
  },
  80001: {
    name: "mumbai",
  },
} as const;

export const networkMap = {
  default: "hardhat",
  1: "mainnet",
  5: "goerli",
  137: "polygon",
  80001: "mumbai",
} as any;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getFiles = (dir: string, files_?: string[]) => {
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
};

export const getADiamondAddress = (jsonFiles: string[], name: string) => {
  for (let i = 0; i < jsonFiles.length; i++) {
    const filePath = jsonFiles[i];
    const fileName = filePath.split("/").at(-1)?.split(".").at(0);
    if (fileName === name) {
      const openJSON = fs.readFileSync(filePath, "utf-8");
      const contractData = JSON.parse(openJSON);
      return contractData.address;
    }
  }
};

const save = (
  chainId: number,
  dir: string,
  saveDir: string,
  contractName: string,
  contractDeployed: any
) => {
  if (chainId === CHAIN_ID_HARDHAT) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // get abi
  const contractArtifactList = getFiles(
    __dirname
      .substring(0, __dirname.lastIndexOf("/"))
      .concat("/artifacts/contracts")
  );
  const fileName = `${contractName}.json`;
  let contractArtifactsDir;
  for (let i = 0; i < contractArtifactList.length; i++) {
    if (contractArtifactList[i].endsWith(fileName)) {
      contractArtifactsDir = contractArtifactList[i];
    }
  }
  if (contractArtifactsDir === undefined || contractArtifactsDir === null) {
    throw new Error(
      `contract artifact path that ends with ${fileName} not found.`
    );
  }
  const contractArtifacts = fs.readFileSync(contractArtifactsDir);
  const contractArtifactsJSON = JSON.parse(contractArtifacts);

  const json = JSON.stringify({
    address: contractDeployed.address,
    abi: contractArtifactsJSON.abi,
  });

  // save
  fs.writeFileSync(saveDir, json, function (err: any) {
    if (err) {
      console.log(err);
    }
  });
  console.log(`Saving\t\t| Saved to ${saveDir}`);
};

export const deploy = async (
  deployer: any,
  chainId: number,
  contractName: string,
  saveDate: number,
  args = []
) => {
  const dir = `./deployments/${networkMap[chainId]}_${saveDate}`;
  const saveDir = `${dir}/${contractName}.json`;

  // Deploying
  const contract = await ethers.getContractFactory(contractName, deployer);
  const contractDeployed = await contract.deploy(...args);

  if (chainId === CHAIN_ID_HARDHAT) {
    await contractDeployed.deployed();
  } else {
    var tx = await contractDeployed.deployTransaction.wait(1);
  }
  console.log(
    `Deploying\t| Deployed ${contractName} on ${networkMap[chainId]}: ${contractDeployed.address}`
  );

  save(chainId, dir, saveDir, contractName, contractDeployed);

  return contractDeployed;
};

module.exports = {
  CONTRACT_PARENT_FOLDER,
  CURRENT_DEPLOYED_FOLDER,
  CURRENT_DEPLOYED_FOLDER_DIR,
  networkConfig,
  networkMap,
  developmentChains,
  getADiamondAddress,
  getFiles,
  deploy,
};

const hre = require("hardhat");
import {
  getFiles,
  getADiamondAddress,
  CURRENT_DEPLOYED_FOLDER,
  CONTRACT_PARENT_FOLDER,
  CURRENT_DEPLOYED_FOLDER_DIR,
} from "./utils";
const fs = require("fs");

const getContractRelativePath = (contractName: string) => {
  const contractDir = __dirname
    .substring(0, __dirname.lastIndexOf("/"))
    .concat(`/contracts`);
  const contractList = getFiles(contractDir);
  const contractFile = `${contractName}.sol`;
  let contractPath;
  for (let i = 0; i < contractList.length; i++) {
    if (
      contractList[i].endsWith(contractFile) &&
      !contractList[i].endsWith("I".concat(contractFile)) &&
      !contractList[i].endsWith("Lib".concat(contractFile))
    ) {
      contractPath = contractList[i];
      contractPath = contractPath.split(`${CONTRACT_PARENT_FOLDER}/`)[1];
    }
  }
  if (contractPath === undefined || contractPath === null) {
    throw new Error(`contract path that ends with ${contractFile} not found.`);
  }
  return contractPath;
};

const main = async () => {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const files = getFiles(CURRENT_DEPLOYED_FOLDER_DIR);
  const addressDiamondCut = getADiamondAddress(files, "DiamondCutFacet");

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    console.log(`Verifying for: ${filePath}`);
    const contractName = filePath.split("/").at(-1)?.split(".").at(0);

    const openJSON = fs.readFileSync(filePath, "utf-8");
    const contractData = JSON.parse(openJSON);

    const contractPath = getContractRelativePath(contractName!);
    const contractPathVerify = `${contractPath}:${contractName}`;

    // sorting args

    let args: any[];
    if (contractName === "Diamond") {
      args = [deployer, addressDiamondCut];
    } else {
      args = [];
    }

    // verify
    try {
      await hre.run("verify:verify", {
        // https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html#using-programmatically
        address: contractData.address,
        constructorArguments: args,
        contract: contractPathVerify,
      });
    } catch (err) {
      console.log(err);
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

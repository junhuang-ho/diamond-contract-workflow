const hre = require("hardhat");
const fse = require("fs-extra");
import { ethers } from "hardhat";
import {
  networkMap,
  deploy,
  getFiles,
  getADiamondAddress,
  CURRENT_DEPLOYED_FOLDER,
  CONTRACT_PARENT_FOLDER,
  CURRENT_DEPLOYED_FOLDER_DIR,
} from "./utils";
const { getSelectors, FacetCutAction } = require("../scripts/utilsDiamond");

////////////////////////////////////////////
/// ------------------------------------ ///
/// ----- add NEW facet to diamond ----- ///
/// ------------------------------------ ///
////////////////////////////////////////////

const main = async () => {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const now = Date.now();

  const files = getFiles(CURRENT_DEPLOYED_FOLDER_DIR);
  const addressDiamond = getADiamondAddress(files, "Diamond");

  const diamondCut = await ethers.getContractAt("IDiamondCut", addressDiamond);

  const ctNewFacet = await deploy(deployer, chainId, "Test3Facet", now, []);

  var tx = await diamondCut.diamondCut(
    [
      {
        facetAddress: ctNewFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(ctNewFacet),
      },
    ],
    ethers.constants.AddressZero,
    "0x" // zero bytes, "" fails - invalid input
  );

  var rcpt = await tx.wait();
  if (!rcpt.status) {
    throw Error(`Diamond add failed: ${tx.hash}`);
  }

  const newDeployedFolderDir = __dirname
    .substring(0, __dirname.lastIndexOf("/"))
    .concat(`/deployments/${networkMap[chainId]}_${now}`);

  try {
    fse.copySync(CURRENT_DEPLOYED_FOLDER_DIR, newDeployedFolderDir, {
      overwrite: false,
    });
  } catch (err) {
    console.error(err);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

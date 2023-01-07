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

//////////////////////////////////////////////////////////////
/// ------------------------------------------------------ ///
/// ----- remove selected fn selectors from diamond ------ ///
/// ----- adds new facet with selected fn selectors ------ ///
/// ----- to diamond ------------------------------------- ///
/// ------------------------------------------------------ ///
//////////////////////////////////////////////////////////////

const main = async () => {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const now = Date.now();

  const files = getFiles(CURRENT_DEPLOYED_FOLDER_DIR);
  const addressDiamond = getADiamondAddress(files, "Diamond");

  const diamondCut = await ethers.getContractAt("IDiamondCut", addressDiamond);

  const ctNewFacet = await deploy(deployer, chainId, "Test4Facet", now, []);

  const ctExistingFacet = await ethers.getContractAt(
    "Test2Facet",
    addressDiamond
  );

  const selectors = getSelectors(ctExistingFacet);
  const selectorsToRemove = selectors[19];
  console.log(selectorsToRemove);

  var tx = await diamondCut.diamondCut(
    [
      {
        facetAddress: ethers.constants.AddressZero, // RMB ZERO ADDRESS
        action: FacetCutAction.Remove,
        functionSelectors: Array.isArray(selectorsToRemove)
          ? selectorsToRemove
          : [selectorsToRemove],
      },
      {
        facetAddress: ctNewFacet.address,
        action: FacetCutAction.Add,
        functionSelectors: [getSelectors(ctNewFacet)[3]],
      },
    ],
    ethers.constants.AddressZero,
    "0x" // zero bytes, "" fails - invalid input
  );

  var rcpt = await tx.wait();
  if (!rcpt.status) {
    throw Error(`Diamond add failed: ${tx.hash}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

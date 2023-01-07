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
/// ----- if all fn selectors removed from a facet,  ----- ///
/// ----- the facet itself is removed -------------------- ///
/// ------------------------------------------------------ ///
//////////////////////////////////////////////////////////////

//
// TODO: currently fn removed is NOT removed from abi (deployments folder...) - DO THIS !!
//

const main = async () => {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const now = Date.now();

  const files = getFiles(CURRENT_DEPLOYED_FOLDER_DIR);
  const addressDiamond = getADiamondAddress(files, "Diamond");

  const diamondCut = await ethers.getContractAt("IDiamondCut", addressDiamond);

  const ctExistingFacet = await ethers.getContractAt(
    "Test2Facet",
    addressDiamond
  );

  const selectors = getSelectors(ctExistingFacet);
  const selectorsToRemove = selectors[4];

  var tx = await diamondCut.diamondCut(
    [
      {
        facetAddress: ethers.constants.AddressZero, // RMB ZERO ADDRESS
        action: FacetCutAction.Remove,
        functionSelectors: Array.isArray(selectorsToRemove)
          ? selectorsToRemove
          : [selectorsToRemove],
      },
    ],
    ethers.constants.AddressZero,
    "0x" // zero bytes, "" fails - invalid input
    // { gasLimit: 800000 }
  );

  var rcpt = await tx.wait();
  if (!rcpt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

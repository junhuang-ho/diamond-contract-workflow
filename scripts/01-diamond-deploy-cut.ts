const hre = require("hardhat");
import { ethers } from "hardhat";
import { deploy } from "./utils";
const { getSelectors, FacetCutAction } = require("../scripts/utilsDiamond");

const main = async () => {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const now = Date.now();

  ////////////////////////////////////
  /// ---------------------------- ///
  /// ----- deploy contracts ----- ///
  /// ---------------------------- ///
  ////////////////////////////////////

  const ctDiamondCut = await deploy(
    deployer,
    chainId,
    "DiamondCutFacet",
    now,
    []
  );
  const ctDiamond = await deploy(deployer, chainId, "Diamond", now, [
    deployer,
    ctDiamondCut?.address,
  ] as any);
  const ctDiamondInit = await deploy(deployer, chainId, "DiamondInit", now, []);

  const FacetNames = [
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "Test1Facet",
    "Test2Facet",
  ];

  const cut = [];
  for (let i = 0; i < FacetNames.length; i++) {
    const facetName = FacetNames[i];
    const contractFacet = await deploy(
      deployer,
      chainId,
      facetName,
      now,
      [] // must be empty
    );
    cut.push({
      facetAddress: contractFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(contractFacet),
    });
  }

  ////////////////////////////////////
  /// ---------------------------- ///
  /// ----- diamond cutting ------ ///
  /// ---------------------------- ///
  ////////////////////////////////////

  const initParams = [] as const;
  let functionCall = ctDiamondInit.interface.encodeFunctionData(
    "init",
    initParams
  );

  console.log("Diamond Cutting 💎");
  const diamondCut = await ethers.getContractAt(
    "IDiamondCut",
    ctDiamond.address
  );
  // call to init function

  var tx = await diamondCut.diamondCut(
    cut,
    ctDiamondInit.address,
    functionCall
  );

  console.log("tx: ", tx.hash);
  const receipt = await tx.wait(1);
  if (!receipt.status) {
    throw Error(`Diamond Cut Failed: ${tx.hash}`);
  }
  console.log("Cut Completed");
  console.log(`Diamond: ${ctDiamond.address}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

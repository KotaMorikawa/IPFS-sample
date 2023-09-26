const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const cid = "QmQBHarz2WFczTjz5GnhjHrbUPDnB48W5BM2v2h6HbE1rZ";
  const metadataURL = `ipfs://${cid}`;

  const lw3PunksContract = await hre.ethers.deployContract("LW3Punks", [
    metadataURL,
  ]);

  await lw3PunksContract.waitForDeployment();

  console.log("LW3Punks Contract Address: ", lw3PunksContract.target);

  await sleep(30 * 1000);

  await hre.run("verify:verify", {
    address: lw3PunksContract.target,
    constructorArguments: [metadataURL],
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });

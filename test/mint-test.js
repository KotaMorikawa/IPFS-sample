const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("IPFT-NFT-TEST", async function () {
  async function preSet() {
    const cid = "QmQBHarz2WFczTjz5GnhjHrbUPDnB48W5BM2v2h6HbE1rZ";
    const metadataURL = `ipfs://${cid}`;
    const [owner, address1, address2] = await ethers.getSigners();
    const lw3PunksContract = await ethers.deployContract("LW3Punks", [
      metadataURL,
    ]);
    return { owner, address1, address2, lw3PunksContract };
  }

  it("mint test: should not mint when paused", async function () {
    const { owner, lw3PunksContract } = await loadFixture(preSet);
    const amount = hre.ethers.parseEther("0.01");
    await expect(
      lw3PunksContract.connect(owner).mint({ value: amount })
    ).to.be.revertedWith("Contract currentry paused");
  });

  it("mint test: should mint NFTs for owner, address1, and address2", async function () {
    const { owner, address1, address2, lw3PunksContract } = await loadFixture(
      preSet
    );
    const amount = hre.ethers.parseEther("0.01");
    await lw3PunksContract.setPaused(false);

    await lw3PunksContract.connect(owner).mint({ value: amount });
    const ownerTokenId = await lw3PunksContract.tokenIds();
    expect(ownerTokenId).to.equal(1);

    await lw3PunksContract.connect(address1).mint({ value: amount });
    const address1TokenId = await lw3PunksContract.tokenIds();
    expect(address1TokenId).to.equal(2);

    await lw3PunksContract.connect(address2).mint({ value: amount });
    const address2TokenId = await lw3PunksContract.tokenIds();
    expect(address2TokenId).to.equal(3);
  });

  it("mint test: should fail to mint when maxTokenIds is reached", async function () {
    const { owner, lw3PunksContract } = await loadFixture(preSet);

    await lw3PunksContract.setPaused(false);
    const amount = hre.ethers.parseEther("0.01");
    // Mint up to maxTokenIds
    for (let i = 1; i <= (await lw3PunksContract.maxTokenIds()); i++) {
      await lw3PunksContract.connect(owner).mint({ value: amount });
    }

    // Attempt to mint one more
    await expect(
      lw3PunksContract.connect(owner).mint({ value: amount })
    ).to.be.revertedWith("Exceed maximum LW3Punks supply");
  });
});

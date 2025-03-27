const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get contract factories
  const StorageToken = await hre.ethers.getContractFactory("StorageToken");
  const FileStorage = await hre.ethers.getContractFactory("FileStorage");
  const StakingContract = await hre.ethers.getContractFactory("StakingContract");

  console.log("Deploying StorageToken...");
  // Deploy StorageToken with initial supply of 1 billion tokens (with 18 decimals)
  const initialSupply = hre.ethers.parseEther("1000000000");
  const storageToken = await StorageToken.deploy(initialSupply);
  await storageToken.waitForDeployment();
  const storageTokenAddress = await storageToken.getAddress();
  console.log(`StorageToken deployed to: ${storageTokenAddress}`);

  console.log("Deploying FileStorage...");
  // Deploy FileStorage with token address and upload cost (0.0001 tokens per byte)
  const uploadCostPerByte = hre.ethers.parseUnits("0.0001", "gwei");
  const fileStorage = await FileStorage.deploy(storageTokenAddress, uploadCostPerByte);
  await fileStorage.waitForDeployment();
  const fileStorageAddress = await fileStorage.getAddress();
  console.log(`FileStorage deployed to: ${fileStorageAddress}`);

  console.log("Deploying StakingContract...");
  // Deploy StakingContract with token address, file storage address, and minimum stake (1000 tokens)
  const minimumStake = hre.ethers.parseEther("1000");
  const stakingContract = await StakingContract.deploy(
    storageTokenAddress,
    fileStorageAddress,
    minimumStake
  );
  await stakingContract.waitForDeployment();
  const stakingContractAddress = await stakingContract.getAddress();
  console.log(`StakingContract deployed to: ${stakingContractAddress}`);

  console.log("Deployment complete!");
  console.log({
    storageToken: storageTokenAddress,
    fileStorage: fileStorageAddress,
    stakingContract: stakingContractAddress
  });

  // Verify if not on localhost
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await storageToken.deployTransaction.wait(5);
    await fileStorage.deployTransaction.wait(5);
    await stakingContract.deployTransaction.wait(5);

    console.log("Verifying contracts...");
    await hre.run("verify:verify", {
      address: storageTokenAddress,
      constructorArguments: [initialSupply],
    });

    await hre.run("verify:verify", {
      address: fileStorageAddress,
      constructorArguments: [storageTokenAddress, uploadCostPerByte],
    });

    await hre.run("verify:verify", {
      address: stakingContractAddress,
      constructorArguments: [storageTokenAddress, fileStorageAddress, minimumStake],
    });
    console.log("Contracts verified!");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
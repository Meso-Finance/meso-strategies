import { ethers } from "hardhat";
import { config } from "./config";
// import { config } from "./config";
import { ConfigItem } from "./types";

export const deployStrat = async (config: ConfigItem) => {
  try {
    const { stratContractName, input, output, pid } = config;
    const stratContract = await ethers.getContractFactory(stratContractName);
    const strat = await stratContract.deploy(input, output, pid);
    await strat.deployed();
    return strat.address;
  } catch (e) {
    console.error(e);
  }
};

export const deployVault = async (config: ConfigItem, strategy: string) => {
  try {
    const { vaultContractName, vaultName, vaultSymbol } = config;
    const vaultContract = await ethers.getContractFactory(vaultContractName);
    const vault = await vaultContract.deploy(strategy, vaultName, vaultSymbol);
    await vault.deployed();
    return vault.address;
  } catch (e) {
    console.error(e);
  }
};

const main = async () => {
  const id = process.env.CONFIG_ID;
  if (!id) {
    throw new Error("No config id supplied");
  }

  const configItem = config[id];
  const stratAddr = await deployStrat(configItem);
  console.log(`Strat Deployed at ${stratAddr}`);
  let vaultAddr;
  if (stratAddr) {
    vaultAddr = await deployVault(configItem, stratAddr);
  }
  console.log(`Vault Deployed at ${vaultAddr}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

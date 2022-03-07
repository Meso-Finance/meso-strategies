import { ethers } from "hardhat";
import { config } from "./config";
// import { config } from "./config";
import { ConfigItem } from "./types";
import { predictAddresses } from "./utils";

export const deployStrat = async (config: ConfigItem) => {
  try {
    const {
      stratContractName,
      input,
      output,
      pid,
      vaultAddress,
      harvester,
      keeper,
      strategist,
      unirouter,
      masterchef,
      wnative,
      stable,
      outputToUsdcRoute,
      outputToLp0Route,
      outputToLp1Route,
    } = config;
    const stratContract = await ethers.getContractFactory(stratContractName);
    const strat = await stratContract.deploy(
      input,
      output,
      pid,
      keeper,
      strategist,
      unirouter,
      vaultAddress,
      harvester,
      masterchef,
      wnative,
      stable,
      outputToUsdcRoute,
      outputToLp0Route,
      outputToLp1Route
    );
    await strat.deployed();
    return strat.address;
  } catch (e) {
    console.error(e);
  }
};

export const deployVault = async (config: ConfigItem) => {
  try {
    const { vaultContractName, vaultName, vaultSymbol, strategyAddress } =
      config;
    const vaultContract = await ethers.getContractFactory(vaultContractName);
    const vault = await vaultContract.deploy(
      strategyAddress,
      vaultName,
      vaultSymbol
    );
    await vault.deployed();
    return vault.address;
  } catch (e) {
    console.error(e);
  }
};

const getAddresses = async () => {
  const signers = await ethers.getSigners();
  return predictAddresses({ creator: signers[0].address });
};

const main = async () => {
  const id = process.env.CONFIG_ID;
  if (!id) {
    throw new Error("No config id supplied");
  }
  const { vault, strategy } = await getAddresses();
  const configItem = Object.assign({}, config[id], {
    vaultAddress: vault,
    strategyAddress: strategy,
  });
  console.log(configItem);
  const vaultAddr = await deployVault(configItem);
  const stratAddr = await deployStrat(configItem);
  console.log(`Strat Deployed at ${stratAddr}`);
  console.log(`Vault Deployed at ${vaultAddr}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "hardhat";
import { ConfigItem } from "./types";
import { predictAddresses } from "./utils";
import IRouter from "./abis/IUniswapRouter.json";
import IPair from "./abis/IUniswapPair.json";
import { BigNumber as BN } from "bignumber.js";
import VaultABI from "./abis/Vault.json";
import StratABI from "./abis/Strat.json";
// import SpookyChefABI from "./abis/SpookyChef.json";

BN.config({ DECIMAL_PLACES: 6 });

let config: ConfigItem = {
  input: "0xEc7178F4C41f346b2721907F5cF7628E388A7a58",
  output: "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE",
  pid: 0,
  stratContractName: "MesoFTMStrategyLP",
  vaultContractName: "MesoFTMVaultV2",
  vaultName: "Meso Fork Test Vault",
  vaultSymbol: "MESOFORKTEST",
  supportsVerify: false,
  vaultAddress: "",
  strategyAddress: "",
  harvester: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  unirouter: "0xF491e7B69E4244ad4002BC14e878a34207E38c29",
  strategist: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  keeper: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  masterchef: "0x2b2929E785374c651a81A63878Ab22742656DcDd",
};

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
      masterchef
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

// const format = (bn: BigNumber, decimals: number) =>
//   ethers.utils.formatUnits(bn, decimals);

const getAddresses = async () => {
  const signers = await ethers.getSigners();
  return predictAddresses({ creator: signers[0].address });
};

// const printPools = async () => {
//   const spooky = await ethers.getContractAt(
//     SpookyChefABI,
//     "0x2b2929E785374c651a81A63878Ab22742656DcDd"
//   );
//   const length = await spooky.poolLength();
//   for (let i = 0; i <= length.toNumber(); i++) {
//     const pool = await spooky.poolInfo(i);
//     console.log(i);
//     console.log(pool);
//   }
// };

export const deploy = async () => {
  // const id = process.env.CONFIG_ID;
  // if (!id) {
  //   throw new Error("No config id supplied");
  // }
  const { vault, strategy } = await getAddresses();
  config = Object.assign({}, config, {
    vaultAddress: vault,
    strategyAddress: strategy,
  });
  const vaultAddr = await deployVault(config);
  const stratAddr = await deployStrat(config);
  console.log(`Strat Deployed at ${stratAddr}`);
  console.log(`Vault Deployed at ${vaultAddr}`);
};

const testDeposits = async () => {
  const router = await ethers.getContractAt(IRouter, config.unirouter);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  // get the tokens
  const erc20 = await ethers.getContractAt("IERC20", config.output);
  const ftm = await ethers.provider.getBalance(config.harvester);
  console.log(`FTM Balance: ${ethers.utils.formatUnits(ftm, 18)}`);
  let balance = await erc20.balanceOf(config.keeper);
  console.log(
    `Boo Balance Before Swap: ${ethers.utils.formatUnits(balance, 18)}`
  );
  const wftm = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
  const boo = "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE";
  const weth = await ethers.getContractAt("IERC20", wftm);
  const pairAddr = "0xEc7178F4C41f346b2721907F5cF7628E388A7a58";
  await router.swapExactETHForTokens(0, [wftm, boo], config.keeper, deadline, {
    value: ethers.utils.parseUnits("100", "ether"),
  });
  balance = await erc20.balanceOf(config.keeper);
  console.log(
    `Boo Balance after swap: ${ethers.utils.formatUnits(balance, 18)}`
  );

  const pair = await ethers.getContractAt(IPair, pairAddr);
  const reserves = await pair.getReserves();
  const ratio = new BN(reserves[0].toString())
    .div(new BN(10).pow(18))
    .div(new BN(reserves[1].toString()).div(new BN(10).pow(18)));

  // console.log(`ftm/boo => ${ratio}}`);
  // console.log(router.)
  await erc20.approve(config.unirouter, ethers.constants.MaxUint256);
  await weth.approve(config.unirouter, ethers.constants.MaxUint256);

  await router.addLiquidityETH(
    boo,
    ethers.utils.parseEther("1"),
    ethers.utils.parseEther("0.5"),
    ethers.utils.parseEther(ratio.minus(new BN(2)).toString()),
    config.harvester,
    deadline,
    { value: ethers.utils.parseEther(ratio.plus(new BN(5)).toString()) }
  );

  const depositAmount = await pair.balanceOf(config.harvester);

  const vaultContract = await ethers.getContractAt(
    VaultABI,
    config.vaultAddress
  );
  await pair.approve(config.vaultAddress, ethers.constants.MaxUint256);
  await vaultContract.deposit(depositAmount);
  const vaultBalance = await vaultContract.balance();
  console.log(`Balance: ${vaultBalance}`);
};

const testHarvest = async () => {
  const strat = await ethers.getContractAt(StratABI, config.strategyAddress);
  await strat.harvest();
  const vaultContract = await ethers.getContractAt(
    VaultABI,
    config.vaultAddress
  );
  const balance = await vaultContract.balance();
  console.log(`Balance after harvest: ${balance}`);
};

const main = async () => {
  await deploy();
  await testDeposits();
  await testHarvest();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

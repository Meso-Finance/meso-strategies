import { ConfigItem } from "./types";

export const config: { [key: string]: ConfigItem } = {
  [`omnidex-wbtc-tlos`]: {
    input: "0x427E9A7bb848444a72faA3248c48F3B302429725",
    output: "0xd2504a02fABd7E546e41aD39597c377cA8B0E1Df",
    pid: 4,
    stratContractName: "MesoOmniStrategyLP",
    vaultContractName: "MesoOmniVaultV2",
    vaultName: "MESOBTCTLOS Vault",
    vaultSymbol: "MESOBTCTLOS",
    supportsVerify: false,
  },
};

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
    vaultAddress: "",
    strategyAddress: "",
    harvester: "0x2E36C8c81664062654D81d5d29af80FC90145e7C",
    unirouter: "0xF9678db1CE83f6f51E5df348E2Cc842Ca51EfEc1",
    strategist: "0xDef1ffF6D3a78e30b772B8BC9f8a7BDea06C520D",
    keeper: "0xDef1ffF6D3a78e30b772B8BC9f8a7BDea06C520D",
  },
};

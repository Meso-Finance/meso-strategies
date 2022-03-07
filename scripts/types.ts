export interface Platform {
  harvester: string;
  unirouter: string;
  strategist: string;
  keeper: string;
  masterchef: string;
  wnative: string;
  stable: string;
}

export interface ConfigItem extends Platform {
  input: string;
  output: string;
  pid: number | undefined;
  stratContractName: string;
  vaultContractName: string;
  vaultName: string;
  vaultSymbol: string;
  supportsVerify: boolean;
  vaultAddress: string;
  strategyAddress: string;
  outputToUsdcRoute?: string[];
  outputToLp0Route?: string[];
  outputToLp1Route?: string[];
}

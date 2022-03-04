export interface ConfigItem {
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
  harvester: string;
  keeper: string;
  strategist: string;
  unirouter: string;
}

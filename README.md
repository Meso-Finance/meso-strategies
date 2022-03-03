## Meso Strategies and Vaults

This is the repo for the Meso Autocompounder.

## Adding new vault:

1) Create a new config in `scripts/config.ts`

```js

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

```
2) Run the deployment script by providing config_id as an env variable

```bash
PRIVATE_KEY=XXXXX CONFIG_ID=omnidex-wbtc-tlos npx hardhat run scripts/deploy.ts --network telos
```

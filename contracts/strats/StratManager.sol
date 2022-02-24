// SPDX-License-Identifier: NONE
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract StratManager is Ownable, Pausable {
    /**
     * @dev Meso Contracts:
     * {keeper} - Address to manage a few lower risk features of the strat
     * {strategist} - Address of the strategy author/deployer where strategist fee will go.
     * {vault} - Address of the vault that controls the strategy's funds.
     * {unirouter} - Address of exchange to execute swaps.
     */
    address public keeper;
    address public strategist;
    address public unirouter;
    address public vault;
    address public harvester;

    event StratSetHarvester(address indexed _StratSetHarvester);
    event StratSetKeeper(address indexed _StratSetKeeper);
    event StratSetStrategist(address indexed _setStrategist);
    event StratSetVault(address indexed _setVault);

    /**
     * @dev Initializes the base strategy.
     * _keeper address to use as alternative owner.
     * _strategist address where strategist fees go.
     * _unirouter router to use for swaps
     * _vault address of parent vault.
     */

    // checks that caller is either owner or keeper.
    modifier onlyManager() {
        require(
            msg.sender == owner() || msg.sender == keeper,
            "Meso Strat Error: Unauthorized access. Only the manager can access this."
        );
        _;
    }

    // verifies that the caller is not a contract.
    modifier onlyEOA() {
        require(
            msg.sender == tx.origin,
            "Meso Strat Error: Unauthorized access. Only EOAs can access this."
        );
        _;
    }

    // Modifier for harvester only functions.
    modifier onlyHarvester() {
        require(
            msg.sender == harvester,
            "Meso Strat Error: Unauthorized access. Only the harvester can access this."
        );
        _;
    }

    // Function to set the contract address for the caller of the harvest function
    function setHarvester(address _harvester) external onlyManager {
        require(
            _harvester != address(0),
            "Meso Strat Error: Harvester cannot be zero address"
        );
        harvester = _harvester;
        emit StratSetHarvester(_harvester);
    }

    /**
     * @dev Updates address of the strat keeper.
     * @param _keeper new keeper address.
     */
    function setKeeper(address _keeper) external onlyManager {
        require(
            _keeper != address(0),
            "Meso Strat Error: Keeper cannot be zero address"
        );
        keeper = _keeper;
        emit StratSetKeeper(_keeper);
    }

    /**
     * @dev Updates address where strategist fee earnings will go.
     * @param _strategist new strategist address.
     */
    function setStrategist(address _strategist) external onlyOwner {
        //Requiring this as there are transfer functions attached to strategist.
        //Transferring to the zero address breaks the transfer function.
        require(
            _strategist != address(0),
            "Meso Strat Error: Strategist cannot be the zero address"
        );
        strategist = _strategist;
        emit StratSetStrategist(_strategist);
    }

    /**
     * @dev Updates parent vault.
     * @param _vault new vault address.
     */
    function setVault(address _vault) external onlyOwner {
        require(
            _vault != address(0),
            "Meso Strat Error: Vault cannot be the zero address"
        );
        require(
            vault == address(0),
            "Meso Strat Error: Vault already initialized"
        );
        vault = _vault;
        emit StratSetVault(_vault);
    }

    /**
     * @dev Function to synchronize balances before new user deposit.
     * Can be overridden in the strategy.
     */
    function beforeDeposit() external virtual {}
}

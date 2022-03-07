// SPDX-License-Identifier: NONE
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../../interfaces/IStrategy.sol";

contract MesoTelosVaultV2 is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // The strategy currently in use by the vault.
    IStrategy public strategy;

    // The deposit and withdrawal fee of the vaults, modifiable but with a capped value
    uint256 public depositFeeBP = 10;

    // The capped values of the deposit and withdrawal fee
    uint256 public constant MAX_DEPOSIT_FEE = 500;

    /**
     * @dev Sets the value of {token} to the token that the vault will
     * hold as underlying value. It initializes the vault's own 'moo' token.
     * This token is minted when someone does a deposit. It is burned in order
     * to withdraw the corresponding portion of the underlying assets.
     * @param _strategy the address of the strategy.
     * @param _name the name of the vault token.
     * @param _symbol the symbol of the vault token.
     */
    constructor(
        IStrategy _strategy,
        string memory _name,
        string memory _symbol
    ) public ERC20(_name, _symbol) {
        strategy = _strategy;
    }

    event UserDeposit(address indexed user, uint256 amount);
    event UserWithdraw(address indexed user, uint256 amount);
    event StuckTokensWithdrawn(address indexed token, uint256 amount);
    event UpdateDepositFeeBP(uint256 depFee);
    event UpdateFeeAddress(address feeAddress);

    function input() public view returns (IERC20) {
        return IERC20(strategy.inputToken());
    }

    /**
     * @dev It calculates the total underlying value of {token} held by the system.
     * It takes into account the vault contract balance, the strategy contract balance
     *  and the balance deployed in other contracts as part of the strategy.
     */
    function balance() public view returns (uint256) {
        return
            input().balanceOf(address(this)).add(
                IStrategy(strategy).balanceOf()
            );
    }

    /**
     * @dev Custom logic in here for how much the vault allows to be borrowed.
     * We return 100% of tokens for now. Under certain conditions we might
     * want to keep some of the system funds at hand in the vault, instead
     * of putting them to work.
     */
    function available() public view returns (uint256) {
        return input().balanceOf(address(this));
    }

    /**
     * @dev Function for various UIs to display the current value of one of our yield tokens.
     * Returns an uint256 with 18 decimals of how much underlying asset one vault share represents.
     */
    function getPricePerFullShare() public view returns (uint256) {
        return
            totalSupply() == 0 ? 1e18 : balance().mul(1e18).div(totalSupply());
    }

    /**
     * @dev A helper function to call deposit() with all the sender's funds.
     */
    function depositAll() external {
        deposit(input().balanceOf(msg.sender));
    }

    /**
     * @dev The entrypoint of funds into the system. People deposit with this function
     * into the vault. The vault is then in charge of sending funds into the strategy.
     */
    function deposit(uint256 _amount) public nonReentrant {
        require(_amount > 0, "MESO: deposit equal to 0");

        strategy.beforeDeposit();

        uint256 depositFee = _amount.mul(depositFeeBP).div(10000);

        uint256 _pool = balance();

        input().safeTransferFrom(msg.sender, address(strategy), depositFee);
        input().safeTransferFrom(
            msg.sender,
            address(this),
            _amount.sub(depositFee)
        );
        
        _amount = balance().sub(_pool).sub(depositFee); // Additional check for deflationary tokens
        earn(_amount);

        _amount = balance().sub(_pool);
        uint256 shares = 0;

        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount.mul(totalSupply())).div(_pool);
        }

        _mint(msg.sender, shares);
        

        emit UserDeposit(msg.sender, _amount);
    }

    /**
     * @dev Function to send funds into the strategy and put them to work. It's primarily called
     * by the vault's deposit() function.
     */
    function earn(uint256 _amount) internal {
        require(panicStatus() != true, "Already emergency Withdrawn.");

        //uint16 depositFeeMC = strategy.getDepositFee();
        //require(depositFeeMC <= 2000, "Third party MC has over 20% deposit fees");

        uint256 before = input().balanceOf(address(strategy));
        input().safeTransfer(address(strategy), _amount);

        _amount = input().balanceOf(address(strategy)).sub(before);
        strategy.deposit(_amount);
    }

    // Checks the strategy for its panic status.
    function panicStatus() public view returns (bool) {
        strategy.panicStatus();
    }

    /**
     * @dev A helper function to call withdraw() with all the sender's funds.
     */
    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    /**
     * @dev Function to exit the system. The vault will withdraw the required tokens
     * from the strategy and pay up the token holder. A proportional number of IOU
     * tokens are burned in the process.
     */
    function withdraw(uint256 _shares) public {
        uint256 r = (balance().mul(_shares)).div(totalSupply());
        _burn(msg.sender, _shares);

        uint256 b = input().balanceOf(address(this));
        if (b < r) {
            uint256 _withdraw = r.sub(b);
            strategy.withdraw(_withdraw);
            uint256 _after = input().balanceOf(address(this));
            uint256 _diff = _after.sub(b);
            if (_diff < _withdraw) {
                r = b.add(_diff);
            }
        }

        input().safeTransfer(msg.sender, r);

        emit UserWithdraw(msg.sender, r);
    }

    /**
     * @dev Rescues random funds stuck that the strat can't handle.
     * @param _token address of the token to rescue.
     */
    function inCaseTokensGetStuck(address _token) external onlyOwner {
        require(_token != address(input()), "!token");

        uint256 amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, amount);

        emit StuckTokensWithdrawn(_token, amount);
    }

    // Adjusts the deposit fee basis points of vaults up to a maximum of 5%.
    function setDepositFeeBP(uint256 _depositFeeBP) external onlyOwner {
        require(_depositFeeBP <= MAX_DEPOSIT_FEE, "Fees too high!");
        depositFeeBP = _depositFeeBP;

        emit UpdateDepositFeeBP(_depositFeeBP);
    }
}

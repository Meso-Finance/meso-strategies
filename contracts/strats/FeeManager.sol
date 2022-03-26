// SPDX-License-Identifier: NONE
pragma solidity ^0.6.12;

import "./StratManager.sol";

abstract contract FeeManager is StratManager {
    uint public STRATEGIST_FEE = 250;
    uint constant public MAX_FEE = 600;
    
    event feeChange(address indexed  _manager, uint indexed _newFee);
    
    function setStrategistFee(uint _fee) external onlyManager{
        require(_fee <= MAX_FEE,"Must be less than MAX_FEE");
        STRATEGIST_FEE = _fee;
        emit feeChange(msg.sender,_fee);
    }

}
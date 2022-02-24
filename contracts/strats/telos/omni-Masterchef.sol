// SPDX-License-Identifier: NONE
pragma solidity ^0.6.0;

interface IMasterChef {
    function deposit(uint256 _pid, uint256 _amount) external;
    function withdraw(uint256 _pid, uint256 _amount) external;
    function pendingCharm(uint256 _pid, address _user) external view returns (uint256);
    function userInfo(uint256 _pid, address _user) external view returns (uint256, uint256);
    function emergencyWithdraw(uint256 _pid) external;
    function poolInfo(uint256 _pid) external view returns (
        address lpToken, 
        uint256 allocPoint, 
        uint256 lastRewardTime, 
        uint256 accCharmPerShare, 
        uint16 depositFeeBP,
        uint256 lpSupply
    );
}
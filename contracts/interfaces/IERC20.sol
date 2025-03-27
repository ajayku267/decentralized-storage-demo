// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @dev Interface for the ERC-20 token standard
 */
interface IERC20 {
    /**
     * @dev Emitted when tokens are transferred, including zero value transfers
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when an allowance is set
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the total supply of the token
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the balance of the specified account
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Transfers tokens to a specified address
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the allowance of the spender for the owner
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Approves the spender to spend tokens on behalf of the caller
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Transfers tokens from one address to another
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
} 
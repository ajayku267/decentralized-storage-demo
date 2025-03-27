// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

/**
 * @title StorageToken
 * @dev Implementation of the ERC-20 token standard for the decentralized storage system
 */
contract StorageToken is IERC20 {
    // Token metadata
    string public constant name = "Storage Token";
    string public constant symbol = "STR";
    uint8 public constant decimals = 18;
    
    // Total token supply
    uint256 private _totalSupply;
    
    // Balance of each account
    mapping(address => uint256) private _balances;
    
    // Allowances for each account
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Reward rate for storage providers (tokens per byte per day)
    uint256 public rewardRate;
    
    // Staking information for providers
    struct StakingInfo {
        uint256 stakedAmount;
        uint256 stakingTimestamp;
    }
    
    // Mapping of stakers to their staking info
    mapping(address => StakingInfo) private _stakes;
    
    // Array of all stakers
    address[] private _stakers;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    
    /**
     * @dev Constructor mints tokens to the deployer
     * @param initialSupply Initial token supply to mint
     */
    constructor(uint256 initialSupply) {
        _mint(msg.sender, initialSupply);
        
        // Set initial reward rate (can be adjusted later)
        rewardRate = 10 wei; // 10 wei per byte per day
    }
    
    /**
     * @dev Returns the total supply of tokens
     * @return Total token supply
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    /**
     * @dev Returns the balance of the specified account
     * @param account The account to query
     * @return The account balance
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev Transfers tokens to a specified address
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return Whether the transfer was successful
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Returns the allowance of the spender for the owner
     * @param owner The owner address
     * @param spender The spender address
     * @return The allowance amount
     */
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    /**
     * @dev Approves the spender to spend tokens on behalf of the caller
     * @param spender The spender address
     * @param amount The amount to approve
     * @return Whether the approval was successful
     */
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfers tokens from one address to another
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return Whether the transfer was successful
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Increases the allowance of the spender
     * @param spender The spender address
     * @param addedValue The value to add to the allowance
     * @return Whether the operation was successful
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
        return true;
    }
    
    /**
     * @dev Decreases the allowance of the spender
     * @param spender The spender address
     * @param subtractedValue The value to subtract from the allowance
     * @return Whether the operation was successful
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        _approve(msg.sender, spender, currentAllowance - subtractedValue);
        return true;
    }
    
    /**
     * @dev Sets the reward rate for storage providers
     * @param newRate The new reward rate
     */
    function setRewardRate(uint256 newRate) public {
        // In a production environment, this would have access control
        rewardRate = newRate;
    }
    
    /**
     * @dev Stakes tokens to become a storage provider
     * @param amount The amount to stake
     * @return success Whether the operation was successful
     */
    function stake(uint256 amount) public returns (bool success) {
        require(amount > 0, "Cannot stake 0 tokens");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        // Check if user is already staking
        if (_stakes[msg.sender].stakedAmount == 0) {
            _stakers.push(msg.sender);
        } else {
            // Claim any pending rewards before adding more stake
            _claimReward(msg.sender);
        }
        
        // Update staking info
        _stakes[msg.sender].stakedAmount += amount;
        _stakes[msg.sender].stakingTimestamp = block.timestamp;
        
        // Move tokens from balance to stake
        _balances[msg.sender] -= amount;
        
        emit Staked(msg.sender, amount);
        
        return true;
    }
    
    /**
     * @dev Unstakes tokens
     * @param amount The amount to unstake
     * @return success Whether the operation was successful
     */
    function unstake(uint256 amount) public returns (bool success) {
        require(amount > 0, "Cannot unstake 0 tokens");
        require(_stakes[msg.sender].stakedAmount >= amount, "Insufficient staked tokens");
        
        // Claim pending rewards
        _claimReward(msg.sender);
        
        // Update staking info
        _stakes[msg.sender].stakedAmount -= amount;
        _stakes[msg.sender].stakingTimestamp = block.timestamp;
        
        // Move tokens from stake to balance
        _balances[msg.sender] += amount;
        
        emit Unstaked(msg.sender, amount);
        
        // If no more tokens staked, remove from stakers list
        if (_stakes[msg.sender].stakedAmount == 0) {
            for (uint256 i = 0; i < _stakers.length; i++) {
                if (_stakers[i] == msg.sender) {
                    _stakers[i] = _stakers[_stakers.length - 1];
                    _stakers.pop();
                    break;
                }
            }
        }
        
        return true;
    }
    
    /**
     * @dev Returns staking information for an address
     * @param staker The staker address
     * @return stakedAmount The amount staked
     * @return stakingTimestamp The timestamp of the last staking update
     * @return pendingReward The pending reward
     */
    function getStakingInfo(address staker)
        public
        view
        returns (
            uint256 stakedAmount,
            uint256 stakingTimestamp,
            uint256 pendingReward
        )
    {
        StakingInfo memory info = _stakes[staker];
        
        return (
            info.stakedAmount,
            info.stakingTimestamp,
            _calculateReward(staker)
        );
    }
    
    /**
     * @dev Claims pending staking rewards
     * @return reward The amount of rewards claimed
     */
    function claimReward() public returns (uint256 reward) {
        reward = _claimReward(msg.sender);
        return reward;
    }
    
    /**
     * @dev Internal function to claim rewards
     * @param staker The staker address
     * @return reward The amount of rewards claimed
     */
    function _claimReward(address staker) private returns (uint256 reward) {
        reward = _calculateReward(staker);
        
        if (reward > 0) {
            // Update staking timestamp
            _stakes[staker].stakingTimestamp = block.timestamp;
            
            // Mint rewards
            _mint(staker, reward);
            
            emit RewardPaid(staker, reward);
        }
        
        return reward;
    }
    
    /**
     * @dev Calculates pending reward for a staker
     * @param staker The staker address
     * @return reward The pending reward
     */
    function _calculateReward(address staker) private view returns (uint256 reward) {
        if (_stakes[staker].stakedAmount == 0) {
            return 0;
        }
        
        // Calculate time staked in days (using whole days for simplicity)
        uint256 timeStaked = (block.timestamp - _stakes[staker].stakingTimestamp) / 1 days;
        
        // Calculate reward based on staked amount, time, and reward rate
        reward = _stakes[staker].stakedAmount * timeStaked * rewardRate / 1e18;
        
        return reward;
    }
    
    /**
     * @dev Internal function to transfer tokens
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from the zero address");
        require(to != address(0), "Transfer to the zero address");
        require(_balances[from] >= amount, "Transfer amount exceeds balance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    /**
     * @dev Internal function to mint tokens
     * @param account The account to mint to
     * @param amount The amount to mint
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Mint to the zero address");
        
        _totalSupply += amount;
        _balances[account] += amount;
        
        emit Transfer(address(0), account, amount);
    }
    
    /**
     * @dev Internal function to burn tokens
     * @param account The account to burn from
     * @param amount The amount to burn
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "Burn from the zero address");
        require(_balances[account] >= amount, "Burn amount exceeds balance");
        
        _balances[account] -= amount;
        _totalSupply -= amount;
        
        emit Transfer(account, address(0), amount);
    }
    
    /**
     * @dev Internal function to approve spending of tokens
     * @param owner The owner address
     * @param spender The spender address
     * @param amount The amount to approve
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "Approve from the zero address");
        require(spender != address(0), "Approve to the zero address");
        
        _allowances[owner][spender] = amount;
        
        emit Approval(owner, spender, amount);
    }
    
    /**
     * @dev Internal function to spend allowance
     * @param owner The owner address
     * @param spender The spender address
     * @param amount The amount to spend
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Insufficient allowance");
            _approve(owner, spender, currentAllowance - amount);
        }
    }
} 
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

import "../eip20/BEP20.sol";
import "../utils/AccessControl.sol";
import "../utils/ReentrancyGuard.sol";
import "../utils/SafeMath.sol";
import "../eip20/SafeBEP20.sol";

import "hardhat/console.sol";

contract PublicSaleRounds is BEP20, AccessControl, ReentrancyGuard {
    using SafeBEP20 for BEP20;
    using SafeMath for uint256;

    struct VestingType {
        uint256 allocation;
        uint256 tgePercent;
        uint256 startTimeVesting;   // time start vesting
    }

    struct VestingInfo {
        uint256 amount;             // total amount
        uint256 claimedAmount;      // claimed vest
    }

    mapping(uint256 => uint256) private _projectSupplys;
    mapping(address => VestingInfo) private _vestingList;

    VestingType public _vestingTypes;

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ADMIN role required");
        _;
    }

    constructor(address multiSigAccount, string memory name, string memory symbol) BEP20(name, symbol) {
        renounceRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(DEFAULT_ADMIN_ROLE, multiSigAccount);

        _vestingTypes.allocation = 2700000 * 10**18;
        _vestingTypes.tgePercent = 0.4 * 10**18;
        _vestingTypes.startTimeVesting = 0;
    }

    function getStartTimeVesting() public view returns (uint256) {
        return _vestingTypes.startTimeVesting;
    }

    function setStartTimeVesting(uint256 startTimeVesting) public onlyAdmin {
        _vestingTypes.startTimeVesting = startTimeVesting;
    }

    function addVestingToken(
        address beneficiary,
        uint256 amount
    ) external onlyAdmin {
        require(beneficiary != address(0), "Zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(_vestingTypes.startTimeVesting > 0, "No vesting time");

        uint256 tgeClaimed = 0;

        if (_vestingTypes.tgePercent > 0 ) {
            tgeClaimed = (amount * _vestingTypes.tgePercent);
        }

        if (tgeClaimed > 0 ) {
            _mint(beneficiary, tgeClaimed);
        }
        _vestingTypes.allocation = _vestingTypes.allocation - tgeClaimed;
    }

    function revokeVestingToken(address user) external onlyAdmin {
        uint256 claimableAmount = _getVestingClaimableAmount(user);

        if (claimableAmount > 0) {
            require(totalSupply() + claimableAmount <= _vestingTypes.allocation, "Max supply exceeded");
            _mint(user, claimableAmount);
            _vestingList[user].claimedAmount = _vestingList[user].claimedAmount.add(claimableAmount);
    
            // _projectSupplys = _projectSupplys.sub(_vestingList[user].amount.sub(_vestingList[user].claimedAmount));
        }
    }

    function getVestingInfoByUser(address user) external view returns (VestingInfo memory) {
        return _vestingList[user];   
    }

    /**
    * @dev
    *
    * Requirements:
    *
    * - `user` cannot be the zero address.
    */
    function _getVestingClaimableAmount(address user) internal view returns (uint256 claimableAmount) {
        VestingType memory vestingTypeInfo = _vestingTypes;
        VestingInfo memory info = _vestingList[user];

        if (block.timestamp < vestingTypeInfo.startTimeVesting) return 0;

        claimableAmount = 0;

        uint256 tgeReleasedAmount = 0;
        uint256 roundReleasedAmount = 0;
        uint256 releasedAmount = 0;

        uint256 releaseTime = _vestingTypes.startTimeVesting;

        if(vestingTypeInfo.tgePercent > 0) {
            tgeReleasedAmount = info.amount.mul(_vestingTypes.tgePercent).div(10**18);
        }

        if(block.timestamp >= releaseTime) {
            uint256 roundPassed = ((block.timestamp - _vestingTypes.startTimeVesting).mul(30)).add(1);
            uint256 releaseRounds = 3;

            if(roundPassed >= releaseRounds) {
                roundReleasedAmount = _vestingTypes.allocation.sub(tgeReleasedAmount); 
            }

            if (roundPassed >= (releaseRounds -1) && roundPassed < releaseRounds) {
                roundReleasedAmount = info.amount.mul(_vestingTypes.tgePercent).div(10**18);
            }

            roundReleasedAmount = info.amount.mul(_vestingTypes.tgePercent).div(10**18);
        }

        releasedAmount = tgeReleasedAmount + roundReleasedAmount;

        if (releasedAmount > info.claimedAmount.sub(tgeReleasedAmount)) {
            claimableAmount = releasedAmount - info.claimedAmount;
        }
    }

    function getVestingClaimableAmount(address user) external view returns (uint256) {
        return _getVestingClaimableAmount(user);
    }

    /**
     * User using this function to claim token as rewards
     * claimPercent describe percentage of claimable token that user want to claim
     * default is 100%
     */
   function claimVestingToken(uint256 claimPercent) external nonReentrant returns (uint256) {
        uint256 claimableAmount = _getVestingClaimableAmount(_msgSender()).mul(claimPercent).div(10**18);
        require(claimableAmount > 0, "Nothing to claim");
        require(totalSupply() + claimableAmount <= _vestingTypes.allocation, "Max supply exceeded");

        _vestingList[_msgSender()].claimedAmount = _vestingList[_msgSender()].claimedAmount.add(claimableAmount);
        _mint(_msgSender(), claimableAmount);

        return claimableAmount;
    }

    receive() external payable {
        revert();
    }
}
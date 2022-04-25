// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "../utils/AccessControl.sol";
import "../utils/ReentrancyGuard.sol";
import "../utils/SafeMath.sol";
import "../GDC.sol";
import "../eip20/IBEP20.sol";
import "../eip20/SafeBEP20.sol";
import "../farm/ItemSetup.sol";

contract BuyItems is AccessControl, ReentrancyGuard {
    using SafeBEP20 for IBEP20;

    ItemSetup public itemSetup;
    IBEP20 public gdcToken;

    event UpdateTokenContract(address tokenAddress);

    struct Items{
        uint256 gdcToBuy;
        uint256 remainItems;
    }

    address public marketingAddress = 0x91419d12678Ad484C87dCF15727C1eB25400A264;
    uint256 public itemCanBuy;

    mapping(uint256 => Items) public items;
    mapping(address => uint256) public users; // so luong items da mua

    modifier onlyOwner() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not Admin");
        _;
    }

    constructor(
        IBEP20 _gdcToken
    ) {
        _setupRole( DEFAULT_ADMIN_ROLE, msg.sender);
        gdcToken = IBEP20(_gdcToken);
    }

    function setItemCanBuy(uint256 value) external onlyOwner {
        itemCanBuy = value;
    }

    function setItem(uint256 itemType, uint256[] memory values) external onlyOwner {
        items[itemType].gdcToBuy = values[0];
        items[itemType].remainItems = values[1];
    }

    function setGDCTokenContract(address tokenAddress) external onlyOwner {
        gdcToken = IBEP20(tokenAddress);
        emit UpdateTokenContract(tokenAddress);
    }

    function setMarketingAddress(address _marketingAddress) external onlyOwner {
        marketingAddress = _marketingAddress;
    }

    function Buy(uint256 itemType) external nonReentrant returns (uint256){
        require(items[itemType].remainItems > 0, "Out of item with type");
        uint256 price = items[itemType].gdcToBuy;
        gdcToken.safeTransferFrom(msg.sender, address(this), price);
        return price;
    }

    function payForOperation(address payer, uint256 amount) internal {
        gdcToken.safeTransferFrom(payer, address(this), amount);
  }

    function isContract(address account) internal view returns (bool) {
    // This method relies on extcodesize, which returns 0 for contracts in
    // construction, since the code is only stored at the end of the
    // constructor execution.

        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
  }

    function marketing(address token) external onlyOwner {
        IBEP20 tokenInstance = IBEP20(token);
        tokenInstance.safeTransfer(
            marketingAddress,
            tokenInstance.balanceOf(address(this))
        );
    }
}
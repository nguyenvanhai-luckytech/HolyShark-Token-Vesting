// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "../ItemLibrary.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ItemSetup is OwnableUpgradeable {

    uint256 public itemName;
    uint256 public amountItem;
    uint256 public categoryItem;

    function initialize() public initializer {
        __Ownable_init();
    }

    function setItemName(uint256 value) external onlyOwner {
        itemName = value;
    }

    function setAmountItem(uint256 value) external onlyOwner {
        amountItem = value;
    }

    function setCategoryItem(uint256 value) external onlyOwner {
        categoryItem = value;
    }

    function getItemName() external view returns (uint256) {
        return itemName;
    }

    function getAmountItem() external view returns (uint256) {
        return amountItem;
    }

    function getCategoryItem() external view returns (uint256) {
        return categoryItem;
    }

}
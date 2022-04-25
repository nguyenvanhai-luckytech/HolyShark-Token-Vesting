// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.9;

library ItemLibrary {
    struct Item {
        uint256 tokenId;
        uint256 itemName;
        uint256 amountItem;
        uint256 categoryItem;
    }
}
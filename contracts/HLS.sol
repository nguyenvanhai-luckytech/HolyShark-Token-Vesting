// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

import "./core/TokenBase.sol";

contract HLS is TokenBase {
    constructor(address multiSigAccount) TokenBase(multiSigAccount, "HLS", "HLS") {}
}
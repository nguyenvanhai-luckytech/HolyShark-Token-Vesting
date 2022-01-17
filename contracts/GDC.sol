// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

import "./eip20/BEP20.sol";
import "./utils/AccessControl.sol";
import "./utils/ReentrancyGuard.sol";

contract GDC is BEP20, AccessControl, ReentrancyGuard {
    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ADMIN role required");
        _;
    }

    constructor(address multiSigAccount) BEP20("GDC", "GDC") {}

    function mint(address _to, uint256 _amount) public onlyAdmin {
        _mint(_to, _amount);
    }

    function burn(address _account, uint256 _amount) public onlyAdmin {
        _burn(_account, _amount);
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

// import "../GDC.sol";
import "../utils/AccessControl.sol";
import "../utils/ReentrancyGuard.sol";
import "../utils/SafeMath.sol";
import "../eip20/SafeBEP20.sol";
import "../eip20/BEP20.sol";

contract Farmimg is BEP20, AccessControl, ReentrancyGuard {
    using SafeMath for uint256;

    struct ClaimInfo {
        uint256 tokenId;
        uint256 itemName;
        uint256 categoryItem;
        uint256 amount;
        bool isActive;
    }

    address public minter;
    address private owner;

    mapping( uint256 => mapping(address => ClaimInfo)) public claimInfo;

    constructor() payable BEP20("GDC", "GDC") {
        owner = msg.sender;
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ADMIN role required");
        _;
    }

    event MinterChanged(address indexed from, address to);

    function passMinterRole(address farm) public returns (bool) {
        require(minter==address(0) || msg.sender==minter, "You are not minter");
        minter = farm;

        emit MinterChanged(msg.sender, farm);
        return true;
    }
  
    function getOwner() public view returns (address) {
        return owner;
    }

    function mint(address account, uint256 amount) public {
        require(minter == address(0) || msg.sender == minter, "You are not the minter");
            _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        require(minter == address(0) || msg.sender == minter, "You are not the minter");
            _burn(account, amount);
    }
        
    function transferFrom(
            address sender,
            address recipient,
            uint256 amount
    ) public virtual override returns (bool) {
        if (msg.sender == minter) {
            _transfer(sender, recipient, amount);
            return true;
        }
            
        super.transferFrom(sender, recipient, amount);
        return true;
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract MyOFT is OFT {
    constructor(
        string memory name_,
        string memory symbol_,
        address lzEndpoint_,
        address delegate_
    ) OFT(name_, symbol_, lzEndpoint_, delegate_) Ownable(delegate_) {}

    // Testnet convenience mint. For production, remove or tighten this.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

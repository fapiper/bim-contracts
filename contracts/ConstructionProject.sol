// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21;

import './BillingUnit.sol';

/**
 * @title ContractManager
 * @dev Store & retreive value in a variable
 */

contract ConstructionProject {
    event BillingUnitCreated(bytes32 indexed billingUnitHash);

    address public generalContractor; // Rolle Generalunternehmer
    address public buildingContractor; // Rolle Bauherr
    mapping(address => bool) public subContractors; // Rolle Subunternehmer

    mapping(bytes32 => BillingUnit) billingUnits;

    modifier onlyGeneralContractor {
        require(msg.sender == generalContractor, 'No permission.');
        _;
    }

    /**
     * @dev Instantiates a Contract Manager factory with initial values
     */
    constructor() public {
        generalContractor = msg.sender;
    }

    /**
     * @dev Registers sub contractor
     */
    function registerSubContractor() public onlyGeneralContractor {
        subContractors[msg.sender] = true;
    }

    /**
     * @dev Pushes a new billing unit to the stack
     * @param hash The hash of the new billing unit
     */
    function addBillingUnit(bytes32 hash)
        public
        onlyGeneralContractor
        returns (bool success)
    {
        billingUnits[hash] = new BillingUnit(hash);
        emit BillingUnitCreated(hash);
        return true;
    }

    /**
     * @dev Adds a new BoQ Item to the respective billing unit
     * @param billingUnitHash The hash of the billing unit
     * @param boQItemHash The hash of the new BoQ Item
     * @param subContractor The address of the sub contractor
     */
    function addBoQItem(
        bytes32 billingUnitHash,
        bytes32 boQItemHash,
        address subContractor
    ) public onlyGeneralContractor returns (bool success) {
        return
            billingUnits[billingUnitHash].addBoQItem(
                boQItemHash,
                subContractor
            );
    }
}

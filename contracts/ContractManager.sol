// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import './ConstructionProject.sol';

/**
 * @title ContractManager
 * @dev Store & retreive value in a variable
 */

contract ContractManager {
    address public generalContractor; // Rolle Generalunternehmer

    ConstructionProject public constructionProject;

    modifier onlyGeneralContractor {
        require(msg.sender == generalContractor, 'No permission.');
        _;
    }

    /**
     * @dev Instantiates a Contract Manager factory with initial values
     */
    constructor() public {}

    /**
     * @dev Registers general contractor
     */
    function registerGeneralContractor() public {
        generalContractor = msg.sender;
    }

    /**
     * @dev Creates a new construction project
     */
    function createConstructionProject()
        public
        onlyGeneralContractor
        returns (bool success)
    {
        constructionProject = new ConstructionProject();
        return true;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import './ConstructionProject.sol';

/**
 * @title ContractManager
 * @dev Store & retreive value in a variable
 */

contract ContractManager {
    event ConstructionProjectCreated(uint256 indexed index);

    address public admin; // Superadmin
    address public generalContractor; // Rolle Generalunternehmer

    ConstructionProject[] public constructionProjects;

    modifier onlyGeneralContractor {
        require(msg.sender == generalContractor, 'No permission.');
        _;
    }

    /**
     * @dev Instantiates a Contract Manager factory with initial values
     */
    constructor() public {
        admin = msg.sender;
    }

    /**
     * @dev Registers general contractor
     */
    function registerGeneralContractor() public {
        generalContractor = msg.sender;
    }

    /**
     * @dev Counts number of construction projects
     */
    function getProjectsLength() public view returns (uint256 projectsLength) {
        return constructionProjects.length;
    }

    /**
     * @dev Creates a new construction project
     */
    function createConstructionProject()
        public
        onlyGeneralContractor
        returns (bool success)
    {
        constructionProjects.push(new ConstructionProject());
        emit ConstructionProjectCreated(constructionProjects.length);
        return true;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

// import '@openzeppelin/contracts/access/Roles.sol';

import './ConstructionProject.sol';

/**
 * @title ConstructionProjectFactory
 * @dev Store & retreive value in a variable
 */

contract ConstructionProjectFactory {
    event ConstructionProjectCreated(address indexed contractAddress);

    struct ProjectEntry {
        address contractAddress;
        address owner;
    }

    address public admin; // Superadmin
    address public generalContractor; // Rolle Generalunternehmer

    ProjectEntry[] public projects;
    mapping(address => uint256) public ownerProjectCount;

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
     * @dev Retrieves collection of construction project contract addresses
     */
    function getProjectsByOwner(address _owner)
        public
        view
        returns (address[] memory projectContracts)
    {
        address[] memory result = new address[](ownerProjectCount[_owner]);
        uint256 counter = 0;

        for (uint256 i = 0; i < projects.length; i++) {
            if (projects[i].owner == _owner) {
                result[counter] = projects[i].contractAddress;
                counter++;
            }
        }
        return result;
    }

    /**
     * @dev Creates a new construction project
     */
    function createConstructionProject(bytes32 _hash, bytes32 _container)
        public
        returns (bool)
    {
        ConstructionProject project = new ConstructionProject(
            _hash,
            _container
        );
        ProjectEntry memory constructionProject = ProjectEntry(
            address(project),
            msg.sender
        );
        ownerProjectCount[msg.sender] += 1;
        projects.push(constructionProject);
        emit ConstructionProjectCreated(constructionProject.contractAddress);
        return true;
    }
}

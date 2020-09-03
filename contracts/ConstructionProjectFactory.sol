// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

// import '@openzeppelin/contracts/access/Roles.sol';
import './CloneFactory.sol';
import './ConstructionProject.sol';

/**
 * @title ConstructionProjectFactory
 * @dev Store & retreive value in a variable
 */
contract ConstructionProjectFactory is CloneFactory {
    event ConstructionProjectCreated(address project);

    struct ProjectEntry {
        address contractAddress;
        address owner;
    }

    address public implementation;

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
    constructor(address _implementation) public {
        implementation = _implementation;
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
    function createConstructionProject(bytes32 _project) public returns (bool) {
        address clone = createClone(implementation);
        ConstructionProject(clone).init(_project);
        ProjectEntry memory constructionProject = ProjectEntry(
            clone,
            msg.sender
        );
        ownerProjectCount[msg.sender] += 1;
        projects.push(constructionProject);
        emit ConstructionProjectCreated(clone);
        return true;
    }
}

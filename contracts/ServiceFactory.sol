// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

// import '@openzeppelin/contracts/access/Roles.sol';

/**
 * @title ServiceFactory
 * @dev Store & retreive value in a variable
 */
contract ServiceFactory {
    enum Status {INITIALIZED, STARTED, FINISHED, APPROVED}

    struct ServiceNode {
        Status status;
        bytes32[] children;
    }

    struct ServiceContract {
        address client;
        address contractor;
    }

    mapping(bytes32 => ServiceNode) public services; // Alle service nodes
    mapping(bytes32 => ServiceContract) public contracts; // Service nodes die Verträge hinterlegt haben
    mapping(bytes32 => bytes32) public billings; // Service nodes die abgerechnet werden können

    /**
     * @dev Creates a new service contract
     * @param _hash The hash of the service to be created
     */
    function createServiceContract(bytes32 _hash, address _contractor)
        public
        returns (bool)
    {
        require(
            services[_hash].status == Status.INITIALIZED,
            'Invalid service.'
        );
        require(billings[_hash] > 0, 'Service is no billing unit.');
        contracts[_hash] = ServiceContract(msg.sender, _contractor);
        return true;
    }

    /**
     * @dev Creates new service nodes
     * @param _hashes The hashes of the services to be created
     * @param _parents The hashes of the parents from the new services
     */
    function addServiceNodes(
        bytes32[] memory _hashes,
        bytes32[] memory _parents,
        uint256 _len
    ) public returns (bool) {
        for (uint256 i = 0; i < _len; i++) {
            _addServiceNode(_hashes[i], _parents[i]);
        }
        return true;
    }

    /**
     * @dev Creates a new service node
     * @param _hash The hash of the service to be created
     * @param _parent The hash of the parent of the new service
     */
    function _addServiceNode(bytes32 _hash, bytes32 _parent)
        internal
        returns (bool)
    {
        require(
            services[_parent].status >= Status.INITIALIZED,
            'Parent service node not found.'
        );
        services[_hash] = ServiceNode(Status.INITIALIZED, new bytes32[](0));
        services[_parent].children.push(_hash);
        return true;
    }

    /**
     * @dev Approves a service and emits a payment request
     * @param _service The hash of the service node to be updated
     */
    function approveServiceNode(bytes32 _service) public returns (bool) {
        require(
            services[_service].status >= Status.INITIALIZED,
            'Service node not found.'
        );
        require(
            services[_service].status == Status.FINISHED,
            'Service node not finished.'
        );
        require(
            msg.sender == contracts[_service].client,
            'No permission. Only client.'
        );
        _nextServiceStatus(_service);
        //TODO submit payment if approved
        return true;
    }

    /**
     * @dev Sets the progress of a boq item and all of its items
     * @param _service The hash of the service node to be updated
     */
    function nextServiceStatus(bytes32 _service) public returns (bool) {
        require(
            services[_service].status >= Status.INITIALIZED,
            'Service node not found.'
        );
        require(
            msg.sender == contracts[_service].client,
            'No permission. Only contractor.'
        );
        _nextServiceStatus(_service);
        return true;
    }

    /**
     * @dev Sets the progress of a boq item and all of its items
     * @param _service The hash of the service node to be updated
     */
    function _nextServiceStatus(bytes32 _service) internal returns (bool) {
        services[_service].status = Status(
            uint256(services[_service].status) + 1
        );
        //TODO update children
        return true;
    }
}

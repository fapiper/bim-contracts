// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceAgreement.sol';
import './CloneFactory.sol';

/**
 * @title ServiceAgreementFactory
 * @dev Store & retreive value in a variable
 */
contract ServiceAgreementFactory is CloneFactory {
    event ServiceAgreementCreated(
        address _client,
        address _contractor,
        address indexed _address,
        bytes32 indexed _hash
    );

    address public implementation;

    modifier onlyServiceAgreement(bytes32 _service) {
        require(
            agreements[_service] > address(0),
            'Not allowed. Only from Service Agreement.'
        );
        _;
    }

    constructor(address _implementation) public {
        implementation = _implementation;
    }

    mapping(bytes32 => address) public agreements;

    /**
     * @dev Creates a new service agreement and adds it to mapping
     * @param _service The hash of the service agreement
     * @param _parent The hash of the parent service
     * @param _client The contractor of the service agreement
     * @param _contractor The contractor of the service agreement
     * @param _children The hashes of the child services
     * @param _parents The hashes of parent services of the service specified in same index of _hashes
     * @param _billables Determines if the service node on index of _hashes has an associated billing unit
     * @param _documents The hashes of contract documents of the service agreement
     */
    function createServiceAgreement(
        bytes32 _service,
        bytes32 _parent,
        address _client,
        address _contractor,
        bytes32[] memory _children,
        bytes32[] memory _parents,
        bool[] memory _billables,
        bytes32[] memory _documents
    ) public returns (bool) {
        address clone = createClone(implementation);
        ServiceAgreement(clone).init(
            _service,
            _parent,
            _client,
            _contractor,
            _children,
            _parents,
            _billables,
            _documents
        );

        // Set agreement address pointer to service and his children
        agreements[_service] = clone;
        for (uint256 i = 0; i < _children.length; i++) {
            agreements[_children[i]] = clone;
        }
        emit ServiceAgreementCreated(_client, _contractor, clone, _service);
        return true;
    }

    function _addServiceNode(bytes32 _service, address _agreement) internal {
        if (agreements[_service] > address(0)) {
            ServiceAgreement(agreements[_service]).removeServiceNode(_service);
        }
        agreements[_service] = _agreement;
    }

    /**
     * @dev Retrieves the current stage of a service node
     * @param _service The hash of the service to get the current stage from
     */
    function getServiceStage(bytes32 _service)
        external
        view
        returns (ServiceAgreement.Stages)
    {
        return ServiceAgreement(agreements[_service]).getServiceStage(_service);
    }

    // TODO Act as Proxy for Agreements and redirect all request. This allows easier authentication and validation (e.g. only contractor can create new service agreement)
    /**
     * @dev Updates the stage of a service agreement
     * @param _service The hash of the service to be updated
     * @param _stage The new stage of the service
     */
    function setServiceStage(bytes32 _service, ServiceAgreement.Stages _stage)
        external
        onlyServiceAgreement(_service)
    {
        ServiceAgreement(agreements[_service]).setStage(_service, _stage);
    }
}

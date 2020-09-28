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
        agreements[_service] = clone;
        emit ServiceAgreementCreated(_client, _contractor, clone, _service);
        return true;
    }

    /**
     * @dev Updates the stage of a service agreement
     * @param _service The hash of the service to be updated
     * @param _stage The new stage of the service
     */
    function setServiceStage(bytes32 _service, uint8 _stage)
        public
        returns (bool)
    {
        ServiceAgreement(agreements[_service]).setStage(_service, _stage);
        return true;
    }
}

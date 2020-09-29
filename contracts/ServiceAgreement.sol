// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceAgreementFactory.sol';

/**
 * @title ServiceAgreement
 * @dev Store & retreive value in a variable
 */
contract ServiceAgreement {
    event ServiceTransition(bytes32 _service, uint256 _stage);

    enum Stages {
        EMPTY, // 0 - Initial stage shouldnt be 0. This could cause validation conflicts)
        INITIALIZED, // 1
        STARTED, // 2
        FINISHED, // 3
        APPROVED, // 4
        REJECTED, // 5
        PAYED // 6
    }

    struct ServiceNode {
        Stages stage;
        bytes32 parent;
        bytes32[] children;
        bool billable;
    }

    mapping(bytes32 => ServiceNode) services;

    address client;
    address contractor;
    address factory;

    bytes32[] documents;

    modifier onlyClient() {
        require(msg.sender == client);
        _;
    }

    modifier onlyContractor() {
        require(msg.sender == contractor);
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory);
        _;
    }

    modifier atStage(bytes32 _service, Stages _stage) {
        require(
            services[_service].stage == _stage,
            'Function cannot be called at this stage.'
        );
        _;
    }

    /**
     * @dev Creates a new service agreement with initial values
     * @param _service The hash of the service agreement
     * @param _parent The hash of the parent service
     * @param _client The contractor of the service agreement
     * @param _contractor The contractor of the service agreement
     * @param _children The hashes of the child services
     * @param _parents The hashes of parent services of the service specified in same index of _hashes
     * @param _billables Determines if the service node on index of _hashes has an associated billing unit
     * @param _documents The hashes of contract documents of the service agreement
     */
    function init(
        bytes32 _service,
        bytes32 _parent,
        address _client,
        address _contractor,
        bytes32[] memory _children,
        bytes32[] memory _parents,
        bool[] memory _billables,
        bytes32[] memory _documents
    ) public {
        services[_service] = ServiceNode(
            Stages.INITIALIZED,
            _parent,
            new bytes32[](0),
            true
        ); // root service
        client = _client;
        contractor = _contractor;
        factory = msg.sender;
        documents = _documents;
        for (uint256 i = 0; i < _children.length; i++) {
            _addServiceNode(_children[i], _parents[i], _billables[i]);
        }
    }

    /**
     * @dev Creates a new service node
     * @param _service The hash of the service to be created
     * @param _parent The hash of the parent of the new service
     */
    function _addServiceNode(
        bytes32 _service,
        bytes32 _parent,
        bool _billable
    ) internal returns (bool) {
        services[_service] = ServiceNode(
            Stages.INITIALIZED,
            0,
            new bytes32[](0),
            _billable
        );
        services[_parent].children.push(_service);
        return true;
    }

    /**
     * @dev Removes service node and all of its children
     * @param _service The hash of the service to be removed
     */
    function removeServiceNode(bytes32 _service)
        public
        onlyFactory
        returns (bool)
    {
        for (uint256 i = 0; i < services[_service].children.length; i++) {
            removeServiceNode(services[_service].children[i]);
        }
        delete services[_service];
        return true;
    }

    /**
     * @dev Retrieves the current stage of a service node
     * @param _service The hash of the service to get the current stage from
     */
    function getServiceStage(bytes32 _service)
        external
        view
        onlyFactory
        returns (Stages)
    {
        return services[_service].stage;
    }

    /**
     * @dev Starts a service node
     * @param _service The hash of the service to get the current stage from
     */
    function startService(bytes32 _service)
        public
        onlyContractor
        atStage(_service, Stages.INITIALIZED)
        returns (bool)
    {
        _nextStage(_service);
        return true;
    }

    /**
     * @dev Finishes a service node
     * @param _service The hash of the service to get the current stage from
     */
    function finishService(bytes32 _service)
        public
        onlyContractor
        atStage(_service, Stages.STARTED)
        returns (bool)
    {
        _nextStage(_service);
        return true;
    }

    /**
     * @dev Approves a service node
     * @param _service The hash of the service to get the current stage from
     */
    function approveService(bytes32 _service)
        public
        onlyClient
        atStage(_service, Stages.FINISHED)
        returns (bool)
    {
        _nextStage(_service);
        return true;
    }

    /**
     * @dev Approves a service node
     * @param _service The hash of the service to get the current stage from
     */
    function rejectService(bytes32 _service)
        public
        onlyClient
        atStage(_service, Stages.FINISHED)
        returns (bool)
    {
        setStage(_service, Stages.REJECTED);
        return true;
    }

    /**
     * @dev Approves a service node
     * @param _service The hash of the service to get the current stage from
     */
    function payService(bytes32 _service)
        public
        onlyClient
        atStage(_service, Stages.APPROVED)
        returns (bool)
    {
        setStage(_service, Stages.PAYED);
        return true;
    }

    /**
     * @dev Transitions Service to its next stage
     * @param _service The hash of the service to get the current stage from
     */
    function _nextStage(bytes32 _service) internal {
        setStage(_service, Stages(uint256(services[_service].stage) + 1));
    }

    /**
     * @dev Updates the stage of a service and all of its children
     * @param _service The hash of the service to be updated
     * @param _stage The new stage of the service
     */
    function setStage(bytes32 _service, Stages _stage) public returns (bool) {
        for (uint256 i = 0; i < services[_service].children.length; i++) {
            if (services[services[_service].children[i]].stage > Stages.EMPTY) {
                ServiceAgreementFactory(factory).setServiceStage(
                    services[_service].children[i],
                    _stage
                );
            } else {
                setStage(services[_service].children[i], _stage);
            }
        }
        services[_service].stage = _stage;
        emit ServiceTransition(_service, uint256(_stage));
        return true;
    }

    function cleanup() public {
        // TODO Implement cleanup of service agreement
    }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceAgreementFactory.sol';

/**
 * @title ServiceAgreement
 * @dev Store & retreive value in a variable
 */
contract ServiceAgreement {
    event ServiceTransition(bytes32 _service, uint8 _stage);
    event Payment(bytes32 _service);

    enum Stages {INITIALIZED, STARTED, FINISHED, APPROVED, REJECTED, PAYED}

    struct ServiceNode {
        Stages stage;
        bytes32 parent;
        bytes32[] children;
        bool billable;
    }

    bytes32 service;

    mapping(bytes32 => uint256) index;
    ServiceNode[] services;

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

    modifier atStage(bytes32 _service, Stages _stage) {
        require(
            _getServiceNodeByHash(_service).stage == _stage,
            'Function cannot be called at this stage.'
        );
        _;
    }

    function _addServiceNodeByHash(bytes32 _service, ServiceNode memory _node)
        internal
        returns (ServiceNode memory)
    {
        index[_service] = services.length;
        services[index[_service]] = _node;
        return services[index[_service]];
    }

    function _getServiceNodeByHash(bytes32 _service)
        internal
        view
        returns (ServiceNode storage)
    {
        return services[index[_service]];
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
        _addServiceNodeByHash(
            _service,
            ServiceNode(Stages.INITIALIZED, _parent, new bytes32[](0), true)
        );
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
        require(
            _getServiceNodeByHash(_parent).stage < Stages.INITIALIZED,
            'Parent service node not found.'
        );
        _addServiceNodeByHash(
            _service,
            ServiceNode(Stages.INITIALIZED, 0, new bytes32[](0), _billable)
        );
        _getServiceNodeByHash(_parent).children.push(_service);
        return true;
    }

    /**
     * @dev Retrieves the current stage of a service node
     * @param _service The hash of the service to get the current stage from
     */
    function getServiceStages(bytes32 _service) public view returns (uint8) {
            bytes32[] memory _services = bytes32[](0);
                        uint8[] memory _stages = uint8[](0);

      for (uint i = 0; i < services.length; i++) {
          Trip storage trrip = trips[i];
          _services[i] = services[i].;
      }
      return trrips;

        return uint8(_getServiceNodeByHash(_service).stage);
    }

    /**
     * @dev Updates the stage of a service and all of its children
     * @param _service The hash of the service to be updated
     * @param _stage The new stage of the service
     */
    function setStage(bytes32 _service, uint8 _stage) public returns (bool) {
        require(_stage > 0 && _stage <= uint8(Stages.APPROVED));
        for (
            uint256 i = 0;
            i < _getServiceNodeByHash(_service).children.length;
            i++
        ) {
            setStage(_getServiceNodeByHash(_service).children[i], _stage);
        }
        _getServiceNodeByHash(_service).stage = Stages(_stage);
        if (
            _getServiceNodeByHash(_getServiceNodeByHash(_service).parent)
                .stage < Stages.INITIALIZED
        ) {
            // Service parent resides in another service agreement. We have to update the stage via ServiceAgreementFactory.
            ServiceAgreementFactory(factory).setServiceStage(
                _getServiceNodeByHash(_service).parent,
                _stage
            );
        }
        emit ServiceTransition(_service, _stage);
        if (_getServiceNodeByHash(_service).billable) {
            emit Payment(_service);
        }
        return true;
    }

    function cleanup() public {
        // TODO Implement cleanup of service agreement
    }
}

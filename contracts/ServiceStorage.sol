// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './StateMachine.sol';
import './ServiceRoles.sol';

contract ServiceStorage is ServiceRoles, StateMachine {
    mapping(bytes32 => bytes32[]) services;

    function _getService(bytes32 _service)
        internal
        view
        returns (
            address _client,
            address _contractor,
            Stages _stage
        )
    {
        (_client, _contractor) = _getServiceRoles(_service);
        _stage = _stageOf(_service);
        return (_client, _contractor, _stage);
    }

    function _getServicesOf(bytes32 _section)
        internal
        view
        returns (bytes32[] memory _services)
    {
        return services[_section];
    }

    function _getServices(bytes32 _section)
        internal
        view
        returns (
            bytes32[] memory _services,
            address[] memory _clients,
            address[] memory _contractors,
            Stages[] memory _stages
        )
    {
        _services = services[_section];
        _clients = new address[](_services.length);
        _clients = new address[](_services.length);
        _contractors = new address[](_services.length);
        _stages = new Stages[](_services.length);

        for (uint256 i = 0; i < _services.length; i++) {
            (_clients[i], _contractors[i], _stages[i]) = _getService(
                _services[i]
            );
        }
        return (_services, _clients, _contractors, _stages);
    }

    function _isServiceItem(bytes32 _section) internal view returns (bool) {
        return services[_section].length > 0;
    }

    function _addService(bytes32 _section, bytes32 _service) internal {
        _nextStage(_service);
        services[_section].push(_service);
    }

    function _start(bytes32 _service)
        internal
        onlyContractor(_service)
        atStage(_service, Stages.INITIALIZED)
        transitionNext(_service)
    {}

    function _finish(bytes32 _service)
        internal
        onlyContractor(_service)
        atStage(_service, Stages.STARTED)
        transitionNext(_service)
    {}

    function _approve(bytes32 _service)
        internal
        onlyClient(_service)
        atStage(_service, Stages.FINISHED)
        atStageAll(services[_service], Stages.APPROVED)
        transitionNext(_service)
    {}

    function _reject(bytes32 _service)
        internal
        onlyClient(_service)
        atStage(_service, Stages.FINISHED)
        // atStageAll(services[_service], Stages.FINISHED)
        transitionTo(_service, Stages.STARTED)
    {}
}

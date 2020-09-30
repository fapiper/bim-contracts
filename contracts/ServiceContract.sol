// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceContractLib.sol';

contract ServiceContract {
    using ServiceContractLib for ServiceContractLib.ServiceContract;

    mapping(bytes32 => ServiceContractLib.ServiceContract) private instances;
    mapping(bytes32 => bytes32) private contracts;

    function createServiceContract(
        bytes32 _contract,
        address _contractor,
        bytes32[] calldata _services
    ) external returns (bool) {
        require(
            !instances[_contract].exists,
            'Service contract already exists.'
        );
        for (uint256 i = 0; i < _services.length; i++) {
            contracts[_services[i]] = _contract;
        }
        instances[_contract].init(_contract, _contractor, _services);
        return true;
    }

    function addService(
        bytes32 _contract,
        bytes32 _node,
        bytes32 _parent
    ) external returns (bool) {
        require(instances[_contract].exists, 'Service contract not existing.');
        contracts[_node] = _contract;
        instances[_contract].addService(_node, _parent);
        return true;
    }

    function stageOf(bytes32 _service)
        public
        view
        returns (ServiceContractLib.Stages)
    {
        return instances[contracts[_service]].stageOf(_service);
    }

    function start(bytes32 _service) external returns (bool) {
        return instances[contracts[_service]].start(_service);
    }

    function finish(bytes32 _service) external returns (bool) {
        return instances[contracts[_service]].finish(_service);
    }

    function approve(bytes32 _service) external returns (bool) {
        return instances[contracts[_service]].approve(_service);
    }

    function reject(bytes32 _service) external returns (bool) {
        return instances[contracts[_service]].reject(_service);
    }

    function pay(bytes32 _service) external returns (bool) {
        return instances[contracts[_service]].pay(_service);
    }
}

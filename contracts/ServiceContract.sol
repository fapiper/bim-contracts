// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './StateMachine.sol';

contract ServiceContract is StateMachine {
    address private client;
    address private contractor;
    address private factory;

    mapping(bytes32 => bytes32[]) private services; // super -> services
    mapping(bytes32 => bytes32) private billings; // service -> billing

    modifier onlyFactory() {
        require(msg.sender == factory, 'Not allowed. Only factory.');
        _;
    }

    function init(address _client, address _contractor) public {
        factory = msg.sender;
        client = _client;
        contractor = _contractor;
    }

    function getClient() external view onlyFactory returns (address) {
        return client;
    }

    function getContractor() external view onlyFactory returns (address) {
        return contractor;
    }

    function getServicesOf(bytes32 _super)
        external
        view
        onlyFactory
        returns (bytes32[] memory)
    {
        return services[_super];
    }

    function setServiceOf(
        bytes32 _super,
        bytes32 _service,
        bytes32 _billing
    ) external onlyFactory {
        billings[_service] = _billing;
        services[_super].push(_service);
        initStage(_service);
    }

    function getBillingOf(bytes32 _of)
        external
        view
        onlyFactory
        returns (bytes32)
    {
        return billings[_of];
    }

    function start(bytes32 _item)
        public
        onlyFactory
        isValid(_item)
        atStage(_item, Stages.INITIALIZED)
        transitionNext(_item)
    {}

    function finish(bytes32 _item)
        public
        onlyFactory
        isValid(_item)
        transitionTo(_item, StateMachine.Stages.FINISHED)
    {}

    function approve(bytes32 _item)
        public
        onlyFactory
        isValid(_item)
        atStage(_item, Stages.FINISHED)
        transitionNext(_item)
    {}

    function pay(bytes32 _item)
        external
        onlyFactory
        isValid(_item)
        atStage(_item, Stages.APPROVED)
        transitionNext(_item)
    {}

    function reject(bytes32 _item)
        public
        onlyFactory
        isValid(_item)
        transitionTo(_item, StateMachine.Stages.REJECTED)
    {}
}

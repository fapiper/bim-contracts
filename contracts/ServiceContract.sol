// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './StateMachine.sol';

contract ServiceContract is StateMachine {
    address private client;
    address private contractor;
    address private factory;

    mapping(bytes32 => bytes32[]) private sections; // supersection or contract -> subsections
    mapping(bytes32 => bytes32[]) private items; // section -> items
    mapping(bytes32 => bytes32) private billings; // section or item -> billing

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

    function getSectionsOf(bytes32 _super)
        external
        view
        onlyFactory
        returns (bytes32[] memory)
    {
        return sections[_super];
    }

    function setSectionOf(
        bytes32 _super,
        bytes32 _section,
        bytes32 _billing
    ) external onlyFactory {
        billings[_section] = _billing;
        sections[_super].push(_section);
    }

    function getItemsOf(bytes32 _section)
        external
        view
        onlyFactory
        returns (bytes32[] memory)
    {
        return items[_section];
    }

    function setItemOf(
        bytes32 _section,
        bytes32 _item,
        bytes32 _billing
    ) external onlyFactory {
        billings[_section] = _billing;
        items[_section].push(_item);
        initStage(_item);
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
        external
        onlyFactory
        isValid(_item)
        atStage(_item, Stages.INITIALIZED)
        transitionNext(_item)
    {}

    function finish(bytes32 _item)
        external
        onlyFactory
        isValid(_item)
        atStage(_item, Stages.STARTED)
        transitionNext(_item)
    {}

    function approve(bytes32 _item)
        external
        onlyFactory
        isValid(_item)
        atStage(_item, Stages.FINISHED)
        transitionTo(_item, StateMachine.Stages.APPROVED)
    {}

    function reject(bytes32 _item)
        external
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
}

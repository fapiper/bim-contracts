// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './StateMachine.sol';
import './ServiceRoles.sol';

contract ServiceAgreement is ServiceRoles, StateMachine {
    mapping(bytes32 => bytes32[]) agreements;
    mapping(address => bytes32[]) agreementsByContractor;
    mapping(address => bytes32[]) agreementsByClient;

    modifier exists(bytes32 _agreement) {
        require(agreements[_agreement].length > 0, 'Agreement not existing.');
        _;
    }

    function _createAgreement(
        bytes32 _section,
        address _contractor,
        bytes32[] memory _services
    ) internal {
        agreements[_section] = _services;
        agreementsByContractor[_contractor].push(_section);
        agreementsByClient[msg.sender].push(_section);
    }

    function _getAgreementsByClient(address _client)
        internal
        view
        returns (bytes32[] memory)
    {
        return agreementsByClient[_client];
    }

    function _getAgreementsByContractor(address _contractor)
        internal
        view
        returns (bytes32[] memory)
    {
        return agreementsByContractor[_contractor];
    }

    function _start(bytes32 _agreement, bytes32 _service)
        internal
        onlyContractor(_agreement)
        atStage(_service, Stages.INITIALIZED)
        transitionNext(_service)
    {}

    function _finish(bytes32 _agreement, bytes32 _service)
        internal
        onlyContractor(_agreement)
        atStage(_service, Stages.STARTED)
        transitionNext(_service)
    {}

    function _approve(bytes32 _agreement, bytes32 _service)
        internal
        onlyClient(_agreement)
        atStage(_service, Stages.FINISHED)
        transitionNext(_service)
    {}

    function _reject(bytes32 _agreement, bytes32 _service)
        internal
        onlyClient(_agreement)
        atStage(_service, Stages.FINISHED)
        transitionTo(_service, Stages.STARTED)
    {}

    function _pay(bytes32 _agreement, bytes32 _service)
        internal
        onlyClient(_agreement)
        atStage(_service, Stages.APPROVED)
        transitionNext(_service)
    {}
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './StateMachine.sol';

contract ServiceAgreement is StateMachine {
    struct Agreement {
        address client;
        address contractor;
        bytes32[] services;
    }
    mapping(bytes32 => Agreement) agreements;

    mapping(address => bytes32[]) agreementsByContractor;
    mapping(address => bytes32[]) agreementsByClient;

    modifier onlyClient(bytes32 _agreement) {
        require(
            msg.sender == agreements[_agreement].client,
            'Not allowed. Only client.'
        );
        _;
    }

    modifier onlyContractor(bytes32 _agreement) {
        require(
            msg.sender == agreements[_agreement].contractor,
            'Not allowed. Only contractor.'
        );
        _;
    }

    function _createAgreement(
        bytes32 _agreement,
        address _contractor,
        bytes32[] memory _services
    ) internal {
        agreements[_agreement].client = msg.sender;
        agreements[_agreement].contractor = _contractor;
        agreements[_agreement].services = _services;
        agreementsByContractor[_contractor].push(_agreement);
        agreementsByClient[msg.sender].push(_agreement);
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

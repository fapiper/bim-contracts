// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './StateMachine.sol';

contract ServiceAgreement is StateMachine {
    mapping(bytes32 => bytes32[]) agreements;
    mapping(bytes32 => address) clientByAgreement;
    mapping(bytes32 => address) contractorByAgreement;
    mapping(address => bytes32[]) agreementsByContractor;
    mapping(address => bytes32[]) agreementsByClient;

    modifier onlyClient(bytes32 _service) {
        require(
            msg.sender == clientByAgreement[_service],
            'Not allowed. Only client.'
        );
        _;
    }

    modifier onlyContractor(bytes32 _service) {
        require(
            msg.sender == contractorByAgreement[_service],
            'Not allowed. Only contractor.'
        );
        _;
    }

    modifier exists(bytes32 _agreement) {
        require(agreements[_agreement].length > 0, 'Agreement not existing.');
        _;
    }

    function _createAgreement(
        bytes32 _section,
        address _contractor,
        bytes32[] memory _services
    ) internal {
        clientByAgreement[_section] = msg.sender;
        contractorByAgreement[_section] = _contractor;
        agreements[_section] = _services;
        agreementsByContractor[_contractor].push(_section);
        agreementsByClient[msg.sender].push(_section);
    }

    function _getAgreementsByClient(address _client)
        internal
        view
        returns (
            bytes32[] memory,
            address[] memory,
            address[] memory
        )
    {
        return buildAgreements(agreementsByClient[_client]);
    }

    function _getAgreementsByContractor(address _contractor)
        internal
        view
        returns (
            bytes32[] memory,
            address[] memory,
            address[] memory
        )
    {
        return buildAgreements(agreementsByContractor[_contractor]);
    }

    function buildAgreements(bytes32[] memory _agreements)
        internal
        view
        returns (
            bytes32[] memory,
            address[] memory,
            address[] memory
        )
    {
        address[] memory _clients = new address[](_agreements.length);
        address[] memory _contractors = new address[](_agreements.length);
        for (uint256 i = 0; i < _agreements.length; i++) {
            _clients[i] = clientByAgreement[_agreements[i]];
            _contractors[i] = contractorByAgreement[_agreements[i]];
        }
        return (_agreements, _clients, _contractors);
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

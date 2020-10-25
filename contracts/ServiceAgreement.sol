// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

contract ServiceAgreement {
    struct Agreement {
        bool exists;
        bool payed;
        address client;
        address contractor;
        bytes32[] services;
    }

    mapping(bytes32 => Agreement) agreements;
    mapping(address => bytes32[]) agreementsByContractor;
    mapping(address => bytes32[]) agreementsByClient;

    modifier exists(bytes32 _agreement) {
        require(agreements[_agreement].exists, 'Agreement not existing.');
        _;
    }

    function _createAgreement(
        bytes32 _section,
        address _contractor,
        bytes32[] memory _services
    ) internal {
        agreements[_section].exists = true;
        agreements[_section].payed = false;
        agreements[_section].client = msg.sender;
        agreements[_section].contractor = _contractor;
        agreements[_section].services = _services;
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

    function _getAgreement(bytes32 _agreement)
        internal
        view
        returns (
            bool payed,
            address _client,
            address _contractor,
            bytes32[] memory _services
        )
    {
        return (
            agreements[_agreement].payed,
            agreements[_agreement].client,
            agreements[_agreement].contractor,
            agreements[_agreement].services
        );
    }
}

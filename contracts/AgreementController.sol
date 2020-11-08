// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceAgreement.sol';
import './ServiceStorage.sol';

contract AgreementController is ServiceAgreement, ServiceStorage {
    function addServiceSection(bytes32 _section, bytes32[] calldata _services)
        external
        returns (bool success)
    {
        _addServiceSection(_section, _services);
        return true;
    }

    function createAgreement(
        bytes32 _agreement,
        address _contractor,
        bytes32[] memory _services
    ) public returns (bool success) {
        require(
            _onlyAgreementContractor(_services),
            'Not allowed. Only contractor can create agreement.'
        );
        _createAgreement(_agreement, _contractor, _services);
        _updateRoles(_services, _contractor);
        return true;
    }

    function _updateRoles(bytes32[] memory _sections, address _contractor)
        internal
    {
        bytes32[] memory _services;
        for (uint256 i = 0; i < _sections.length; i++) {
            (_services, , , ) = _getServicesOf(_sections[i]);
            _updateServiceRoles(_sections[i], msg.sender, _contractor);
            _updateRoles(_services, _contractor);
        }
    }

    function _onlyAgreementContractor(bytes32[] memory _services)
        internal
        view
        returns (bool)
    {
        address _contractor;
        for (uint256 i = 0; i < _services.length; i++) {
            (, _contractor) = _getServiceRoles(_services[i]);
            if (_isStarted(_services[i]) && msg.sender != _contractor) {
                return false;
            }
        }
        return true;
    }

    function getAgreementsByClient(address _client)
        external
        view
        returns (bytes32[] memory _agreements)
    {
        return _getAgreementsByClient(_client);
    }

    function getAgreementsByContractor(address _contractor)
        external
        view
        returns (bytes32[] memory _agreements)
    {
        return _getAgreementsByContractor(_contractor);
    }

    function getAgreement(bytes32 _agreement)
        external
        view
        returns (
            bool payed,
            address _client,
            address _contractor,
            bytes32[] memory _services
        )
    {
        return _getAgreement(_agreement);
    }

    function payAgreement(bytes32 _agreement) external returns (bool success) {
        _payAgreement(_agreement);
        return true;
    }

    function getService(bytes32 _service)
        external
        view
        returns (
            address _client,
            address _contractor,
            Stages _stage
        )
    {
        return _getService(_service);
    }

    function getServicesOf(bytes32 _section)
        external
        view
        returns (
            bytes32[] memory _services,
            address[] memory _clients,
            address[] memory _contractors,
            Stages[] memory _stages
        )
    {
        return _getServicesOf(_section);
    }

    function start(bytes32 _service) external returns (bool success) {
        _start(_service);
        return true;
    }

    function finish(bytes32 _service) external returns (bool success) {
        _finish(_service);
        return true;
    }

    function approve(bytes32 _service) external returns (bool success) {
        _approve(_service);
        return true;
    }

    function reject(bytes32 _service) external returns (bool success) {
        _reject(_service);
        return true;
    }
}

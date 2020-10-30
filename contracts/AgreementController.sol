// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceAgreement.sol';
import './ServiceStorage.sol';

contract AgreementController is ServiceAgreement, ServiceStorage {
    function createInitialAgreement(
        bytes32 _agreement,
        address _contractor,
        bytes32[] calldata _roots,
        bytes32[] calldata _services,
        bytes32[] calldata _sections
    ) external returns (bool success) {
        for (uint256 i = 0; i < _services.length; i++) {
            _addService(_sections[i], _services[i]);
        }
        createAgreement(_agreement, _contractor, _roots);
        return true;
    }

    function createAgreement(
        bytes32 _agreement,
        address _contractor,
        bytes32[] memory _services
    ) public returns (bool success) {
        _createAgreement(_agreement, _contractor, _services);
        _deepUpdateRoles(_services, _contractor);
        return true;
    }

    function _deepUpdateRoles(bytes32[] memory _services, address _contractor)
        internal
    {
        for (uint256 i = 0; i < _services.length; i++) {
            _updateServiceRoles(_services[i], msg.sender, _contractor);
            _deepUpdateRoles(_getServicesOf(_services[i]), _contractor);
        }
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

    function getServices(bytes32 _section)
        external
        view
        returns (
            bytes32[] memory _services,
            address[] memory _clients,
            address[] memory _contractors,
            Stages[] memory _stages
        )
    {
        return _getServices(_section);
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

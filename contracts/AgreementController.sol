// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceAgreement.sol';
import './ServiceStorage.sol';

contract AgreementController is ServiceAgreement, ServiceStorage {
    function createInitialAgreement(
        bytes32 _agreement,
        address _contractor,
        bytes32[] calldata _services,
        bytes32[] calldata _sections,
        bytes32[] calldata _billings
    ) external returns (bool success) {
        uint256 len = 0;
        for (uint256 i = 0; i < _services.length; i++) {
            _initStage(_services[i]);
            if (_sections[i] != 0)
                _addService(_sections[i], _services[i], _billings[i]);
            else len++;
        }

        bytes32[] memory rootServices = new bytes32[](len);
        for (uint256 j = 0; j < len; j++) {
            rootServices[j] = _services[j];
        }

        _createAgreement(_agreement, _contractor, rootServices);
        return true;
    }

    function createAgreement(
        bytes32 _agreement,
        address _contractor,
        bytes32[] calldata _services
    ) external returns (bool success) {
        _createAgreement(_agreement, _contractor, _services);
        return true;
    }

    function getAgreementsByClient(address _client)
        external
        view
        returns (bytes32[] memory)
    {
        return _getAgreementsByClient(_client);
    }

    function getAgreementsByContractor(address _contractor)
        external
        view
        returns (bytes32[] memory)
    {
        return _getAgreementsByContractor(_contractor);
    }

    function getServices(bytes32 _section)
        external
        view
        returns (bytes32[] memory)
    {
        return _getServices(_section);
    }

    function getBilling(bytes32 _service) external view returns (bytes32) {
        return _getBilling(_service);
    }

    function getStage(bytes32 _service) external view returns (Stages) {
        return _stageOf(_service);
    }

    function start(bytes32 _agreement, bytes32 _service)
        external
        returns (bool success)
    {
        _start(_agreement, _service);
        return true;
    }

    function finish(bytes32 _agreement, bytes32 _service)
        external
        returns (bool success)
    {
        _finish(_agreement, _service);
        return true;
    }

    function approve(bytes32 _agreement, bytes32 _service)
        external
        atStageAll(_getServices(_service), Stages.APPROVED)
        returns (bool success)
    {
        _finish(_agreement, _service);
        return true;
    }

    function reject(bytes32 _agreement, bytes32 _service)
        external
        atStageAll(_getServices(_service), Stages.STARTED)
        returns (bool success)
    {
        _reject(_agreement, _service);
        return true;
    }

    function pay(bytes32 _agreement, bytes32 _service)
        external
        atStageAll(_getServices(_service), Stages.PAYED)
        returns (bool success)
    {
        _finish(_agreement, _service);
        return true;
    }
}

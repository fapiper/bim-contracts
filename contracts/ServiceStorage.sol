// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

contract ServiceStorage {
    mapping(bytes32 => bytes32[]) services;
    mapping(bytes32 => bytes32) billing;

    function _getServices(bytes32 _section)
        internal
        view
        returns (bytes32[] memory)
    {
        return services[_section];
    }

    function _isServiceItem(bytes32 _section) internal view returns (bool) {
        return services[_section].length > 0;
    }

    function _getBilling(bytes32 _section) internal view returns (bytes32) {
        return billing[_section];
    }

    function _addService(
        bytes32 _section,
        bytes32 _service,
        bytes32 _billing
    ) internal {
        services[_section].push(_service);
        billing[_service] = _billing;
    }
}

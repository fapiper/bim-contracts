// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

contract ServiceRoles {
    mapping(bytes32 => address) clientByService;
    mapping(bytes32 => address) contractorByService;

    modifier onlyClient(bytes32 _service) {
        require(
            msg.sender == clientByService[_service],
            'Not allowed. Only responsible client.'
        );
        _;
    }

    modifier onlyContractor(bytes32 _service) {
        require(
            msg.sender == contractorByService[_service],
            'Not allowed. Only responsible contractor.'
        );
        _;
    }

    function _updateServiceRoles(
        bytes32 _service,
        address _client,
        address _contractor
    ) internal {
        if (
            clientByService[_service] == address(0) ||
            contractorByService[_service] == msg.sender
        ) {
            clientByService[_service] = _client;
            contractorByService[_service] = _contractor;
        }
    }

    function _getServiceRoles(bytes32 _service)
        internal
        view
        returns (address, address)
    {
        return (clientByService[_service], contractorByService[_service]);
    }
}

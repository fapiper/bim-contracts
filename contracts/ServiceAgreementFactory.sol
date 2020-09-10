// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceAgreement.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/ProxyFactory.sol';

/**
 * @title ServiceAgreementFactory
 * @dev Store & retreive value in a variable
 */
contract ServiceAgreementFactory is ProxyFactory {
    address public implementation;

    constructor(address _implementation) public {
        implementation = _implementation;
    }

    mapping(bytes32 => address) public agreements;

    /**
     * @dev Creates a new service agreement and adds it to mapping
     * @param _service The hash of the new service agreement
     * @param _data The bytearray of calldata
     */
    function createServiceAgreement(bytes32 _service, bytes memory _data)
        public
        returns (bool)
    {
        address proxy = deployMinimal(implementation, _data);
        agreements[_service] = proxy;
        return true;
    }

    /**
     * @dev Updates the stage of a service agreement
     * @param _service The hash of the service to be updated
     * @param _stage The new stage of the service
     */
    function setServiceStage(bytes32 _service, uint8 _stage)
        public
        returns (bool)
    {
        ServiceAgreement(agreements[_service]).setStage(_service, _stage);
        return true;
    }
}

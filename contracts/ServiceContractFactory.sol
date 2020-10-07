// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

import './ServiceContract.sol';
import './CloneFactory.sol';

contract ServiceContractFactory is CloneFactory {
    address private implementation;

    constructor(address _implementation) public {
        implementation = _implementation;
    }

    mapping(bytes32 => bytes32) contracts; // section or item -> contract
    mapping(bytes32 => address) instances; // contract hash to contract address

    mapping(address => bytes32[]) contractsByContractor; // contractor to contract hashes
    mapping(address => bytes32[]) contractsByClient; // client to contract hashes

    modifier onlyClient(ServiceContract _instance) {
        require(
            msg.sender == _instance.getClient(),
            'Not allowed. Only client.'
        );
        _;
    }

    modifier onlyContractor(ServiceContract _instance) {
        require(
            msg.sender == _instance.getContractor(),
            'Not allowed. Only contractor.'
        );
        _;
    }

    function create(bytes32 _contract, address _contractor)
        public
        returns (bool)
    {
        address clone = createClone(implementation);
        instances[_contract] = clone;
        contracts[_contract] = _contract; // Include contract in contract pointers, as it is super of first level sections or items
        _instanceByContract(_contract).init(msg.sender, _contractor);
        contractsByContractor[_contractor].push(_contract);
        contractsByClient[msg.sender].push(_contract);
        return true;
    }

    function addServices(
        bytes32 _contract,
        bytes32 _super,
        bytes32[] calldata _sections,
        bytes32[] calldata _billings
    ) external onlyClient(_instanceByContract(_contract)) returns (bool) {
        for (uint256 i = 0; i < _billings.length; i++) {
            contracts[_sections[i]] = _contract;
            _instanceByContract(_contract).setServiceOf(
                _super,
                _sections[i],
                _billings[i]
            );
        }
        return true;
    }

    function getContractsByClient(address _client)
        external
        view
        returns (bytes32[] memory)
    {
        return contractsByClient[_client];
    }

    function getContractsByContractor(address _contractor)
        external
        view
        returns (bytes32[] memory)
    {
        return contractsByContractor[_contractor];
    }

    function servicesOf(bytes32 _super)
        external
        view
        returns (bytes32[] memory)
    {
        return _instanceByService(_super).getServicesOf(_super);
    }

    function stageOf(bytes32 _item)
        public
        view
        returns (ServiceContract.Stages)
    {
        return _instanceByService(_item).stageOf(_item);
    }

    function start(bytes32 _item)
        external
        onlyContractor(_instanceByService(_item))
        returns (bool)
    {
        _instanceByService(_item).start(_item);
        return true;
    }

    function finish(bytes32 _item)
        external
        onlyContractor(_instanceByService(_item))
        returns (bool)
    {
        _instanceByService(_item).finish(_item);
        return true;
    }

    function approve(bytes32 _item)
        external
        onlyClient(_instanceByService(_item))
        returns (bool)
    {
        _instanceByService(_item).approve(_item);
        return true;
    }

    function reject(bytes32 _item)
        external
        onlyClient(_instanceByService(_item))
        returns (bool)
    {
        _instanceByService(_item).reject(_item);
        return true;
    }

    function pay(bytes32 _item)
        external
        onlyClient(_instanceByService(_item))
        returns (bool)
    {
        _instanceByService(_item).pay(_item);
        return true;
    }

    function _instanceByContract(bytes32 _contract)
        internal
        view
        returns (ServiceContract)
    {
        require(instances[_contract] > address(0), 'Contract does not exists.');
        return ServiceContract(instances[_contract]);
    }

    function _instanceByService(bytes32 _service)
        internal
        view
        returns (ServiceContract)
    {
        require(contracts[_service] > 0, 'Contract does not exists.');
        return _instanceByContract(contracts[_service]);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

library ServiceContractLib {
    enum Stages {
        EMPTY, // 0
        INITIALIZED, // 1
        STARTED, // 2
        FINISHED, // 3
        APPROVED, // 4
        REJECTED, // 5
        PAYED // 6
    }

    struct ServiceContract {
        mapping(bytes32 => bytes32[]) children;
        mapping(bytes32 => Stages) stages;
        mapping(bytes32 => bytes32) billings;
        address client;
        address contractor;
        bool exists;
    }

    modifier onlyClient(ServiceContract storage self) {
        require(msg.sender == self.client, 'No permission. Only client.');
        _;
    }

    modifier onlyContractor(ServiceContract storage self) {
        require(
            msg.sender == self.contractor,
            'No permission. Only contractor.'
        );
        _;
    }

    modifier atStage(
        ServiceContract storage self,
        bytes32 _service,
        Stages _stage
    ) {
        require(self.stages[_service] == _stage, 'Invalid service stage');
        _;
    }

    event CreatedServiceSection(bytes32 indexed service);
    event Transition(Stages indexed current, Stages indexed previous);

    function init(ServiceContract storage self, address _contractor) external {
        require(msg.sender != _contractor, 'Client and contractor are equal.');
        self.client = msg.sender;
        self.contractor = _contractor;
        self.exists = true;
    }

    function addServiceSection(
        ServiceContract storage self,
        bytes32 _node,
        bytes32[] memory _children,
        bytes32[] memory _billings
    ) public returns (bool) {
        require(self.exists, 'Service contract not existing.');
        if (self.stages[_node] > Stages.INITIALIZED) {
            require(
                msg.sender == self.contractor,
                'Not allowed for already assigned contracts. Only contractor.'
            );
        }
        self.children[_node] = _children;
        self.stages[_node] = Stages.INITIALIZED;
        for (uint256 i = 0; i < _children.length; i++) {
            self.stages[_children[i]] = Stages.INITIALIZED;
            self.billings[_children[i]] = _billings[i];
        }
        emit CreatedServiceSection(_node);
        return true;
    }

    function stageOf(ServiceContract storage self, bytes32 _service)
        external
        view
        returns (Stages)
    {
        return self.stages[_service];
    }

    function start(ServiceContract storage self, bytes32 _service)
        external
        onlyContractor(self)
        atStage(self, _service, Stages.INITIALIZED)
        returns (bool)
    {
        self.stages[_service] = Stages.STARTED;
        emit Transition(self.stages[_service], Stages.INITIALIZED);
        return true;
    }

    function finish(ServiceContract storage self, bytes32 _service)
        external
        onlyContractor(self)
        atStage(self, _service, Stages.STARTED)
        returns (bool)
    {
        self.stages[_service] = Stages.FINISHED;
        emit Transition(self.stages[_service], Stages.STARTED);
        return true;
    }

    function approve(ServiceContract storage self, bytes32 _service)
        external
        onlyClient(self)
        atStage(self, _service, Stages.FINISHED)
        returns (bool)
    {
        self.stages[_service] = Stages.APPROVED;
        emit Transition(self.stages[_service], Stages.FINISHED);
        return true;
    }

    function reject(ServiceContract storage self, bytes32 _service)
        external
        onlyClient(self)
        atStage(self, _service, Stages.FINISHED)
        returns (bool)
    {
        self.stages[_service] = Stages.REJECTED;
        emit Transition(self.stages[_service], Stages.FINISHED);
        return true;
    }

    function pay(ServiceContract storage self, bytes32 _service)
        external
        onlyClient(self)
        atStage(self, _service, Stages.APPROVED)
        returns (bool)
    {
        self.stages[_service] = Stages.PAYED;
        emit Transition(self.stages[_service], Stages.APPROVED);
        return true;
    }
}

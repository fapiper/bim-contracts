// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

contract ServiceAgreement {
    enum Stages {
        EMPTY, // 0
        INITIALIZED, // 1
        STARTED, // 2
        FINISHED, // 3
        APPROVED, // 4
        PAYED // 5
    }

    mapping(bytes32 => Agreement) agreements;
    mapping(bytes32 => bytes32) billings;
    mapping(address => bytes32[]) agreementsByContractor;
    mapping(address => bytes32[]) agreementsByClient;
    mapping(bytes32 => bytes32[]) agreementsByService;

    struct Agreement {
        bytes32 root;
        address client;
        address contractor;
        mapping(bytes32 => Stages) stages;
        mapping(bytes32 => bytes32[]) services;
        mapping(bytes32 => bytes32) section;
    }

    modifier onlyClient(bytes32 _agreement) {
        require(
            msg.sender == agreements[_agreement].client,
            'Not allowed. Only client.'
        );
        _;
    }

    modifier onlyContractor(bytes32 _agreement) {
        require(
            msg.sender == agreements[_agreement].contractor,
            'Not allowed. Only contractor.'
        );
        _;
    }

    function createAgreement(
        bytes32 _agreement,
        bytes32 _root,
        address _contractor
    ) public returns (bool) {
        agreements[_agreement].client = msg.sender;
        agreements[_agreement].contractor = _contractor;
        agreements[_agreement].root = _root;
        agreements[_agreement].stages[_root] = Stages.INITIALIZED;
        agreementsByContractor[_contractor].push(_agreement);
        agreementsByClient[msg.sender].push(_agreement);
        agreementsByService[_root].push(_agreement);
        return true;
    }

    function addServices(
        bytes32 _agreement,
        bytes32 _parent,
        bytes32[] calldata _children,
        bytes32[] calldata _billings
    ) external returns (bool) {
        agreements[_agreement].services[_parent] = _children;
        for (uint256 i = 0; i < _billings.length; i++) {
            agreements[_agreement].section[_children[i]] = _parent;
            agreements[_agreement].stages[_children[i]] = Stages.INITIALIZED;
            agreementsByService[_children[i]].push(_agreement);
            billings[_children[i]] = _billings[i];
        }
        return true;
    }

    function getAgreementsByClient(address _client)
        external
        view
        returns (bytes32[] memory)
    {
        return agreementsByClient[_client];
    }

    function getAgreementsByContractor(address _contractor)
        external
        view
        returns (bytes32[] memory)
    {
        return agreementsByContractor[_contractor];
    }

    function getAgreementsByService(bytes32 _service)
        external
        view
        returns (bytes32[] memory)
    {
        return agreementsByService[_service];
    }

    function getServicesByAgreement(bytes32 _agreement, bytes32 _parent)
        external
        view
        returns (bytes32[] memory)
    {
        return agreements[_agreement].services[_parent];
    }

    function stageOf(bytes32 _agreement, bytes32 _service)
        public
        view
        returns (Stages)
    {
        return agreements[_agreement].stages[_service];
    }

    function start(bytes32 _agreement, bytes32 _service) public {
        bytes32[] memory related = agreementsByService[_service];
        for (uint256 i = 0; i < related.length; i++) {
            bytes32 parent = agreements[related[i]].section[_service];
            if (
                uint256(stageOf(related[i], _service)) < uint256(Stages.STARTED)
            ) agreements[related[i]].stages[_service] = Stages.STARTED;
            if (atStage(related[i], parent, Stages.STARTED))
                start(related[i], parent);
        }
    }

    function finish(bytes32 _agreement, bytes32 _service)
        public
        onlyContractor(_agreement)
    {
        bytes32 parent = agreements[_agreement].section[_service];
        agreements[_agreement].stages[_service] = Stages.FINISHED;
        if (allChildrenAtStage(_agreement, parent, Stages.FINISHED)) {
            finish(_agreement, parent);
        }
    }

    function approve(bytes32 _agreement, bytes32 _service)
        public
        onlyClient(_agreement)
    {
        bytes32 parent = agreements[_agreement].section[_service];
        agreements[_agreement].stages[_service] = Stages.APPROVED;
        bytes32[] memory _related = agreementsByService[_service];
        for (uint256 i = 0; i < _related.length; i++) {
            if (
                uint256(stageOf(_related[i], _service)) <
                uint256(Stages.FINISHED)
            ) finish(_related[i], _service);
        }
        if (allChildrenAtStage(_agreement, parent, Stages.APPROVED)) {
            approve(_agreement, parent);
        }
    }

    function pay(bytes32 _agreement, bytes32 _service)
        public
        onlyClient(_agreement)
    {
        bytes32 parent = agreements[_agreement].section[_service];
        agreements[_agreement].stages[_service] = Stages.PAYED;
        if (allChildrenAtStage(_agreement, parent, Stages.PAYED)) {
            pay(_agreement, parent);
        }
    }

    function atStage(
        bytes32 _agreement,
        bytes32 _service,
        Stages _stage
    ) internal view returns (bool) {
        Stages stage = stageOf(_agreement, _service);
        if (stage != Stages.EMPTY) return false;
        return uint256(stage) < uint256(_stage);
    }

    function allChildrenAtStage(
        bytes32 _agreement,
        bytes32 _parent,
        Stages _stage
    ) internal view returns (bool) {
        if (!atStage(_agreement, _parent, _stage)) return false;
        bytes32[] memory children = agreements[_agreement].services[_parent];
        for (uint256 i = 0; i < children.length; i++) {
            if (uint256(stageOf(_agreement, children[i])) < uint256(_stage))
                return false;
        }
        return true;
    }
}

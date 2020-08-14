// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

/**
 * @title BillingUnit
 * @dev A Billing Unit
 */
contract BillingUnit {
    event BoQItemCreated(uint256 indexed boQItemId);
    event BoQItemFinished(uint256 indexed boQItemId);

    event BillingUnitApproved(bytes32 indexed _billingUnitHash);
    event BillingUnitFinished(bytes32 indexed _billingUnitHash);

    struct BoQItem {
        address subContractor;
        uint8 progress;
        bytes32 hash;
    }

    enum State {Initialized, Started, Finished, Approved}

    mapping(uint256 => BoQItem) boQItems;

    uint256 totalBoQItems;
    uint256 totalFinishedBoQItems;

    State state;
    bytes32 public hash;

    modifier onlySubContractor(uint256 id) {
        require(msg.sender == boQItems[id].subContractor, 'No permission.');
        _;
    }

    constructor(bytes32 _hash) public {
        state = State.Initialized;
        hash = _hash;
        totalBoQItems = 0;
        totalFinishedBoQItems = 0;
    }

    /**
     * @dev Approves a Billing Unit
     */
    function approve() public {
        require(state == State.Finished);
        state = State.Approved;
        emit BillingUnitApproved(hash);
    }

    /**
     * @dev Adds a BoQ item and pushes a reference onto the corresponding billing unit stack
     */
    function addBoQItem(bytes32 _hash, address _subContractor)
        public
        returns (bool success)
    {
        boQItems[totalBoQItems].hash = _hash;
        boQItems[totalBoQItems].subContractor = _subContractor;
        boQItems[totalBoQItems].progress = 0;
        emit BoQItemCreated(totalBoQItems);
        totalBoQItems++;
        return true;
    }

    /**
     * @dev Updates the progress of a BoQ item and handles finishing of BoQ item if necessary
     */
    function setBoQItemProgress(uint256 id, uint8 progress)
        public
        onlySubContractor(id)
    {
        require(boQItems[id].progress > 0 && boQItems[id].progress < 100);
        require(progress > 0 && progress <= 100);
        boQItems[id].progress = progress;
        if (boQItems[id].progress >= 100) {
            totalFinishedBoQItems++;
            emit BoQItemFinished(id);
            if (totalFinishedBoQItems == totalBoQItems) {
                state = State.Finished;
                emit BillingUnitFinished(hash);
            }
        }
    }
}

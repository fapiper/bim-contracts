// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

/**
 * @title ConstructionProject
 * @dev Store & retreive value in a variable
 */
contract ConstructionProject {
    event BoQItemProgressChange(bytes32 hash, uint8 progress);

    // Leistungsverzeichnis
    struct BoQ {
        bool exists;
        BillingBoQItem[] items;
    }

    // Teilleistung
    struct BoQItem {
        bytes32 hash;
        bytes32 parent;
        bytes32[] items;
        uint8 progress;
    }

    // Teilleistung mit Abrechnungseinheit
    struct BillingBoQItem {
        bytes32 boqItem;
        bytes32 hash;
        address assignee; // Für Leistung verantwortliches Gewerk (Subunternehmer)
        bool approved; // Abnahme
    }

    address public generalContractor; // Rolle Generalunternehmer
    address public buildingContractor; // Rolle Bauherr

    bytes32 public hash;

    mapping(address => bool) public subContractors; // Rolle Subunternehmer

    mapping(bytes32 => BoQ) boqs; // Leistungsverzeichnisse
    mapping(bytes32 => BoQItem) boqItems; // Teilleistungen

    modifier onlyGeneralContractor {
        require(
            msg.sender == generalContractor,
            'No permission. Only general contractor.'
        );
        _;
    }

    /**
     * @dev Instantiates a Bulding Project with initial values
     */
    function init(bytes32 _hash) public {
        generalContractor = msg.sender;
        hash = _hash;
    }

    /**
     * @dev Registers sub contractor
     */
    function registerSubContractor() public onlyGeneralContractor {
        subContractors[msg.sender] = true;
    }

    /**
     * @dev Adds a new Bill of Quantity
     * @param _boq The hash of the BoQ
     */
    function addBoQ(bytes32 _boq)
        public
        onlyGeneralContractor
        returns (bool success)
    {
        require(!boqs[_boq].exists, 'BoQ already specified.');
        // boqs[_boq].items = new bytes32[](0);
        boqs[_boq].exists = true;
        return true;
    }

    /**
     * @dev Pushes a new billing boq item to the stack
     * @param _billingItem The hash of the billing item
     * @param _boqItem The hash of the boq item
     */
    function addBillingBoQItem(
        bytes32 _boq,
        bytes32 _billingItem,
        bytes32 _boqItem
    ) public onlyGeneralContractor returns (bool) {
        boqItems[_boqItem] = BoQItem(_boqItem, _boq, new bytes32[](0), 0x0);
        boqs[_boq].items.push(
            BillingBoQItem(_boqItem, _billingItem, address(0), false)
        );
        // emit BillingItemCreated(billingUnitHash);
        return true;
    }

    /**
     * @dev Creates a new boq item
     * @param _boqItem The hash of the boq item to be added
     * @param _parent The parent boq item
     */
    function addBoQItem(bytes32 _boqItem, bytes32 _parent)
        public
        onlyGeneralContractor
        returns (bool)
    {
        require(boqItems[_parent].hash != 0x0, 'Parent is not specified.');
        require(
            boqItems[_boqItem].hash == 0x0,
            'BoQ item is already specified.'
        );

        boqItems[_boqItem] = BoQItem(_boqItem, _parent, new bytes32[](0), 0x0);
        boqItems[_parent].items.push(_boqItem);
        return true;
    }

    /**
     * @dev Sets the progress of a boq item and all of its items
     * @param _boqItem The hash of the boq item to be updated
     * @param _progress The progress number (1-100) to be set
     */
    function setBoQItemProgress(bytes32 _boqItem, uint8 _progress)
        public
        returns (bool)
    {
        require(
            boqItems[_boqItem].progress < _progress,
            'Invalid progress value'
        );
        boqItems[_boqItem].progress = _progress;
        for (uint256 i = 0; i < boqItems[_boqItem].items.length; i++) {
            bytes32 item = boqItems[_boqItem].items[i];
            if (boqItems[item].progress < _progress) {
                setBoQItemProgress(item, _progress);
            }
        }
        emit BoQItemProgressChange(_boqItem, _progress);
        return true;
    }
}

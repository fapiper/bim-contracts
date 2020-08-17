pragma solidity >=0.4.22 <0.7.0;

/**
 * @title ConstructionProject
 * @dev Store & retreive value in a variable
 */
contract ConstructionProject {

    event WorkItemProgressChange(bytes32 indexed workItemId, WorkItemProgress workItemProgress);

    // Leistungsverzeichnis
    struct BOQ {
        bool exists;
        bytes32[] items;
    }
    
    // Leistungsverzeichnis-Eintrag
    struct WorkItem {
        bytes32 id;
        bytes32 parent;
        bytes32[] items;
        WorkItemProgress progress;
    }
    
    enum WorkItemProgress { INITIALIZED, STARTED, FINISHED, APPROVED }

    address public generalContractor; // Rolle Generalunternehmer
    address public buildingContractor; // Rolle Bauherr
    mapping(address => bool) public subContractors; // Rolle Subunternehmer

    mapping(bytes32 => BOQ) BOQs; // Leistungsverzeichnisse mit Referenz auf Work Items

    mapping(bytes32 => WorkItem) workItems; // Leistungsverzeichnis-Einträge
    mapping(bytes32 => bytes32) billingItems; // Work Items Referenz auf Abrechnungseinheiten  


    modifier onlyGeneralContractor {
        require(msg.sender == generalContractor, 'No permission.');
        _;
    }

    /**
     * @dev Instantiates a Contract Manager factory with initial values
     */
    constructor() public {
        generalContractor = msg.sender;
    }

    /**
     * @dev Registers sub contractor
     */
    function registerSubContractor() public onlyGeneralContractor {
        subContractors[msg.sender] = true;
    }

   /**
     * @dev Adds a new Bill of Quantity
     * @param _BOQ The hash of the BOQ
     */
    function addBOQ(bytes32 _BOQ) public onlyGeneralContractor returns (bool success) {
        require(!BOQs[_BOQ].exists, "BOQ already specified.");
        BOQs[_BOQ].items = new bytes32[](0);
        BOQs[_BOQ].exists = true;
        return true;
    }
    
    /**
     * @dev Pushes a new billing item to the stack
     * @param _billingItem The hash of the billing item
     * @param _workItemId The hash of the work item which emits payment when ready
     */
    function addBillingItem(bytes32 _billingItem, bytes32 _workItemId)
        public
        onlyGeneralContractor
        returns (bool success)
    {
        billingItems[_workItemId] = _billingItem;
        // emit BillingItemCreated(billingUnitHash);
        return true;
    }
    
    /**
     * @dev Pushes a new billing unit to the stack
     * @param _id The hash of the work item to be added
     * @param _parent The parent work item
     */
    function addWorkItem(bytes32 _id, bytes32 _parent)
        public
        onlyGeneralContractor
        returns (bool success)
    {
        require(workItems[_parent].id != 0x0 || BOQs[_parent].exists, "Parent is not specified.");
        require(workItems[_id].id == 0x0, "Work Item is already specified."); // require(workItems[_id].progress < WorkItemProgress.INITIALIZED);
        
        workItems[_id] = WorkItem({
            id: _id, 
            parent: _parent, 
            items: new bytes32[](0),
            progress: WorkItemProgress.INITIALIZED
        });
        if(BOQs[_parent].exists){
            BOQs[_parent].items.push(_id);
        } else {
            workItems[_parent].items.push(_id);
        }
        return true;
    }
    
    /**
     * @dev Sets the progress of a work item and all of its subitems to a predefined state
     * @param _id The hash of the work item to be updated
     * @param _progress The state as uint to set the progress of the work item (0=INITIALIZED, 1=STARTED, 2=STOPPED, 3=FINISHED)
     */
    function setWorkItemProgress(bytes32 _id, uint _progress)
        public
        returns (bool success)
    {
        require(uint(workItems[_id].progress) < _progress);
        workItems[_id].progress = WorkItemProgress(_progress);
        for (uint i=0; i<workItems[_id].items.length; i++) {
            bytes32 itemId = workItems[_id].items[i];
            if (uint(workItems[itemId].progress) < _progress) {
                setWorkItemProgress(itemId, _progress);
            }
        }
        emit WorkItemProgressChange(_id, WorkItemProgress(_progress));
        return true;
    }
}

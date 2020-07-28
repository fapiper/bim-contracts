// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract HashStore {
    /*
     *  Events
     */
    event OwnershipTransferred(
        address indexed _previousOwner,
        address indexed _newOwner
    );
    event NewHashStored(
        address indexed _hashSender,
        uint256 _hashId,
        string _hashContent,
        uint256 timestamp
    );
    event Withdrawn(address indexed _hashSender, uint256 amount);

    /*
     * Storage
     */

    struct Hash {
        // sender address
        address sender;
        // hash text
        string content;
        // creation timestamp
        uint256 timestamp;
    }

    // Hashes mapping
    mapping(uint256 => Hash) public hashes;
    // Contract owner
    address public owner;
    // Last stored Hash Id
    uint256 public lastHashId;
    // Service price in Wei
    uint256 public price;

    /*
     * Modifiers
     */

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /*
     * Public functions
     */

    /**
     * @dev Contract constructor
     * @param _price Service price
     */
    function HashStore(uint256 _price) public {
        // check price valid
        require(_price > 0);

        // assign owner
        owner = msg.sender;
        // assign price
        price = _price;
        // init ids
        lastHashId = 0;
    }

    /**
     * @dev Transfer contract ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        // check address not null
        require(_newOwner != address(0));

        // assign new owner
        owner = _newOwner;

        // Log event
        OwnershipTransferred(owner, _newOwner);
    }

    /**
     * @dev Withdraw contract accumulated Eth balance
     */
    function withdrawBalance() public onlyOwner {
        var amount = this.balance;

        // transfer balance
        owner.transfer(this.balance);

        // Log event
        Withdrawn(owner, amount);
    }

    /**
     * @dev save new hash
     * @param _hashContent Hash Content
     */
    function save(string _hashContent) public payable {
        // only save if service price paid
        require(msg.value >= price);

        // create Hash
        uint256 hashId = ++lastHashId;
        hashes[hashId].sender = msg.sender;
        hashes[hashId].content = _hashContent;
        hashes[hashId].timestamp = block.timestamp;

        // Log event
        NewHashStored(
            hashes[hashId].sender,
            hashId,
            hashes[hashId].content,
            hashes[hashId].timestamp
        );
    }

    /**
     * @dev find hash by id
     * @param _hashId Hash Id
     */
    function find(uint256 _hashId)
        public
        constant
        returns (
            address hashSender,
            string hashContent,
            uint256 hashTimestamp
        )
    {
        return (
            hashes[_hashId].sender,
            hashes[_hashId].content,
            hashes[_hashId].timestamp
        );
    }
}

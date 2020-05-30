pragma solidity >=0.4.21 <0.7.0;


contract Guestbook {
    event SignatureAdded(string message, bytes32 name);

    bytes32[] guests;

    function signBook(bytes32 name) public {
        guests.push(name);
        emit SignatureAdded('New guest signature!', name);
    }

    function getNames() public view returns (bytes32[] memory) {
        return guests;
    }
}

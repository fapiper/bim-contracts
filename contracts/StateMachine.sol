// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

contract StateMachine {
    enum Stages {
        EMPTY, // 0
        INITIALIZED, // 1
        STARTED, // 2
        FINISHED, // 3
        APPROVED, // 4
        REJECTED, // 5
        PAYED // 6
    }

    mapping(bytes32 => Stages) stages;

    modifier isValid(bytes32 _item) {
        require(stages[_item] > Stages.EMPTY, 'Provided item is invalid.');
        _;
    }

    modifier atStage(bytes32 _item, Stages _stage) {
        require(
            stages[_item] == _stage,
            'Function cannot be called at this time.'
        );
        _;
    }

    function _nextStage(bytes32 _item) internal {
        _setStage(_item, Stages(uint256(stages[_item]) + 1));
    }

    function _setStage(bytes32 _item, Stages _stage) internal {
        stages[_item] = _stage;
    }

    modifier transitionNext(bytes32 _item) {
        _;
        _nextStage(_item);
    }

    modifier transitionTo(bytes32 _item, Stages _stage) {
        _;
        _setStage(_item, _stage);
    }

    function stageOf(bytes32 _item) public view returns (Stages) {
        return stages[_item];
    }

    function initStage(bytes32 _item) public {
        stages[_item] = Stages.INITIALIZED;
    }
}

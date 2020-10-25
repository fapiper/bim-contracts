// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.1;

contract StateMachine {
    enum Stages {
        EMPTY, // 0
        INITIALIZED, // 1
        STARTED, // 2
        FINISHED, // 3
        APPROVED // 4
    }

    mapping(bytes32 => Stages) stages;

    modifier transitionNext(bytes32 _item) {
        _;
        _nextStage(_item);
    }

    modifier transitionTo(bytes32 _item, Stages _stage) {
        _;
        _setStage(_item, _stage);
    }

    modifier atStage(bytes32 _item, Stages _stage) {
        require(
            _atStage(_item, _stage),
            'Function cannot be called at this time. Item is not in valid stage.'
        );
        _;
    }

    modifier atStageAll(bytes32[] memory _items, Stages _stage) {
        require(
            _atStageAll(_items, _stage),
            'Function cannot be called at this time. Children are not in valid stage.'
        );
        _;
    }

    function _atStage(bytes32 _item, Stages _stage)
        internal
        view
        returns (bool)
    {
        return stages[_item] == _stage;
    }

    function _atStageAll(bytes32[] memory _items, Stages _stage)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < _items.length; i++) {
            if (stages[_items[i]] != _stage) return false;
        }
        return true;
    }

    function _setStage(bytes32 _item, Stages _stage) internal {
        stages[_item] = _stage;
    }

    function _nextStage(bytes32 _item) internal {
        _setStage(_item, Stages(uint256(stages[_item]) + 1));
    }

    function _stageOf(bytes32 _item) internal view returns (Stages) {
        return stages[_item];
    }
}

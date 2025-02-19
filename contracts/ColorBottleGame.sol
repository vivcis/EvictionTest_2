// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ColorBottleGame {
    uint8[5] public correctArrangement;
    uint256 public attempts;
    bool public gameActive;

    event GameStarted(uint8[5] arrangement);
    event GuessMade(address indexed player, uint8[5] guess, uint8 correctPositions, uint256 attempts);
    event GameWon(address indexed player);
    event GameReset(uint8[5] newArrangement);

    constructor() {
        startNewGame();
    }

    function startNewGame() public {
        correctArrangement = generateRandomArrangement();
        attempts = 0;
        gameActive = true;
        emit GameStarted(correctArrangement);
    }

    function generateRandomArrangement() internal view returns (uint8[5] memory arr) {
        arr = [uint8(1), 2, 3, 4, 5];
        uint256 randomNonce = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, block.number)));
        for (uint256 i = 0; i < 5; i++) {
            uint256 rand = (uint256(keccak256(abi.encodePacked(randomNonce, i))) % (5 - i)) + i;
            uint8 temp = arr[i];
            arr[i] = arr[rand];
            arr[rand] = temp;
        }
    }

    function guess(uint8[5] memory attempt) public returns (uint8 correctPositions) {
        require(gameActive, "Game is not active. Start a new game.");
        for (uint256 i = 0; i < 5; i++) {
            require(attempt[i] >= 1 && attempt[i] <= 5, "Each bottle must be a value between 1 and 5.");
        }
        uint8 count = 0;
        for (uint256 i = 0; i < 5; i++) {
            if (attempt[i] == correctArrangement[i]) {
                count++;
            }
        }
        correctPositions = count;
        attempts++;
        emit GuessMade(msg.sender, attempt, correctPositions, attempts);
        if (count == 5) {
            gameActive = false;
            emit GameWon(msg.sender);
        } else if (attempts >= 5) {
            correctArrangement = generateRandomArrangement();
            attempts = 0;
            emit GameReset(correctArrangement);
        }
        return correctPositions;
    }

    function checkGuess(uint8[5] memory attempt) public view returns (uint8) {
        uint8 count = 0;
        for (uint256 i = 0; i < 5; i++) {
            if (attempt[i] == correctArrangement[i]) {
                count++;
            }
        }
        return count;
    }
}

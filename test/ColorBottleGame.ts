import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";

describe("ColorBottleGame", function () {
  let game: Contract;

  beforeEach(async function () {
    const GameFactory = await ethers.getContractFactory("ColorBottleGame");
    game = (await GameFactory.deploy()) as unknown as Contract;
    await game.waitForDeployment();
  });

  it("should initialize the game with a random arrangement and be active", async function () {
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push(Number(await game.correctArrangement(i)));
    }
    expect(arr.length).to.equal(5);
    const active = await game.gameActive();
    expect(active).to.equal(true);
  });

  it("should return 5 correct positions if guess equals the correct arrangement (winning the game)", async function () {
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push(Number(await game.correctArrangement(i)));
    }
    const tx = await game.guess(arr);
    await tx.wait();
    const active = await game.gameActive();
    expect(active).to.equal(false);
  });

  it("should reset the game after 5 incorrect attempts", async function () {
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push(Number(await game.correctArrangement(i)));
    }
    let wrongGuess = arr.slice();
    wrongGuess[0] = wrongGuess[0] === 1 ? 2 : 1;
    expect(wrongGuess.toString()).to.not.equal(arr.toString());
    for (let i = 0; i < 5; i++) {
      await game.guess(wrongGuess);
    }
    const attempts = await game.attempts();
    expect(Number(attempts)).to.equal(0);
    const active = await game.gameActive();
    expect(active).to.equal(true);
  });

  it("should revert if the game is inactive (after a win)", async function () {
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push(Number(await game.correctArrangement(i)));
    }
    await game.guess(arr);
    await expect(game.guess(arr)).to.be.revertedWith("Game is not active. Start a new game.");
  });

  it("should return the correct number of positions for a partially correct guess", async function () {
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push(Number(await game.correctArrangement(i)));
    }
    let guess = arr.slice();
    [guess[0], guess[1]] = [guess[1], guess[0]];
    let correctCount = 0;
    for (let i = 0; i < 5; i++) {
      if (guess[i] === arr[i]) correctCount++;
    }
    const result = await game.checkGuess(guess);
    expect(Number(result)).to.equal(correctCount);
  });
});

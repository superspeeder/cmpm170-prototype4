import { Bird } from "./Bird";

export class Turn {
    bird: Bird
    isPlayerTurn: boolean

    constructor(bird: Bird, isPlayerTurn: boolean) {
        this.bird = bird
        this.isPlayerTurn = isPlayerTurn
    }

    startTurn() {
        this.bird.startTurn();
    }

    endTurn() {
        this.bird.endTurn();
    }
}

export class TurnQueue {
    turns: Turn[]
    currentTurn: integer

    constructor(turns: Turn[]) {
        this.turns = turns
        this.currentTurn = 0
    }

    startGame() {
        this.currentTurn = 0;
        if (this.turns.length > 0) {
            this.turns[0].startTurn();
        }
    }

    getCurrentTurn(): Turn {
        return this.turns[this.currentTurn]
    }

    nextTurn(): Turn {
        this.getCurrentTurn().endTurn()
        this.currentTurn = (this.currentTurn + 1) % this.turns.length
        this.getCurrentTurn().startTurn()
        return this.getCurrentTurn()
    }

    addTurnToQueue(turn: Turn) {
        this.turns.push(turn)
    }
}
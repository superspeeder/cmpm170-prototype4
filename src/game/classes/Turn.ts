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

    inTransition: boolean

    constructor(turns: Turn[]) {
        this.turns = turns
        this.currentTurn = 0
        this.inTransition = false;
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

    nextTurn(): Turn | null {
        if (this.currentTurn >= this.turns.length) {
            this.currentTurn = 0;
        }

        this.inTransition = true;
        if (this.getCurrentTurn() == undefined) {
            this.inTransition = false;
            return null;
        }

        this.getCurrentTurn().endTurn()
        this.currentTurn = (this.currentTurn + 1) % this.turns.length
        if (this.turns.length == 0) {
            this.inTransition = false;
            return null;
        }
        this.getCurrentTurn().startTurn()
        return this.getCurrentTurn()
    }

    addTurnToQueue(turn: Turn) {
        this.turns.push(turn)
    }
    
    removeTurn(bird: Bird) {
        for (var i = 0 ; i < this.turns.length ; i++) {
            if (this.turns[i].bird.id == bird.id) {
                if (this.currentTurn == i) {
                    if (!this.inTransition)
                        this.getCurrentTurn().endTurn()
                }
                console.log("remove turn", i, this.turns)
                this.turns.splice(i, 1)

                if (this.currentTurn == i) {
                    if (!this.inTransition)
                        this.getCurrentTurn().startTurn()
                }
                
                if (this.currentTurn >= i) {
                    this.currentTurn -= 1; // shift down 1 index
                }
                break;
            }
        }
    }
}
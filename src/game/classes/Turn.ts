import {Bird} from "./Bird";
import {Scene} from "phaser";
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;
import { gameState } from "./GameManager";

export interface TurnAction {

}

export interface TurnTarget {
    startTurn(): void;

    endTurn(): void;

    turnAnimation(scene: Scene, to: Turn): Phaser.Types.Tweens.TweenBuilderConfig | Phaser.Types.Tweens.TweenChainBuilderConfig | undefined;

    id: number;
    water: number;
}

export class Turn {
    target: TurnTarget
    isPlayerTurn: boolean

    turnActions: TurnAction[]

    constructor(target: TurnTarget, isPlayerTurn: boolean) {
        this.target = target
        this.isPlayerTurn = isPlayerTurn
    }

    startTurn() {
        this.target.startTurn();
    }

    endTurn() {
        this.target.endTurn();
        gameState.checkWin(this.isPlayerTurn);
    }
}

export interface TurnAnimationTarget {
    turnAnimation(scene: Scene, from: Turn, to: Turn): Phaser.Types.Tweens.TweenBuilderConfig | Phaser.Types.Tweens.TweenChainBuilderConfig
}

export class TurnQueue {
    turns: Turn[]
    currentTurn: integer
    rounds: integer

    turnAnimationTargets: TurnAnimationTarget[]

    inTransition: boolean

    constructor(turns: Turn[]) {
        this.turns = turns
        this.currentTurn = 0
        this.inTransition = false;
        this.turnAnimationTargets = []
        this.rounds = 0;
    }

    addTurnAnimationTarget(target: TurnAnimationTarget) {
        this.turnAnimationTargets.push(target)
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

    nextTurn(scene: Scene) {
        if (this.inTransition) {
            return;
        } // refuse to do anything if the turn change is currently happening

        if (this.currentTurn >= this.turns.length) {
            this.currentTurn = 0;
        }

        this.inTransition = true;
        if (this.getCurrentTurn() == undefined) {
            this.inTransition = false;
            return;
        }
        if (this.currentTurn >= this.turns.length) {
            this.currentTurn = 0;
        }
        if (this.currentTurn < 0) {
            this.currentTurn = 0;
        }

        if (this.currentTurn == 0) {
            this.rounds += 1;
        }

        let nextTurn = this.turns[(this.currentTurn + 1) % this.turns.length];
        this.getCurrentTurn().endTurn()

        if (this.turns.length === 0) {
            this.inTransition = false;
            return;
        }

        let tweens = this.turnAnimationTargets.map(target => target.turnAnimation(scene, this.turns[this.currentTurn], nextTurn));
        console.log(this.turns);
        console.log(this.currentTurn);
        let turnTween = this.turns[this.currentTurn].target.turnAnimation(scene, nextTurn);
        if (turnTween !== undefined) {
            tweens.push(turnTween);
        }

        tweens.push({
            targets: this,
            onComplete: () => {
                this.currentTurn = (this.currentTurn + 1) % this.turns.length
                if (this.turns.length == 0) {
                    this.inTransition = false;
                    return;
                }
                this.getCurrentTurn().startTurn()
                this.inTransition = false;
            },
            duration: 1,
        });

        let tweens2 = tweens.flatMap(t => {
            if (t.tweens != undefined) {
                return t.tweens as TweenBuilderConfig[]
            }
            return t
        }).map((t) => {
            t.paused = false;
            return t;
        })

        // tweens2[0].paused = true;

        scene.tweens.chain({targets: null, tweens: tweens2});
        // chain.play()
    }

    isInTurn() {
        return !this.inTransition;
    }

    addTarget(target: TurnTarget) {
        this.turns.push(new Turn(target, false));
    }

    removeTarget(target: TurnTarget) {
        this.turns = this.turns.filter(turn => turn.target !== target);
    }

    addTurnToQueue(turn: Turn) {
        this.turns.push(turn)
    }

    removeTurn(bird: Bird) {
        for (var i = 0; i < this.turns.length; i++) {
            if (this.turns[i].target.id == bird.id) {
                if (this.currentTurn == i) {
                    if (!this.inTransition)
                        this.getCurrentTurn().endTurn()
                }
                console.log("remove turn", i, this.turns)
                this.turns.splice(i, 1)

                if (this.currentTurn > i) {
                    this.currentTurn -= 1; // shift down 1 index
                }
                if (this.currentTurn < 0) {
                    this.currentTurn = 0;
                }
                if (this.currentTurn >= this.turns.length) {
                    this.currentTurn = 0;
                }
                break;
            }
        }
    }

    
}

import { Scene } from "phaser";
import { Bird } from "../classes/Bird";
import { gameState as gameState } from "../classes/GameManager";
import { Enemy } from "../classes/Enemy";
import {WaterDisplay} from "../classes/WaterDisplay.ts";

export class MainMenu extends Scene {
    graphics: Phaser.GameObjects.Graphics;
    graphics2: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    text2: Phaser.GameObjects.Text;
    endTurnButton: Phaser.GameObjects.Sprite;
    lastClicked: boolean
    uiClick?: string | null
    waterDisplay: WaterDisplay;

    constructor() {
        super("MainMenu");
        this.lastClicked = false;
    }

    create() {
        gameState.scene = this;
        this.graphics = this.add.graphics();
        this.graphics2 = this.add.graphics();

        this.graphics.setDefaultStyles({
            lineStyle: {
                width: 2,
                color: 0x000000,
                alpha: 1,
            },
            fillStyle: {
                color: 0xffffff,
                alpha: 1,
            },
        });

        this.graphics2.setDefaultStyles({
            lineStyle: {
                width: 2,
                color: 0x000000,
                alpha: 1,
            },
            fillStyle: {
                color: 0xffffff,
                alpha: 1,
            },
        });

        let bird = new Bird(this, [800, 800], "placeholder");
        bird.scale = 2
        this.add.existing(bird);
        gameState.addBird(bird, true);

        let bird2 = new Bird(this, [800, 800], "placeholder");
        bird2.scale = 2
        this.add.existing(bird2);
        gameState.addBird(bird2, true);

        let enemy = new Enemy(this, [1600, 500], "placeholder");
        enemy.scale = 2
        this.add.existing(enemy);
        gameState.addBird(enemy, false);

        this.endTurnButton = this.add.sprite(1800, 1400, "end-turn");
        this.endTurnButton.setScrollFactor(0)

        // this.endTurnButton.on("pointerdown", () => {
        //     this.endTurnButton.setTexture("end-turn-clicked")
        // })

        // this.endTurnButton.on("pointerup", () => {
        //     this.endTurnButton.setTexture("end-turn")
        //     gameState.turnQueue.nextTurn();
        // })

        // this.text = this.add.text(40, 40, "Water: 0", {
        //     color: "white",
        //     stroke: "black",
        //     strokeThickness: 4,
        //     fontSize: 26,
        // });
        // this.text.setScrollFactor(0)
        //
        // this.text2 = this.add.text(40, 65, "Movement: 0", {
        //     color: "white",
        //     stroke: "black",
        //     strokeThickness: 4,
        //     fontSize: 26,
        // });
        // this.text2.setScrollFactor(0)

        this.waterDisplay = new WaterDisplay(this, 80, 272, 25, 50);
        this.waterDisplay.scale = 2;
        this.add.existing(this.waterDisplay);
        this.waterDisplay.setScrollFactor(0);
        gameState.waterDisplay = this.waterDisplay;

        this.input.enable(this.endTurnButton)

        gameState.turnQueue.addTurnAnimationTarget(this.waterDisplay);
        gameState.turnQueue.startGame();

    }

    update(_time: number, delta: number) {
        gameState.drawGrid(this.graphics);

        let mousePointer = this.input.mousePointer;
        let clicked = mousePointer.leftButtonDown();
        let passthrough = true;

        if (this.endTurnButton.getBounds().contains(mousePointer.x, mousePointer.y)) {
            if (clicked && !this.lastClicked) {
                this.uiClick = "end-turn"
                this.endTurnButton.setTexture("end-turn-clicked")
            }

            if (this.uiClick == "end-turn") {
                passthrough = false;
                if (!clicked) {
                    this.uiClick = null;
                    this.endTurnButton.setTexture("end-turn")
                    gameState.turnQueue.nextTurn(this);
                }
            }
        }


        this.lastClicked = clicked;

        let camera = this.cameras.main
        gameState.updateBirds(delta, clicked && passthrough, camera);
        gameState.drawTrail(this.graphics2);

        this.waterDisplay.update();
        gameState.updateCamera();

        // this.updateText()
    }

    // updateText() {
    //     let turn = gameState.turnQueue.getCurrentTurn();
    //     if (turn === undefined) return;
    //     let tx =
    //         "Water: " +
    //         Math.floor(
    //             gameState.turnQueue.getCurrentTurn().target.water
    //         ).toFixed(0);
    //
    //     this.text.setText(tx);
    //
    //     let tx2 =
    //         "Movement: " +
    //         Math.floor(
    //             (gameState.turnQueue.getCurrentTurn().target.remainingMovement / MOVEMENT_PER_TURN) * 100
    //         ).toFixed(0) + "%";
    //     this.text2.setText(tx2);
    // }
}

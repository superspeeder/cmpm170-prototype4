import { Scene } from "phaser";
import { Bird } from "../classes/Bird";
import { gameState as gameState } from "../classes/GameManager";
import { Enemy } from "../classes/Enemy";
import { WaterDisplay } from "../classes/WaterDisplay.ts";

export class MainMenu extends Scene {
    graphics: Phaser.GameObjects.Graphics;
    graphics2: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    text2: Phaser.GameObjects.Text;
    endTurnButton: Phaser.GameObjects.Sprite;
    lastClicked: boolean
    uiClick?: string | null
    waterDisplay: WaterDisplay;
    bird: Bird;
    bird2: Bird;
    enemy: Enemy;

    nameText: Phaser.GameObjects.Text;

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

        let bird = new Bird(this, [890, 770], "hummingbird", "Jim");
        bird.setScale(0.2);
        this.add.existing(bird);

        let bird2 = new Bird(this, [670, 770], "hummingbird", "Frank");
        bird2.setScale(0.2);
        this.add.existing(bird2);

        let bird3 = new Bird(this, [450, 770], "hummingbird", "Bill");
        bird3.setScale(0.2);
        this.add.existing(bird3);

        let enemy = new Enemy(this, [1600, 500], "hummingbird", "Tim");
        enemy.setScale(0.2);
        this.add.existing(enemy);

        this.endTurnButton = this.add.sprite(1700, 1400, "end-turn");
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

        this.nameText = this.add.text(1600, 40, "Bird", {
            color: "white",
            stroke: "black",
            strokeThickness: 16,
            fontSize: 72,
        });
        this.nameText.setScrollFactor(0);


        this.waterDisplay = new WaterDisplay(this, 80, 272, 25, 50);
        this.waterDisplay.scale = 2;
        this.add.existing(this.waterDisplay);
        this.waterDisplay.setScrollFactor(0);

        this.input.enable(this.endTurnButton)

        // gameState.turnQueue.startGame();

        this.started = false;
    }

    started: boolean;

    update(_time: number, delta: number) {
        if (!this.started) {
            this.started = true;
            
            console.log(this);
            gameState.scene = this;
            gameState.addBird(this.bird, true);
            gameState.addBird(this.bird2, true);
            gameState.addBird(this.enemy, false);
            gameState.waterDisplay = this.waterDisplay;
            gameState.turnQueue.addTurnAnimationTarget(this.waterDisplay);

            gameState.turnQueue.startGame();
            gameState.enemyMaker = (scene: Phaser.Scene,
                [x, y]: [number, number],
                texture: string | Phaser.Textures.Texture,
                name: string,) => { return new Enemy(scene, [x, y], texture, name); };
        
        }
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

        let turn = gameState.turnQueue.getCurrentTurn();
        if (turn !== undefined) {
            if (turn.target.name) {
                this.nameText.setText(turn.target.name);
            }
        }
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

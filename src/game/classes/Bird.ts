import {gameState, TURN_TRANSITION_TIME} from "./GameManager";
import { HexGrid } from "./HexGrid";
import {Turn, TurnTarget} from "./Turn.ts";

export class Bird extends Phaser.GameObjects.Sprite implements TurnTarget {
    /**
     * Hummingbird instance fields
     * (this might get pretty sophisticated, these are all just ideas)
     *
     *
     * Movement
     *  - position (x,y)
     *  - tile
     *  - speed (max distance per turn)
     *
     * Combat
     *  - health
     *  - attack
     *  - range
     *  - speed
     *  - Species (determines those 4 things)
     *
     * Potential resources to manage
     *  - Food (from eating bugs)
     *  - Water (from water)
     *  - Energy (from nectar)
     *
     *
     *
     */

    keys: Phaser.Types.Input.Keyboard.CursorKeys;
    water: number;
    activeBird: boolean;
    remainingMovement: number;
    overGridColor: number;
    trail: [number,number][];
    id: integer;
    isEnemy: boolean;
    previousTurnWater: number;
    graphics: Phaser.GameObjects.Graphics;

    constructor(
        scene: Phaser.Scene,
        [x, y]: [number, number],
        texture: string | Phaser.Textures.Texture
    ) {
        super(scene, x, y, texture);
        this.keys = this.scene.input.keyboard!!.createCursorKeys();
        this.water = STARTING_WATER;
        this.activeBird = false;
        this.trail = []
        this.id = gameState.idCounter++;
        this.isEnemy = false;
        this.graphics = scene.add.graphics();
    }

    snapToHexGrid(grid: HexGrid) {
        let [x, y] = grid.tileToWorld(grid.worldToTile([this.x, this.y]));
        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            duration: 100,
            ease: "Quad.easeInOut"
        })
    }

    update(delta: number, _grid: HexGrid, gridColor: number, mouseClicked: boolean, camera: Phaser.Cameras.Scene2D.Camera) {
        this.graphics.clear();

        if (!this.activeBird) return;
        if (!gameState.turnQueue.isInTurn()) return;

        gameState.centerCamera(this.x, this.y);

        let offAngle = Math.PI / 4;
        let endPoint = (this.remainingMovement / MOVEMENT_PER_TURN) * 2 * (Math.PI - offAngle);

        this.graphics.lineStyle(6, 0xecec0f)
        this.graphics.setPosition(this.x, this.y);
        this.graphics.setRotation(offAngle * 3);

        this.graphics.beginPath();
        this.graphics.arc(0, 0, 96, 0, endPoint, false);
        this.graphics.strokePath();


        if (mouseClicked) {
            let wp = camera.getWorldPoint(this.scene.input.x, this.scene.input.y)
            let vec = [
                wp.x - this.x,
                wp.y - this.y,
            ];
            let magn = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
            let norm = [vec[0] / magn, vec[1] / magn];
            if (this.remainingMovement > 0) {
                let move_mag = Math.min(this.remainingMovement, 2 * delta / 5.0);

                this.x += move_mag * norm[0];
                this.y += move_mag * norm[1];
                this.remainingMovement -= move_mag;

                this.trail.push([this.x, this.y])
            }
            this.rotation = Math.atan2(norm[1], norm[0]) + Math.PI / 2;
        }

        this.overGridColor = gridColor;
   }

    startTurn() {
        this.activeBird = true;
        this.remainingMovement = MOVEMENT_PER_TURN;
        this.trail = []
        this.setTexture("placeholder-active")
        this.previousTurnWater = this.water;
        gameState.centerCamera(this.x, this.y);
    }

    endTurn() {
        this.setTexture("placeholder")
        this.activeBird = false;
        this.remainingMovement = 0;
        this.snapToHexGrid(gameState.grid)

        let [birdGridX, birdGridY] = gameState.grid.worldToTile([this.x, this.y]);
    
        for (let i = 0; i < gameState.territories.length; i++) {
            let territory = gameState.territories[i];
            if (territory[0] === birdGridY && territory[1] === birdGridX) {
                gameState.expand(territory, i);
                break;
            }
        }
        
        if (this.overGridColor == 0x00528f) {
            this.water += 2;
            this.water = Math.min(24, this.water);
        } else {
            this.water -= 1;
            this.water = Math.max(0, this.water);
        }

        gameState.waterDisplay.targetWater = this.water;
        this.trail = []

        if (this.water <= 0) {
            this.kill();
        }
    }

    kill() {
        this.removeFromDisplayList();
        this.removeFromUpdateList();
        gameState.onBirdKill(this);
    }

    turnAnimation(_scene: Phaser.Scene, to: Turn): Phaser.Types.Tweens.TweenBuilderConfig | Phaser.Types.Tweens.TweenChainBuilderConfig | undefined {
        if (to.target instanceof Bird) {
            return {
                targets: gameState,
                cameraCenterX: to.target.x,
                cameraCenterY: to.target.y,
                ease: 'Quad.easeInOut',
                duration: TURN_TRANSITION_TIME,
            };
        }
    }
}

export const MOVEMENT_PER_TURN: number = 700;
export const STARTING_WATER: number = 5;
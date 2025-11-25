import { gameState } from "./GameManager";
import { HexGrid } from "./HexGrid";

export class Bird extends Phaser.GameObjects.Sprite {
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
    }

    snapToHexGrid(grid: HexGrid) {
        let [x, y] = grid.tileToWorld(grid.worldToTile([this.x, this.y]));
        this.setPosition(x, y);
    }

    update(delta: number, grid: HexGrid, gridColor: number, mouseClicked: boolean, camera: Phaser.Cameras.Scene2D.Camera) {
        if (!this.activeBird) return;

        if (mouseClicked) {
            let wp = camera.getWorldPoint(this.scene.input.x, this.scene.input.y)
            let vec = [
                wp.x - this.x,
                wp.y - this.y,
            ];
            let magn = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
            let norm = [vec[0] / magn, vec[1] / magn];
            if (this.remainingMovement > 0) {
                let move_mag = Math.min(this.remainingMovement, delta / 5.0);

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
    }

    endTurn() {
        this.setTexture("placeholder")
        this.activeBird = false;
        this.remainingMovement = 0;
        this.snapToHexGrid(gameState.grid)

        
        if (this.overGridColor == 0x00528f) {
            this.water += 1;
            this.water = Math.min(50, this.water);
        } else {
            this.water -= 0.5;
            this.water = Math.max(0, this.water);
        }
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

}

export const MOVEMENT_PER_TURN: number = 350;
export const STARTING_WATER: number = 5;
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

    constructor(scene: Phaser.Scene, [x, y]: [number, number], texture: string | Phaser.Textures.Texture) {
        super(scene, x, y, texture)
        this.keys = this.scene.input.keyboard!!.createCursorKeys();
    }

    snapToHexGrid(grid: HexGrid) {
        let [x, y] = grid.tileToWorld(grid.worldToTile([this.x, this.y]))
        this.setPosition(x, y)
    }

    update(delta: number, grid: HexGrid) {
        if (this.keys.up.isDown) {
            this.y -= delta * 0.5;
        }
        
        if (this.keys.down.isDown) {
            this.y += delta * 0.5;
        }
        
        if (this.keys.left.isDown) {
            this.x -= delta * 0.5;
        }
        
        if (this.keys.right.isDown) {
            this.x += delta * 0.5;
        }
        
        if (this.keys.space.isDown) {
            this.snapToHexGrid(grid);
        }
    }
}

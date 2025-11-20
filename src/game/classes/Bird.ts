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
        if (this.scene.input.mousePointer.leftButtonDown()) {
            let vec = [this.scene.input.x - this.x, this.scene.input.y - this.y];
            let magn = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
            let norm = [vec[0] / magn, vec[1] / magn];
            this.x += delta * norm[0] / 5.0
            this.y += delta * norm[1] / 5.0
            this.rotation = Math.atan2(norm[1], norm[0]) + Math.PI / 2
        } else {
            this.snapToHexGrid(grid);
        }
    }
}

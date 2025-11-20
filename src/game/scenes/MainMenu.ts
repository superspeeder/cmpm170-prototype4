import { Scene } from "phaser";
import { HexGrid } from "../classes/HexGrid";
import { Bird } from "../classes/Bird";

export class MainMenu extends Scene {
    grid: HexGrid
    gridColor: number[][]
    graphics: Phaser.GameObjects.Graphics
    bird: Bird;
    text: Phaser.GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    create() {
        this.grid = new HexGrid(128);
        this.graphics = this.add.graphics();
        this.gridColor = [[0x007500,0x00528F,0x00528F,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x00528F,0x00528F,0x007500],
                          [0x007500,0x007500,0x00528F,0x0B4700,0x0B4700,0x0B4700,0x007500,0x007500,0x007500,0x007500,0x0B4700,0x0B4700,0x00528F,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x0B4700,0x0B4700,0x0B4700,0x0B4700,0x007500,0x007500,0x007500,0x007500,0x0B4700,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x0B4700,0x0B4700,0x0B4700,0x007500,0x007500,0x00528F,0x00528F,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x00528F,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x00528F,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x00528F,0x00528F,0x007500,0x007500,0x0B4700,0x0B4700,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x0B4700,0x0B4700,0x0B4700,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x0B4700,0x0B4700,0x0B4700,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x0B4700,0x0B4700,0x007500,0x007500,0x00528F,0x00528F,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x00528F,0x007500,0x007500,0x007500,0x007500,0x007500],
                          [0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x00528F,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500,0x007500]];

        this.graphics.setDefaultStyles({
            lineStyle: {
                width: 1,
                color: 0x000000,
                alpha: 1,
            },
            fillStyle: {
                color: 0xffffff,
                alpha: 1,
            },
        });

        this.bird = new Bird(this, [400, 400], "placeholder");
        this.add.existing(this.bird);

        this.text = this.add.text(40, 40, "Water: 0", {color: "white", stroke: "black", strokeThickness: 4, fontSize: 32});
    }

    update(_time: number, delta: number) {
        this.graphics.clear();
        let r = this.grid.tileSize / 2.0;
        let [hx, hy] = this.grid.worldToTile([this.input.x, this.input.y]);
        let [bx, by] = this.grid.worldToTile([this.bird.x, this.bird.y]);
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 12; y++) {
                let [px, py] = this.grid.tileCenter([x, y]);
                if (bx == x && by == y) {
                    this.graphics.fillStyle(0xff0000, 1)
                } else {
                    this.graphics.fillStyle(0xffffff, 1)
                }

                this.graphics.beginPath();
                for (let i = 0; i < 6; i++) {
                    this.graphics.lineTo(
                        px + r * Math.sin((i * Math.PI) / 3),
                        py + r * Math.cos((i * Math.PI) / 3)
                    );
                }
                this.graphics.closePath();
                this.graphics.strokePath();

                if (!(x == hx && y == hy) && !(x == bx && y == by)) {
                    this.graphics.fillStyle(this.gridColor[y][x], 1);
                }
                this.graphics.fillPath();
            }
        }
        this.graphics.update();

        this.bird.update(delta, this.grid, this.gridColor[by][bx]);
        let tx = "Water: " + Math.floor(this.bird.water).toFixed(0)
        this.text.setText(tx)
    }
}

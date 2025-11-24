import { MainMenu } from "../scenes/MainMenu";
import { Bird } from "./Bird";
import { HexGrid } from "./HexGrid";
import { Turn, TurnQueue } from "./Turn";

export class GameState {
    turnQueue: TurnQueue;
    scene?: MainMenu;
    grid: HexGrid;
    gridColor: number[][];
    birds: Bird[];

    constructor() {
        this.turnQueue = new TurnQueue([]);
        this.grid = new HexGrid(128);
        this.gridColor = [
            [
                0x007500, 0x00528f, 0x00528f, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x00528f, 0x00528f, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x00528f, 0x0b4700, 0x0b4700, 0x0b4700,
                0x007500, 0x007500, 0x007500, 0x007500, 0x0b4700, 0x0b4700,
                0x00528f, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x0b4700, 0x0b4700, 0x0b4700,
                0x0b4700, 0x007500, 0x007500, 0x007500, 0x007500, 0x0b4700,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x0b4700, 0x0b4700, 0x0b4700,
                0x007500, 0x007500, 0x00528f, 0x00528f, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x00528f, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x00528f,
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x00528f,
                0x00528f, 0x007500, 0x007500, 0x0b4700, 0x0b4700, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x0b4700, 0x0b4700, 0x0b4700, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x0b4700,
                0x0b4700, 0x0b4700, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x0b4700,
                0x0b4700, 0x007500, 0x007500, 0x00528f, 0x00528f, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500, 0x00528f, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x007500,
                0x00528f, 0x007500, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
        ];
        this.birds = [];
    }

    addBird(bird: Bird, player: boolean) {
        this.turnQueue.addTurnToQueue(new Turn(bird, player));
        this.birds.push(bird);
    }

    drawGrid(graphics: Phaser.GameObjects.Graphics) {
        graphics.clear();
        let r = this.grid.tileSize / 2.0;
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 12; y++) {
                let [px, py] = this.grid.tileCenter([x, y]);

                graphics.beginPath();
                for (let i = 0; i < 6; i++) {
                    graphics.lineTo(
                        px + r * Math.sin((i * Math.PI) / 3),
                        py + r * Math.cos((i * Math.PI) / 3)
                    );
                }
                graphics.closePath();
                graphics.strokePath();

                graphics.fillStyle(this.gridColor[y][x], 1);
                graphics.fillPath();
            }
        }
        graphics.update();
    }

    updateBirds(delta: number, clicked: boolean) {
        this.birds.forEach((bird) => {
            let [birdGridX, birdGridY] = this.grid.worldToTile([bird.x, bird.y])
            let color = this.gridColor[birdGridY][birdGridX]
            bird.update(delta, this.grid, color, clicked);
        })
    }

    drawTrail(graphics: Phaser.GameObjects.Graphics) {
        graphics.clear()
        let trail = this.turnQueue.getCurrentTurn().bird.trail
        if (trail.length == 0) return;

        let [px, py] = trail[0];
        trail.forEach(([x, y]) => {
            if (px != x && py != y) {
                graphics.lineBetween(px, py, x, y);
            }
            [px, py] = [x, y];
        });
        graphics.update();
    }
}

export var gameState: GameState = new GameState();

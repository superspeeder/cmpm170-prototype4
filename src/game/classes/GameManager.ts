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
    idCounter: integer;
    territories: [number, number, number, number[][]][]; // y, x, size, neighbors

    constructor() {
        this.idCounter = 1;
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
                0x007500, 0xC217B3, 0x007500, 0x007500, 0x0b4700, 0x0b4700,
                0x00528f, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x0b4700, 0x0b4700, 0x0b4700,
                0x0b4700, 0x007500, 0x007500, 0x007500, 0x007500, 0x0b4700,
                0x007500, 0x007500, 0xC217B3, 0x007500,
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
                0x007500, 0xC217B3, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x00528f,
                0x00528f, 0x007500, 0x007500, 0x0b4700, 0x0b4700, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0xC217B3, 0x007500, 0x007500, 0x007500,
                0x007500, 0x007500, 0x0b4700, 0x0b4700, 0x0b4700, 0x007500,
                0x007500, 0x007500, 0x007500, 0x007500,
            ],
            [
                0x007500, 0x007500, 0x007500, 0x007500, 0x007500, 0x0b4700,
                0x0b4700, 0x0b4700, 0x007500, 0x007500, 0x007500, 0x007500,
                0x007500, 0xC217B3, 0x007500, 0x007500,
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
        this.territories = [[1, 7, 0, [[1, 7]]], [2, 14, 0, [[2, 14]]], [5, 7, 0, [[5, 7]]], [7, 2, 0, [[7, 2]]], [9, 13, 0, [[9, 13]]]];
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

    updateBirds(delta: number, clicked: boolean, camera: Phaser.Cameras.Scene2D.Camera) {
        this.birds.forEach((bird) => {
            let [birdGridX, birdGridY] = this.grid.worldToTile([bird.x, bird.y])
            let color = this.gridColor[birdGridY][birdGridX]
            bird.update(delta, this.grid, color, clicked, camera);
        })
    }

    drawTrail(graphics: Phaser.GameObjects.Graphics) {
        graphics.clear()
        let turn = this.turnQueue.getCurrentTurn()
        if (turn == undefined) {
            return;
        }
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

    onBirdKill(bird: Bird) {
        for (var i = 0 ; i < this.birds.length ; i++) {
            if (this.birds[i].id == bird.id) {
                this.birds.splice(i, 1)
                break;
            }
        }

        this.turnQueue.removeTurn(bird)

        if (this.birds.length == 0) {
            this.scene!!.scene.start("GameOver")
        }
    }

    expand(territory: [number, number, number, number[][]], territoryIndex: number) {
        if (2 > territory[2]) {
            this.spreadTerritory(territory, territoryIndex);
            territory[3].forEach(([y, x]) => {
                if (x >= 0 && x < 16 && y >= 0 && y < 12) {
                    if (this.gridColor[y][x] == 0x007500) {
                        this.gridColor[y][x] = 0xC217B3;
                    }
                    
                }  
            });
        }
    }

    spreadTerritory(territory: [number, number, number, number[][]], territoryIndex: number) {
        let neighbors = territory[3];
        let x = territory[1];
        let y = territory[0];
        let size = territory[2];
        if (size < 2) {
            if (size < 1) {
                this.addtileNeighbors(y, x, neighbors);
            }
            else {
                neighbors.forEach(([ny, nx]) => {
                    this.addtileNeighbors(ny, nx, neighbors);
                });
            }
        }
        size += 1;
        neighbors = Array.from(new Set(neighbors));
        this.territories[territoryIndex] = [y, x, size, neighbors];
    }

    addtileNeighbors(y: number, x: number, neighbors: number[][]) {
        if (y % 2 == 0) {
            neighbors.push([y, x - 1], [y, x + 1], [y - 1, x - 1], [y - 1, x], [y + 1, x - 1], [y + 1, x]);
        }

        else {
            neighbors.push([y, x - 1], [y, x + 1], [y - 1, x], [y - 1, x + 1], [y + 1, x], [y + 1, x + 1]);
        }
    }
}

export var gameState: GameState = new GameState();

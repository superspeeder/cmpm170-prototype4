import {MainMenu} from "../scenes/MainMenu";
import {Bird} from "./Bird";
import {HexGrid} from "./HexGrid";
import {Turn, TurnQueue} from "./Turn";
import {WaterDisplay} from "./WaterDisplay.ts";

type TileKey = string;
function tileKey(tile: [number, number]): TileKey {
  return `${tile[0]},${tile[1]}`;
}


export const GRASS_COLOR: integer = 0x007500;
export const FOREST_COLOR: integer = 0x0b4700;
export const WATER_COLOR: integer = 0x00528f;
export const TERRITORY_COLOR: integer = 0xC217B3;

export class GameState {
    turnQueue: TurnQueue;
    scene?: MainMenu;
    grid: HexGrid;
    gridColor: number[][];
    worldMap: Map<number, number>
    birds: Bird[];
    idCounter: integer;
    territories: [number, number, number, number[][]][]; // y, x, size, neighbors
    cameraCenterX: number;
    cameraCenterY: number;
    waterDisplay: WaterDisplay;
    occupancy: Map<TileKey, Bird> = new Map();


    constructor() {
        this.idCounter = 1;
        this.turnQueue = new TurnQueue([]);
        this.grid = new HexGrid(256);
        this.gridColor = [
            [
                GRASS_COLOR, WATER_COLOR, WATER_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, WATER_COLOR, WATER_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, WATER_COLOR, FOREST_COLOR, FOREST_COLOR, FOREST_COLOR,
                GRASS_COLOR, TERRITORY_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR,
                WATER_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR, FOREST_COLOR,
                FOREST_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR,
                GRASS_COLOR, GRASS_COLOR, TERRITORY_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR, FOREST_COLOR,
                GRASS_COLOR, GRASS_COLOR, WATER_COLOR, WATER_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, WATER_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, WATER_COLOR,
                GRASS_COLOR, TERRITORY_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, WATER_COLOR,
                WATER_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, TERRITORY_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR, FOREST_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR,
                FOREST_COLOR, FOREST_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, TERRITORY_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR,
                FOREST_COLOR, GRASS_COLOR, GRASS_COLOR, WATER_COLOR, WATER_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, WATER_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                WATER_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
        ];

        this.worldMap = new Map();
        for (let j = 0 ; j < this.gridColor.length; j++) {
            for (let i = 0 ; i < this.gridColor[j].length; i++) {
                this.worldMap.set((i << 16) | j, this.gridColor[j][i]);
            }
        }

        this.birds = [];
        this.territories = [[1, 7, 0, [[1, 7]]], [2, 14, 0, [[2, 14]]], [5, 7, 0, [[5, 7]]], [7, 2, 0, [[7, 2]]], [9, 13, 0, [[9, 13]]]];
        this.cameraCenterX = 0;
        this.cameraCenterY = 0;
    }

    centerCamera(x: number, y: number) {
        this.cameraCenterX = x;
        this.cameraCenterY = y;
    }

    updateCamera() {
        this.scene!!.cameras.main.centerOn(this.cameraCenterX, this.cameraCenterY);
    }

    addBird(bird: Bird, player: boolean) {
        this.turnQueue.addTurnToQueue(new Turn(bird, player));
        this.updateBirdOccupancy(bird);
        this.birds.push(bird);
    }

    drawGrid(graphics: Phaser.GameObjects.Graphics) {
        graphics.clear();
        let r = this.grid.tileSize / 2.0;
        this.worldMap.forEach((color, p) => {
            let [x, y] = parsePosIndex(p);
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

            graphics.fillStyle(color, 1);
            graphics.fillPath();
        })
        // for (let x = 0; x < 16; x++) {
        //     for (let y = 0; y < 12; y++) {
        graphics.update();
    }

    updateBirds(delta: number, clicked: boolean, camera: Phaser.Cameras.Scene2D.Camera) {
        console.log("Hello!")
        this.birds.forEach((bird) => {
            let [birdGridX, birdGridY] = this.grid.worldToTile([bird.x, bird.y])
            let color = this.getTile(birdGridX, birdGridY)
            bird.update(delta, this.grid, color, clicked, camera);
            console.log(color)
        })
    }

    drawTrail(graphics: Phaser.GameObjects.Graphics) {
        graphics.clear()
        let turn = this.turnQueue.getCurrentTurn()
        if (turn == undefined || !(turn.target instanceof Bird)) {
            return;
        }
        let bird = turn.target as Bird;
        let trail = bird.trail
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
        for (var i = 0; i < this.birds.length; i++) {
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
                    if (this.getTile(x, y) == GRASS_COLOR) {
                        this.setTile(x, y, TERRITORY_COLOR);
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
            } else {
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
        } else {
            neighbors.push([y, x - 1], [y, x + 1], [y - 1, x], [y - 1, x + 1], [y + 1, x], [y + 1, x + 1]);
        }
    }

    getTile(x: number, y: number): number {
        const tile = this.worldMap.get(makePosIndex(x, y));
        if (tile === undefined || tile === null) return GRASS_COLOR;
        return tile;
    }

    setTile(x: number, y: number, tile: number): void {
        this.worldMap.set(makePosIndex(x, y), tile);
    }

    registerBird(bird: Bird) {
        this.birds.push(bird);
        this.updateBirdOccupancy(bird);
        this.turnQueue.addTarget(bird);
    }

    updateBirdOccupancy(bird: Bird) {
        const tile = this.grid.worldToTile([bird.x, bird.y]);
        this.occupancy.set(tileKey(tile), bird);
    }

    clearBirdOccupancy(bird: Bird) {
        const tile = this.grid.worldToTile([bird.x, bird.y]);
        const key = tileKey(tile);
        if (this.occupancy.get(key) === bird) {
            this.occupancy.delete(key);
        }
    }

    removeBird(bird: Bird) {
        this.clearBirdOccupancy(bird);
        this.turnQueue.removeTarget(bird);
        this.birds = this.birds.filter(b => b !== bird);
    }


    getBirdAtTile(tile: [number, number]): Bird | undefined {
        return this.occupancy.get(tileKey(tile));
    }

    getEnemyBirds(isEnemy: boolean): Bird[] {
        return this.birds.filter(b => b.isEnemy !== isEnemy);
    }
}

function makePosIndex(x: number, y: number): number {
    const xs = Math.sign(x);
    const ys = Math.sign(y);
    return (x & 0x7fff) << 16 | (xs < 0 ? 0x80000000 : 0) | (y & 0x7fff) | (ys < 0 ? 0x8000 : 0);
}

function parsePosIndex(p: number): [number, number] {
    const xs = (p & 0x80000000) == 0x80000000 ? -1 : 1;
    const ys = (p & 0x8000) == 0x8000 ? -1 : 1;
    const x = (p >> 16) & 0x7fff;
    const y = p & 0x7fff;
    return [xs == -1 ? -x : x, ys == -1 ? -y : y];
}

export var gameState: GameState = new GameState();

export const TURN_TRANSITION_TIME: number = 500;
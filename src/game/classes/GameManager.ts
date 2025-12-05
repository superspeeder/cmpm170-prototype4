import { MainMenu } from "../scenes/MainMenu";
import { Bird } from "./Bird";
import { HexGrid } from "./HexGrid";
import { Turn, TurnQueue } from "./Turn";
import { WaterDisplay } from "./WaterDisplay.ts";

type TileKey = string;
function tileKey(tile: [number, number]): TileKey {
    return `${tile[0]},${tile[1]}`;
}


export const GRASS_COLOR: integer = 0x007500;
export const FOREST_COLOR: integer = 0x0b4700;
export const WATER_COLOR: integer = 0x00528f;
export const TERRITORY_COLOR: integer = 0x750075;

export class GameState {
    turnQueue: TurnQueue;
    scene?: MainMenu;
    grid: HexGrid;
    gridColor: number[][];
    worldMap: Map<number, number>
    territoryMap: Map<number, number>;
    birds: Bird[];
    enemyKillSound?: Phaser.Sound.BaseSound;
    amusingKillImage?: Phaser.GameObjects.Sprite;
    idCounter: integer;
    territories: [number, number, number, number[][], number][]; // y, x, size, neighbors, spreadCooldown
    cameraCenterX: number;
    cameraCenterY: number;
    waterDisplay: WaterDisplay;
    occupancy: Map<TileKey, Bird> = new Map();
    enemyMaker: (scene: Phaser.Scene,
        [x, y]: [number, number],
        texture: string | Phaser.Textures.Texture,
        name: string,) => Bird;


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
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR,
                WATER_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR, FOREST_COLOR,
                FOREST_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
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
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, WATER_COLOR,
                WATER_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, FOREST_COLOR, FOREST_COLOR, FOREST_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
            ],
            [
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, FOREST_COLOR,
                FOREST_COLOR, FOREST_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
                GRASS_COLOR, GRASS_COLOR, GRASS_COLOR, GRASS_COLOR,
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

        this.birdRespawnTimer = 0;
        this.isEnemyRespawning = false;

        this.worldMap = new Map();
        for (let j = 0; j < this.gridColor.length; j++) {
            for (let i = 0; i < this.gridColor[j].length; i++) {
                this.worldMap.set((i << 16) | j, this.gridColor[j][i]);
            }
        }

        this.territories = [[1, 7, 0, [[1, 7]], 1], [2, 14, 0, [[2, 14]], 1], [5, 7, 0, [[5, 7]], 1], [7, 2, 0, [[7, 2]], 1], [8, 13, 0, [[8, 13]], 1]];
        this.territoryMap = new Map();
        for (let t of this.territories) {
            this.territoryMap.set(makePosIndex(t[1], t[0]), TERRITORY_COLOR);
        }

        this.birds = [];
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

        this.territoryMap.forEach((color, p) => {
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

            if (color == TERRITORY_COLOR) {
                graphics.fillStyle(color, 0.4);
                graphics.fillPath();
            }
        })
        // for (let x = 0; x < 16; x++) {
        //     for (let y = 0; y < 12; y++) {
        graphics.update();
    }

    updateBirds(delta: number, clicked: boolean, camera: Phaser.Cameras.Scene2D.Camera) {
        //console.log("Hello!")
        this.birds.forEach((bird) => {
            let [birdGridX, birdGridY] = this.grid.worldToTile([bird.x, bird.y])
            let color = this.getTile(birdGridX, birdGridY)
            bird.update(delta, this.grid, color, clicked, camera);
            //console.log(color)
        })

        if (this.isEnemyRespawning && this.turnQueue.rounds > this.birdRespawnTimer) {
            let enemy = this.enemyMaker(this.scene!!, [Math.floor(Math.random() * 2000), Math.floor(Math.random() * 1200)], "hummingbird", "Tim");
            enemy.setScale(0.2);
            this.scene!!.add.existing(enemy);
            this.addBird(enemy, false);
            this.isEnemyRespawning = false;
        }
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

    birdRespawnTimer: number;
    isEnemyRespawning: boolean;

    onBirdKill(bird: Bird) {
        this.clearBirdOccupancy(bird);
        this.birds = this.birds.filter(b => b.id !== bird.id);
        this.turnQueue.removeTurn(bird);

        if (bird.isEnemy === true) {
            this.birdRespawnTimer = this.turnQueue.rounds + 2;
            this.isEnemyRespawning = true;

            this.enemyKillSound?.play();
            this.amusingKillImage?.setAlpha(1);
            this.scene!!.tweens.add({
                targets: this.amusingKillImage,
                alpha: 0,
                duration: 4000,
                ease: 'Quad.easeOut',
            });
        }

        if (this.birds.length == 0) {
            this.scene!!.scene.start("GameOver")
        }
    }

    expand(territory: [number, number, number, number[][], number], territoryIndex: number) {
        if (2 > territory[2]) {
            this.spreadTerritory(territory, territoryIndex);
            territory[3].forEach(([y, x]) => {
                if (x >= 0 && x < 16 && y >= 0 && y < 12) {
                    if (this.getTile(x, y) == GRASS_COLOR || this.getTile(x, y) == WATER_COLOR) {
                        this.setTile(x, y, TERRITORY_COLOR, this.territoryMap);
                        if (!this.territories.some(t => t[0] === y && t[1] === x)) {
                            this.territories.push([y, x, 0, [[y, x]], 1]);
                        }
                    }
                }
            });
        }
    }

    spreadTerritory(territory: [number, number, number, number[][], number], territoryIndex: number) {
        let y = territory[0];
        let x = territory[1];
        let size = territory[2];
        let neighbors = territory[3];
        let spreadCooldown = territory[4];
        //if (spreadCooldown % 3 == 0) {
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
            spreadCooldown = 1;
        //} else {
            //spreadCooldown += 1;
        //}
        this.territories[territoryIndex] = [y, x, size, neighbors, spreadCooldown];
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

    setTile(x: number, y: number, tile: number, map: Map<number, number>): void {
        map.set(makePosIndex(x, y), tile);
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
        this.onBirdKill(bird);
    }


    getBirdAtTile(tile: [number, number]): Bird | undefined {
        return this.occupancy.get(tileKey(tile));
    }

    getEnemyBirds(isEnemy: boolean): Bird[] {
        return this.birds.filter(b => b.isEnemy !== isEnemy);
    }

    checkWin(isPlayerTurn: boolean) {
        let ok = true;
        this.worldMap.forEach((value, key) => {
            if (value == WATER_COLOR || value == GRASS_COLOR) {
                if (!this.territoryMap.has(key) || this.territoryMap.get(key) != TERRITORY_COLOR) {
                    ok = false;
                }
            }
        });
        if (ok) {
            if (isPlayerTurn) {
                this.scene!!.scene.start("Win");
            } else {
                this.scene!!.scene.start("GameOver");
            }
        }
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

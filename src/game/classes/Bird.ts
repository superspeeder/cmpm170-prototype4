import {gameState, TURN_TRANSITION_TIME, WATER_COLOR} from "./GameManager";
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

    maxHealth: number;
    health: number;
    attackDamage: number;
    attackRange: number; 
    hasAttackedThisTurn: boolean; 
    healthText?: Phaser.GameObjects.Text; 

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
        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.attackDamage = 2;
        this.attackRange = 1; 
        this.hasAttackedThisTurn = false;
        this.createHealthText(scene);
        this.graphics = scene.add.graphics();
        
    }

    snapToHexGrid(grid: HexGrid) {
        let [x, y] = grid.tileToWorld(grid.worldToTile([this.x, this.y]));

        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            duration: 100,
            ease: "Quad.easeInOut",
            onUpdate: () => {
                this.updateHealthText();
            },
            onComplete: () => {
                this.updateHealthText();
                gameState.updateBirdOccupancy(this);
            }
        });
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
            // world-space position of the click
            const pointer = this.scene.input.activePointer;
            const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);

            // which hex was clicked?
            const clickedTile = _grid.worldToTile([worldPoint.x, worldPoint.y]);
            const targetBird = gameState.getBirdAtTile(clickedTile);

            // 1) ATTACK: if there is an enemy on the clicked tile and we can attack it
            if (
                targetBird &&
                targetBird !== this &&
                targetBird.isEnemy !== this.isEnemy &&
                this.canAttack(targetBird, _grid)
            ) {
                this.attack(targetBird, _grid);
                // don’t move on the same click that we attacked
                this.overGridColor = gridColor;
                return;
            }

            // 2) MOVE: no valid attack target → treat click as a move command
            if (this.remainingMovement > 0) {
                // direction vector from bird to click
                const vecX = worldPoint.x - this.x;
                const vecY = worldPoint.y - this.y;
                const magn = Math.sqrt(vecX * vecX + vecY * vecY);

                // avoid NaN if click is exactly on top
                if (magn > 0.0001) {
                    const normX = vecX / magn;
                    const normY = vecY / magn;

                    // how far we can move this frame
                    const moveMag = Math.min(
                        this.remainingMovement,
                        (2 * delta) / 5.0
                    );

                    this.x += moveMag * normX;
                    this.y += moveMag * normY;
                    this.remainingMovement -= moveMag;

                    this.trail.push([this.x, this.y]);

                    // face movement direction
                    this.rotation = Math.atan2(normY, normX) + Math.PI / 2;
                }
            }
        }
        this.overGridColor = gridColor;
        this.updateHealthText();
   }

    startTurn() {
        this.activeBird = true;
        this.remainingMovement = MOVEMENT_PER_TURN;
        this.trail = []
        this.setTexture("placeholder-active")
        this.previousTurnWater = this.water;
        this.hasAttackedThisTurn = false; 
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
        
        if (this.overGridColor == WATER_COLOR) {
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
        this.updateHealthText();
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

    canAttack(target: Bird, grid: HexGrid){
        if (!this.activeBird) return false; 
        if (this.hasAttackedThisTurn) return false;
        if (this.isEnemy == target.isEnemy) return false; 

        const myTile = grid.worldToTile([this.x, this.y]);
        const targetTile = grid.worldToTile([target.x, target.y]);
        const distance = grid.hexDistance(myTile, targetTile);
        return distance <= this.attackRange;  
    }

    attack(target: Bird, grid: HexGrid){
        if (!this.canAttack(target, grid)) return;

        this.hasAttackedThisTurn = true;

        // simple feedback: small lunge & flash
        const scene = this.scene;
        scene.tweens.add({
            targets: this,
            duration: 120,
            x: target.x,
            y: target.y,
            yoyo: true
        });
        target.takeDamage(this.attackDamage);        
    }

    takeDamage(amount: number) {
        this.health -= amount;
        const originalTint = this.isEnemy ? 0xff5555 : 0xffffff;    
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(80, () => {
            this.setTint(originalTint);
        });

        if (this.health <= 0) {
            this.die();
        } else {
            this.updateHealthText();
        }
    }  
    
    die() {
        // small death animation
        const scene = this.scene;
        scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 200,
        onComplete: () => {
            this.destroy();
            this.healthText?.destroy();
        }
        });

        gameState.removeBird(this);
        gameState.onBirdKill(this);
    }

    createHealthText(scene: Phaser.Scene) {
        this.healthText = scene.add.text(this.x, this.y - 30, `${this.health}/${this.maxHealth}`, {
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
        }).setOrigin(0.5).setDepth(1000);
    }

    updateHealthText() {
        if (!this.healthText) return;
        this.healthText.setText(`${this.health}/${this.maxHealth}`);
        this.healthText.setPosition(this.x, this.y - 30);
    }
}

export const MOVEMENT_PER_TURN: number = 700;
export const STARTING_WATER: number = 5;
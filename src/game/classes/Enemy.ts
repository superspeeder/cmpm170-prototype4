import { Bird } from "./Bird"; 
import { HexGrid } from "./HexGrid"; 
import { gameState } from "./GameManager"; 

export class Enemy extends Bird {
    hasAttackedThisTurn: boolean; 

    constructor(
        scene: Phaser.Scene,
        [x, y]: [number, number],
        texture: string | Phaser.Textures.Texture,
        name: string,
        attackSound: Phaser.Sound.BaseSound
    ){
        super(scene, [x,y], texture, name, attackSound);

        this.isEnemy = true;
        this.setTint(0xff5555);
        this.hasAttackedThisTurn = false;
    }

    startTurn() {
        super.startTurn();
        this.hasAttackedThisTurn = false;
    }

    update(
        delta: number,
        grid: HexGrid,
        gridColor: number,
        _mouseClicked: boolean,
        camera: Phaser.Cameras.Scene2D.Camera
    ){
        if (!this.activeBird) return;

        gameState.centerCamera(this.x, this.y);

        const playerBirds = gameState.birds.filter(b => !b.isEnemy);
        if (playerBirds.length === 0){
            this.overGridColor = gridColor;
            this.remainingMovement = 0;
            this.activeBird = false; 
            gameState.turnQueue.nextTurn(this.scene);
            return; 
        }

        let target = playerBirds[0]; 
        let bestDist = Number.POSITIVE_INFINITY; 

        const myTile = grid.worldToTile([this.x, this.y]);

        for (const b of playerBirds) {
            const targetTile = grid.worldToTile([b.x, b.y]);
            const d = grid.hexDistance(myTile, targetTile);

            if (d < bestDist){
                bestDist = d;
                target = b; 
            }
        }

        if (!target) {
            this.overGridColor = gridColor;
            this.remainingMovement = 0;
            this.activeBird = false;
            gameState.turnQueue.nextTurn(this.scene);
            return; 
        }

        if (this.canAttack(target, grid)){
            this.attack(target, grid);
            this.remainingMovement = 0;
            this.activeBird = false; 
            this.overGridColor = gridColor; 
            gameState.turnQueue.nextTurn(this.scene);
            this.updateHealthText();
            return; 
        }
        
        const vecX = target.x - this.x;
        const vecY = target.y - this.y; 
        const magn = Math.sqrt(vecX * vecX + vecY * vecY);

        if (magn > 0 && this.remainingMovement > 0){
            const nx = vecX / magn;
            const ny = vecY / magn; 
            const move_mag = Math.min(this.remainingMovement, 2.0 * delta/5.0);
            this.x += move_mag * nx;
            this.y += move_mag * ny; 
            this.remainingMovement -= move_mag;
            this.trail.push([this.x, this.y]);
            this.rotation = Math.atan2(ny, nx) + Math.PI / 2; 
        }

        this.overGridColor = gridColor; 
        if (this.canAttack(target, grid) && !this.hasAttackedThisTurn){
            this.attack(target, grid); 
            this.remainingMovement = 0; 
            this.activeBird = false;
            this.overGridColor = gridColor;
            gameState.turnQueue.nextTurn(this.scene);
        }
        else if (this.remainingMovement <= 0){
            this.activeBird = false;
            gameState.turnQueue.nextTurn(this.scene);
        }   

        
        this.updateHealthText();
    }
}

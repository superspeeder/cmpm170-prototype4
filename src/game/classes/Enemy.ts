import { Bird } from "./Bird"; 
import { HexGrid } from "./HexGrid"; 
import { gameState } from "./GameManager"; 

export class Enemy extends Bird {
    hasAttackedThisTurn: boolean; 

    constructor(
        scene: Phaser.Scene,
        [x, y]: [number, number],
        texture: string | Phaser.Textures.Texture = "placeholder"
    ){
        super(scene, [x,y], texture);

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

        const playerBirds = gameState.birds.filter(b => !b.isEnemy);
        if (playerBirds.length === 0){
            this.overGridColor = gridColor;
            this.remainingMovement = 0;
            this.activeBird = false; 
            gameState.turnQueue.nextTurn();
            return; 
        }

        let target = playerBirds[0]; 
        let bestDist = Number.POSITIVE_INFINITY; 

        for (const b of playerBirds) {
            const dx = b.x - this.x;
            const dy = b.y - this.y; 
            const d = Math.sqrt(dx*dx + dy*dy);

            if (d < bestDist){
                bestDist = d;
                target = b; 
            }
        }

        if (!target || bestDist < 2) {
            this.overGridColor = gridColor;
            this.remainingMovement = 0;
            this.activeBird = false; 
            gameState.turnQueue.nextTurn();
            return; 
        }
        
        const vecX = target.x - this.x;
        const vecY = target.y - this.y; 
        const magn = Math.sqrt(vecX * vecX + vecY * vecY);
        const nx = vecX / magn;
        const ny = vecY / magn;

        if (this.remainingMovement > 0){
            const move_mag = Math.min(this.remainingMovement, delta/5.0);
            this.x += move_mag * nx;
            this.y += move_mag * ny; 
            this.remainingMovement -= move_mag;
            this.trail.push([this.x, this.y]);
            this.rotation = Math.atan2(ny, nx) + Math.PI / 2; 
        }

        this.overGridColor = gridColor; 
        if (this.remainingMovement <= 0){
            this.activeBird = false;
            gameState.turnQueue.nextTurn(); 
        }

        const hit_radius = 20; 
        if (bestDist < hit_radius && !this.hasAttackedThisTurn){
            target.water -= 1;
            this.hasAttackedThisTurn = true;
            if (target.water < 0){
                target.kill();
            }
            this.remainingMovement = 0;
            this.activeBird = false;
            gameState.turnQueue.nextTurn();
        }
    }
}
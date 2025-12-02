import {Turn, TurnAnimationTarget} from "./Turn.ts";
import {gameState} from "./GameManager.ts";
import TweenChainBuilderConfig = Phaser.Types.Tweens.TweenChainBuilderConfig;

export class WaterDisplay extends Phaser.GameObjects.Container implements TurnAnimationTarget {
    waterSprite: Phaser.GameObjects.Sprite;
    containerSprite: Phaser.GameObjects.Sprite;
    backingSprite: Phaser.GameObjects.Sprite;

    maxWater: number;
    water: number;

    waterImageHeight: number;
    targetWater: number;

    constructor(scene: Phaser.Scene, x: number, y: number, water: number, maxWater: number) {
        super(scene, x, y);
        this.backingSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, 'water-container-backing', 0);
        this.waterSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, 'water-container-water', 0);
        this.containerSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, 'water-container-container', 0);
        this.add([this.backingSprite, this.waterSprite, this.containerSprite]);

        this.water = water;
        this.maxWater = maxWater;
        this.targetWater = water;

        this.waterImageHeight = this.waterSprite.height;

        this.containerSprite.setAbove(this.waterSprite);
        this.backingSprite.setBelow(this.waterSprite);
    }

    turnAnimation(_scene: Phaser.Scene, _from: Turn, to: Turn): Phaser.Types.Tweens.TweenBuilderConfig | Phaser.Types.Tweens.TweenChainBuilderConfig {
        let transitionConfigs: TweenChainBuilderConfig[] = [
            {
                targets: gameState.waterDisplay,
                ease: 'Quad.easeIn',
                duration: 200,
                x: "-=200",
            },
            {
                targets: this,
                onComplete: () => {
                    gameState.waterDisplay.water = to.target.water;
                    gameState.waterDisplay.targetWater = to.target.water;
                },
                duration: 100
            },
            {
                targets: gameState.waterDisplay,
                ease: 'Quad.easeIn',
                duration: 200,
                x: "+=200",
            }
        ];

        if (this.targetWater != this.water) {
            return {
                targets: this, tweens: [{
                    targets: gameState.waterDisplay,
                    water: this.targetWater,
                    ease: 'Quad.easeInOut',
                    duration: 200,
                    hold: 150,
                }].concat(transitionConfigs as any[]) as TweenChainBuilderConfig[]
            }
        }

        transitionConfigs[0].paused = true;
        return {targets: this, tweens: transitionConfigs};

    }

    updateWaterLevel() {
        const waterPercentage = this.water / this.maxWater;
        const waterCropY = this.waterImageHeight * waterPercentage;
        this.waterSprite.setCrop(0, 0, this.waterSprite.width, waterCropY);
        this.waterSprite.setY(this.waterImageHeight - waterCropY);
    }

    update() {
        this.updateWaterLevel();
    }
}

// export default WaterDisplay;

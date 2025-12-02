import { Scene } from 'phaser';

export class Win extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameover_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('Win');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0x00ff00);

        this.gameover_text = this.add.text(512, 384, 'You Win', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}

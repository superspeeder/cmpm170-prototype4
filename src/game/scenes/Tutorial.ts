import { Scene } from "phaser";


export class Tutorial extends Scene {

    constructor ()
    {
        super('Tutorial');
    }

    create() {
        this.add.text(0, 0, "Hold Left Click to move!", {
            fontSize: 96
        });
    }

    update() {

        this.input.keyboard?.on('keydown-SPACE', () => {

            this.scene.start('MainMenu');

        });
    }
}
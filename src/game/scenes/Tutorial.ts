import { Scene } from "phaser";


export class Tutorial extends Scene {

    constructor ()
    {
        super('Tutorial');
    }

    create() {
        this.add.text(350, 300, "Hold LEFT CLICK to move!\n\nClick the Enemy to attack!\n\n\n\nConquer EVERYTHING!\n\n\n\nPress SPACE to Play", {
            fontSize: 96,
            align: "center"
        });
    }

    update() {

        this.input.keyboard?.on('keydown-SPACE', () => {
            this.sound.unlock();
            this.scene.start('MainMenu');

        });
    }
}

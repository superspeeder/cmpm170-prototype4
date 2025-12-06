import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Win } from './scenes/Win';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Tutorial } from './scenes/Tutorial';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024 * 2,
    height: 768 * 2,
    zoom: 0.75,
    parent: 'game-container',
    backgroundColor: '#028af8',
    antialias: false,
    antialiasGL: false,
    pixelArt: false,
    scene: [
        Boot,
        Preloader,
        Tutorial,
        MainMenu,
        MainGame,
        GameOver,
        Win
    ],
    scale: {
        mode: Phaser.Scale.CENTER_HORIZONTALLY,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    },
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;

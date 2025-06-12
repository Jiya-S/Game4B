class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create() {
        
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

      
        const victoryText = this.add.text(centerX, centerY - 100, 'Level Complete!', {
            fontSize: '64px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        victoryText.setAlpha(0);

        
        const instructionsText = this.add.text(centerX, centerY + 50, 'Press SPACE to play again\nPress ESC to return to menu', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        instructionsText.setAlpha(0);

       
        this.tweens.add({
            targets: [victoryText, instructionsText],
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        
        const particles = this.add.particles(0, 0, 'tilemap_sheet', {
            frame: 151, 
            quantity: 1,
            frequency: 100,
            scale: { start: 1, end: 0 },
            speed: { min: 50, max: 150 },
            lifespan: 2000,
            blendMode: 'ADD',
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(0, 0, this.cameras.main.width, this.cameras.main.height)
            }
        });

       
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('platformerScene');
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('platformerScene');
        });
    }
} 
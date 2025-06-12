class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        //this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap.png");     
        this.load.image("tilemap_packed", "tilemap_packed.png");                    // Packed tilemap
        this.load.image("background_tiles", "tilemap-backgrounds.png");   // Note the underscore instead of hyphen
        this.load.tilemapTiledJSON("platformer", "monke.tmj");   // Tilemap in JSON

        this.load.spritesheet("tilemap_sheet", "tilemap.png", {
            frameWidth: 18,
            frameHeight: 18,
            spacing: 1
        });

        this.load.spritesheet("background_sheet", "tilemap-backgrounds.png", {
            frameWidth: 24,
            frameHeight: 24,
            spacing: 1
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Load audio files
        this.load.audio('coinCollect', 'coinCollect.mp3');
        this.load.audio('running', 'running.mp3');
        this.load.audio('keyCollect', 'keyCollect.mp3');
        this.load.audio('levelComplete', 'levelComplete.wav');
        this.load.audio('jump', 'jump.wav');
        this.load.audio('buttonPress', 'buttonPress.mp3');

        this.load.audio('spaceshootermusic', 'SpaceshooterMusic.ogg');
        this.load.audio('laserShoot', 'laserShoot.wav');
        this.load.audio('platformerMusic', 'platformeraudio.mp3');

        // Space shooter assets
        this.load.image('player', 'tilemap-characters-packed.png'); // Use same player asset as platformer
        this.load.image('laser_red', 'laserRed01.png');
        this.load.image('laser_blue', 'laserBlue07.png');
        this.load.image('laser_green', 'laserGreen13.png');
        this.load.image('frigate', 'Frigate.png');
        this.load.image('starship', 'Starship.png');
        this.load.image('fighter', 'Fighter.png');
        this.load.image('civilian', 'Civilian.png');
        this.load.image('bandit', 'Bandit.png');
        this.load.image('spaceship', 'Player.png');
        this.load.image('shoppingCart', 'shoppingcart.png');

        // --- NEW PLAYER CHARACTER (player_1) ---
        // Each frame is 256x256, adjust frameWidth/frameHeight if you trim the images later
        this.load.spritesheet('player1_walk', 'player_1/Walk.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        this.load.spritesheet('player1_jump', 'player_1/Jump.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        // --- PLAYER 2 SKIN ---
        this.load.spritesheet('player2_walk', 'player_2/Walk.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        this.load.spritesheet('player2_jump', 'player_2/Jump.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        // --- PLAYER 3 SKIN ---
        this.load.spritesheet('player3_walk', 'player_3/Walk.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        this.load.spritesheet('player3_jump', 'player_3/Jump.png', {
            frameWidth: 256,
            frameHeight: 256
        });

        // Add loading event listener
        this.load.on('complete', () => {
            console.log('All assets loaded successfully');
        });

        this.load.on('loaderror', (file) => {
            console.error('Error loading asset:', file.key);
        });
    }

    create() {
        // --- NEW PLAYER CHARACTER ANIMATIONS ---
        // Walk animation: all frames of player1_walk
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player1_walk', { start: 0, end: 7 }), // Adjust end if more/less frames
            frameRate: 10,
            repeat: -1
        });
        // Idle: just first frame of walk for now
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player1_walk', frame: 0 }],
            repeat: -1
        });
        // Jump: all frames of player1_jump
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player1_jump', { start: 0, end: 3 }), // Adjust end if more/less frames
            frameRate: 6,
            repeat: -1
        });
        // --- PLAYER 2 ANIMATIONS ---
        this.anims.create({
            key: 'walk2',
            frames: this.anims.generateFrameNumbers('player2_walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle2',
            frames: [{ key: 'player2_walk', frame: 0 }],
            repeat: -1
        });
        this.anims.create({
            key: 'jump2',
            frames: this.anims.generateFrameNumbers('player2_jump', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        // --- PLAYER 3 ANIMATIONS ---
        this.anims.create({
            key: 'walk3',
            frames: this.anims.generateFrameNumbers('player3_walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle3',
            frames: [{ key: 'player3_walk', frame: 0 }],
            repeat: -1
        });
        this.anims.create({
            key: 'jump3',
            frames: this.anims.generateFrameNumbers('player3_jump', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'coin-spin',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { 
                frames: [151, 152] 
            }),
            frameRate: 8,
            repeat: -1
        });

        this.scene.start("platformerScene");
    }

    
    update() {
    }
}
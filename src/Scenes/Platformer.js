class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.cursors = null;  }

    init() {
        
        this.ACCELERATION = 700;     
        this.DRAG = 700;           
        this.MAX_SPEED = 300;     
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
    }

    create() {
       
        this.map = this.make.tilemap({ key: "platformer", tileWidth: 18, tileHeight: 18 });
        console.log('Tilemap loaded');

   
        this.tileset = this.map.addTilesetImage("tiledx3", "tilemap_tiles");

        this.tileset2 = this.map.addTilesetImage("tilemap-backgrounds", "background_tiles");
        this.tileset3 = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_packed");

    
        this.background1 = this.map.createLayer("background", this.tileset2, 0, 0);
        this.background1.setScale(2);
        this.decorLayer = this.map.createLayer("Decor", this.tileset, 0, 0);
        this.decorLayer.setScale(2.0);
        
        this.background2 = this.map.createLayer("bg2", this.tileset, 0, 0);
        this.background2.setScale(2.0);

        this.background3 = this.map.createLayer("bg3trees", this.tileset3, 0,0);
        this.background3.setScale(2.0);

        this.groundLayer = this.map.createLayer("GroundPlatform", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);
        //console.log('groundLayer:', this.groundLayer);

        this.invisibleLayer = this.map.createLayer("InvisibleLayer", this.tileset, 0, 0);
        this.invisibleLayer.setScale(2.0);
        this.invisibleLayer.visible = false;

        
        this.groundLayer.setCollisionByProperty({ collides: true });
       // console.log('Collision indexes:', this.groundLayer.layer.collideIndexes);
        
      
        this.invisibleLayer.setCollisionByProperty({ collides: true });

        
        // --- PLAYER CHARACTER: Using player_1 asset ---
        // For debugging: using first frame of walk for idle/walk, first frame of jump for jump
        // If you trim the PNGs, update the frameWidth/frameHeight in Load.js and scale here
        my.sprite.player = this.physics.add.sprite(game.config.width/8, game.config.height/3, 'player1_walk', 0).setScale(.6);
        my.sprite.player.setCollideWorldBounds(true);
        //my.sprite.player.setBounce(0.2);
        // --- DEBUG: Remove manual hitbox rectangle ---
        // (No more this.playerDebugRect)
        // --- PHYSICS DEBUG: Enable Arcade Physics debug to show player body ---
        this.physics.world.createDebugGraphic();
        this.physics.world.debugGraphic.visible = true; // Set to false to hide
        this.player = my.sprite.player;

        // Set the physics body size to match the real player (44x100)
        // and center it horizontally, align to the bottom of the sprite
        this.player.body.setSize(44, 100);
        // The sprite is 256x256, so center horizontally:
        const offsetX = (256 - 44) / 2;
        // Align to bottom:
        const offsetY = 256 - 100;
        this.player.body.setOffset(offsetX, offsetY);
        
        this.physics.world.bounds.width = this.map.widthInPixels * 2;
        this.physics.world.bounds.height = this.map.heightInPixels * 2;

        //Camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 100);

        //Parallax scrolling
        this.background1.setScrollFactor(0.5);
        this.background2.setScrollFactor(0.7);

        
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.invisibleLayer, null, () => this.invisibleLayer.visible, this);

        

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.coins.forEach(coin => {
            const origX = coin.x;
            const origY = coin.y;
            coin.setScale(2).setOrigin(0.5);
            coin.setPosition(origX * 2, origY * 2);
            
            coin.play('coin-spin');
        });

       
        this.ladders = this.map.createFromObjects("Objects", {
            name: "ladder",
            key: "tilemap_sheet",
            frame: 71
        });

      
        if (this.ladders) {
            this.ladders.forEach(ladder => {
                const origX = ladder.x;
                const origY = ladder.y;
                ladder.setScale(2).setOrigin(0.5);
                ladder.setPosition(origX * 2, origY * 2);
                
                
                this.physics.world.enable(ladder);
                ladder.body.setAllowGravity(false);
                ladder.body.setImmovable(true);
                
               
                ladder.setAlpha(0);
            });

         
            this.ladderGroup = this.add.group(this.ladders);
        }

       
        const keys = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27  
        });

       
        if (keys && keys.length > 0) {
            this.key = keys[0];  
            const origX = this.key.x;
            const origY = this.key.y;
            this.key.setScale(2).setOrigin(0.5);
            this.key.setPosition(origX * 2, origY * 2);
            
            
            this.physics.world.enable(this.key);
            this.key.body.setAllowGravity(false);
            this.key.collected = false;
        }

        
        const locks = this.map.createFromObjects("Objects", {
            name: "lock",
            key: "tilemap_sheet",
            frame: 28
        });

        
        if (locks && locks.length > 0) {
            console.log(locks);
            this.lock = locks[0];  
            const origX = this.lock.x;
            const origY = this.lock.y;
            this.lock.setScale(2).setOrigin(0.5);
            this.lock.setPosition(origX * 2, origY * 2);
            console.log('Lock created at:', this.lock.x, this.lock.y);

            this.physics.world.enable(this.lock);
            this.lock.body.setAllowGravity(false);
        }

       
        this.runningSound = this.sound.add('running', { 
            loop: true,
            volume: 1
        });

       
        if (this.coins && this.coins.length > 0) {
            this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
            this.coinGroup = this.add.group(this.coins);
            
            this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
                this.coinGroup.remove(obj2);
                this.sound.play('coinCollect');
                obj2.setBlendMode(Phaser.BlendModes.ADD);
                this.tweens.add({
                    targets: obj2,
                    alpha: { from: 1, to: 0 },
                    scale: { from: 2, to: 3 },
                    duration: 100,
                    onComplete: () => {
                        if (obj2.body) obj2.body.destroy();
                        obj2.destroy();
                    }
                });
                this.sparkleCoin(obj2.x, obj2.y);
                this.coinCount++;
                this.updateCoinText();
                this.coinText._pop = true;
            });
        }
        
       
        const buttons = this.map.createFromObjects("Objects", {
            name: "button",
            key: "tilemap_sheet",
            frame: 148 
        });

        
        this.button = buttons[0];
        //console.log('Created button:', this.button); 

        if (this.button) {
            const origX = this.button.x;
            const origY = this.button.y;
            //console.log('Button original position:', origX, origY); // Debug log
            
            this.button.setScale(2).setOrigin(0.5);
            this.button.setPosition(origX*2, origY*2);
            //console.log('Button scaled position:', this.button.x, this.button.y); // Debug log
            
           
            this.physics.world.enable(this.button);
            this.button.body.setAllowGravity(false); 
            this.button.body.setImmovable(true);     
            
          
            this.button.setInteractive();
            this.button.isPressed = false;

           
            this.button.setAlpha(1);
            this.button.setTint(0xff0000); 
            
           
            this.button.setDepth(1);

           
            this.physics.add.overlap(this.player, this.button, this.handleButtonPress, null, this);
        } else {
            console.error('Button not found in the map!');
        }

      
        if (this.movingPlatforms) {
            this.movingPlatforms.forEach(platform => {
                platform.setAlpha(0); 
                platform.active = false;
            });
        }
        
        this.waterTiles = this.decorLayer.filterTiles(tile => {
            return tile.properties.isWater == true;
        });
        
        //console.log('Found water tiles:', this.waterTiles.length);  // Debug log

        
        this.waterColliders = [];
        this.waterTiles.forEach(tile => {
            
            const scaledX = tile.pixelX * 2;
            const scaledY = tile.pixelY * 2;
            
            
            const waterHitbox = this.add.rectangle(scaledX + 18, scaledY + 18, 36, 36);
            this.physics.add.existing(waterHitbox, true); 
            
            
            
            this.waterColliders.push(waterHitbox);
            //console.log('Created water collider at:', scaledX, scaledY);  // Debug log
        });

     
        this.waterGroup = this.add.group(this.waterColliders);

        
        this.physics.add.overlap(this.player, this.waterColliders, () => {
            this.scene.start("platformerScene");
        });

        
        this.movingPlatforms = this.map.createFromObjects("MovingPlatforms", {
            name: "cloud",
            key: "tilemap_sheet"
        });

        
        if (this.movingPlatforms) {
            
            let clouds1 = [];
            let clouds2 = [];

            
            for (let i = 0; i < 4; i++) {
                const platform = this.movingPlatforms[i];
                const origX = platform.x * 2;
                const origY = platform.y * 2;
                
                const cloudPlatform = this.physics.add.sprite(origX, origY, 'tilemap_sheet', [156, 155, 155, 154][i]-1);
                cloudPlatform.setScale(2);
                
               
                cloudPlatform.setPushable(false);
                cloudPlatform.body.allowGravity = false;
                cloudPlatform.body.moves = false;
                
                clouds1.push(cloudPlatform);
                
                this.physics.add.collider(this.player, cloudPlatform);
                
                platform.destroy();
            }

           
            for (let i = 4; i < 8; i++) {
                const platform = this.movingPlatforms[i];
                const origX = platform.x * 2;
                const origY = platform.y * 2;
                
                const cloudPlatform = this.physics.add.sprite(origX, origY, 'tilemap_sheet', [156, 155, 155, 154][i-4]-1);
                cloudPlatform.setScale(2);
                
                
                cloudPlatform.setPushable(false);
                cloudPlatform.body.allowGravity = false;
                cloudPlatform.body.moves = false;
                
                clouds2.push(cloudPlatform);
            
                this.physics.add.collider(this.player, cloudPlatform);
                
                platform.destroy();
            }

           
            this.cloudGroup1 = this.add.group(clouds1);
            this.cloudGroup2 = this.add.group(clouds2);

            
            clouds1.forEach(platform => {
                platform.startX = platform.x;
                platform.direction = 1;
                platform.moveDistance = 200;
                platform.active = true;
            });

            clouds2.forEach(platform => {
                platform.startY = platform.y;
                platform.direction = 1;
                platform.moveDistance = 150;
                platform.active = true;
            });
        }

       
        this.cursors = this.input.keyboard.createCursorKeys();

        
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.input.keyboard.on('keydown-P', () => {
            console.log('x:', this.player.x, 'y:', this.player.y);
        });

       
        if (this.key) {
            this.physics.add.overlap(this.player, this.key, this.collectKey, null, this);
            
            
            this.keyText = this.add.text(16, 16, '', {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            });
            this.keyText.setScrollFactor(0); 
            this.keyText.setDepth(100); 
        }

       
        if (this.lock) {
            this.physics.add.overlap(this.player, this.lock, this.openLock, null, this);
        }

        // --- COIN COUNTER ---
        this.coinCount = 0;
        this.coinText = this.add.text(24, 24, 'Coins: 0', {
            fontSize: '32px',
            fill: '#ffe066',
            stroke: '#000',
            strokeThickness: 6,
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setScrollFactor(0).setDepth(100);

        // game store
        this.createStoreUI();

        // --- JUICE: Particle manager for effects (Phaser 3.60+ compatible) ---
        this.coinSparkleEmitter = this.add.particles(
            0, 0,                       // x,y (we'll reposition when we explode)
            'tilemap_sheet',            // texture key
            {
                frame: 151,
                speed: { min: 40, max: 120 },
                scale: { start: 1, end: 0 },
                lifespan: 400,
                quantity: 6,
                angle: { min: 0, max: 360 },
                alpha: { start: 1, end: 0 },
                blendMode: 'ADD',
                on: false                // emitter is paused by default
            }
        );

        // 2) Jump burst emitter
        this.jumpBurstEmitter = this.add.particles(
            0, 0,
            'kenny-particles',
            {
                frame: 'circle_01.png',
                speed: { min: 60, max: 180 },
                scale: { start: 0.2, end: 0 },
                lifespan: 350,
                quantity: 8,
                angle: { min: 200, max: 340 },
                alpha: { start: 1, end: 0 },
                blendMode: 'ADD',
                on: false
            }
        );
        // --- JUICE: Speed trail group ---
        this.speedTrailGroup = this.add.group();
        // --- JUICE: Rainbow trail for double jump ---
        this.rainbowColors = [0xff0000,0xffa500,0xffff00,0x00ff00,0x0000ff,0x4b0082,0xee82ee];
        this.rainbowTrailGroup = this.add.group();
        this.canDoubleJump = false;
        this.hasDoubleJump = false;
        this.doubleJumpTimer = null;

        // Add spaceship sprite, invisible by default
        this.spaceship = this.add.sprite(5174, 450, 'spaceship').setOrigin(0.5, 0.5).setScale(1).setVisible(false);

        // Restore store icon button in top right
        const { width, height } = this.scale;
        this.storeCircle = this.add.circle(width - 45, height - 45, 20, 0xffffff, 0.5)
            .setOrigin(1)
            .setScrollFactor(0)
            .setDepth(300);
        this.storeButton = this.add.image(width - 40, height - 40, 'shoppingCart')
            .setOrigin(1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })
            .setScale(0.18)
            .setDepth(301)
            .on('pointerup', () => this.toggleStore());

        // Play platformer background music
        if (!this.sound.get('platformerMusic')) {
            this.bgMusic = this.sound.add('platformerMusic', { loop: true, volume: 0.5 });
            this.bgMusic.play();
        } else {
            this.bgMusic = this.sound.get('platformerMusic');
            if (!this.bgMusic.isPlaying) this.bgMusic.play();
        }
    }

    update() {
        const player = this.player;  
        const onGround = player.body.blocked.down;

        
        let onLadder = false;
        let hasLadderAbove = false;
        
        if (this.ladders && this.ladders.length > 0) {
           
            onLadder = this.physics.overlap(player, this.ladderGroup);
            
           
            if (onLadder) {
                hasLadderAbove = this.ladders.some(ladder => 
                    ladder.y < player.y &&
                    Math.abs(ladder.x - player.x) < 16 
                );
            }
        }

       
        if (onLadder) {
            if (!hasLadderAbove && this.cursors.up.isDown) {
                
                player.body.setAllowGravity(true);
                player.setVelocityY(this.JUMP_VELOCITY);
            } else {
               
                player.body.setAllowGravity(false);
                
                
                if (this.cursors.up.isDown) {
                    player.setVelocityY(-200); 
                } else if (this.cursors.down.isDown) {
                    player.setVelocityY(200);  
                } else {
                    player.setVelocityY(0);
                }
            }

           
            if (this.cursors.left.isDown) {
                player.setVelocityX(-100); 
                player.setFlipX(false);
            } else if (this.cursors.right.isDown) {
                player.setVelocityX(100); 
                player.setFlipX(true);
            } else {
                player.setVelocityX(0);
            }
        } else {
           
            player.body.setAllowGravity(true);
            
            
            // --- ANIMATION KEYS BASED ON SKIN ---
            const skin = this.selectedSkin || 1;
            const anims = [null, ['walk','idle','jump'], ['walk2','idle2','jump2'], ['walk3','idle3','jump3']];
            
            if(this.cursors.left.isDown) {
                if (player.body.velocity.x > 0) {
                    player.setVelocityX(0);
                }
                player.setAccelerationX(-this.ACCELERATION);
                player.setFlipX(true);
                player.anims.play(anims[skin][0], true); // walk
                if (player.body.velocity.x < -this.MAX_SPEED) {
                    player.setVelocityX(-this.MAX_SPEED);
                }
            } else if(this.cursors.right.isDown) {
                if (player.body.velocity.x < 0) {
                    player.setVelocityX(0);
                }
                player.setAccelerationX(this.ACCELERATION);
                player.setFlipX(false);
                player.anims.play(anims[skin][0], true); // walk
                if (player.body.velocity.x > this.MAX_SPEED) {
                    player.setVelocityX(this.MAX_SPEED);
                }
            } else {
                player.setAccelerationX(0);
                player.setDragX(this.DRAG);
                if (Math.abs(player.body.velocity.x) < 10) {
                    player.setVelocityX(0);
                }
                player.anims.play(anims[skin][1]); // idle
            }

            if(!onGround) {
                player.anims.play(anims[skin][2]); // jump
            }
            if(onGround && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                player.setVelocityY(this.JUMP_VELOCITY);
                this.sound.play('jump');
                this.burstJump(player.x, player.y);
                this.canDoubleJump = this.hasDoubleJump;
            } else if (!onGround && this.hasDoubleJump && this.canDoubleJump && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                player.setVelocityY(this.JUMP_VELOCITY);
                this.sound.play('jump');
                this.burstJump(player.x, player.y);
                this.canDoubleJump = false;
            }
        }

      
        if (this.cloudGroup1) {
            this.cloudGroup1.getChildren().forEach(platform => {
                if (platform.active) {
                    platform.x += platform.direction * 2;
                    if (Math.abs(platform.x - platform.startX) > platform.moveDistance) {
                        platform.direction *= -1;
                    }
                }
            });
        }

        if (this.cloudGroup2) {
            this.cloudGroup2.getChildren().forEach(platform => {
                if (platform.active) {
                    platform.y += platform.direction * 1.5;
                    if (Math.abs(platform.y - platform.startY) > platform.moveDistance) {
                        platform.direction *= -1;
                    }
                }
            });
        }

   
        if (onGround && (this.cursors.left.isDown || this.cursors.right.isDown)) {
            if (!this.runningSound.isPlaying) {
                this.runningSound.play();
            }
        } else {
            if (this.runningSound.isPlaying) {
                this.runningSound.stop();
            }
        }

        if (this.storeOpen) {
            // Block all player input and movement when store is open
            player.setAccelerationX(0);
            player.setVelocityX(0);
            player.anims.play('idle', true);
            return;
        }

        // JUICE: Speed trail when speed boost is active
        if (this.MAX_SPEED > (this._originalMaxSpeed || 300)) {
            if (this.time.now % 2 === 0) {
                let trail = this.add.rectangle(player.x, player.y+8, 24, 12, 0xffe066, 0.3);
                this.speedTrailGroup.add(trail);
                this.tweens.add({ targets: trail, alpha: 0, duration: 400, onComplete: () => trail.destroy() });
            }
        }
        // JUICE: Rainbow trail when double jump is active
        if (this.hasDoubleJump) {
            if (this.time.now % 2 === 0) {
                let color = Phaser.Utils.Array.GetRandom(this.rainbowColors);
                let trail = this.add.rectangle(player.x, player.y+8, 18, 8, color, 0.4);
                this.rainbowTrailGroup.add(trail);
                this.tweens.add({ targets: trail, alpha: 0, duration: 400, onComplete: () => trail.destroy() });
            }
        }
        // JUICE: Coin text pop
        if (this.coinText && this.coinText._pop) {
            this.coinText.setScale(1.2);
            this.tweens.add({ targets: this.coinText, scale: 1, duration: 200, ease: 'Bounce' });
            this.coinText._pop = false;
        }

        // --- Store UI centering ---
        if (this.storeOpen) {
            const cam = this.cameras.main;
            const cx = cam.scrollX + cam.width / 2;
            const cy = cam.scrollY + cam.height / 2;
            // Store background
            this.storeBgGraphics.clear();
            this.storeBgGraphics.fillStyle(0x22223b, 0.98);
            this.storeBgGraphics.fillRoundedRect(cx-240, cy-180, 480, 360, 32);
            this.storeBgGraphics.lineStyle(6, 0xffe066, 1);
            this.storeBgGraphics.strokeRoundedRect(cx-240, cy-180, 480, 360, 32);
            // Title
            this.storeTitle.setPosition(cx, cy - 140);
            this.storeCloseBtn.setPosition(cx + 210, cy - 160);
            // Speed card
            this.speedCard.clear();
            this.speedCard.fillStyle(0xffe066, 0.98);
            this.speedCard.fillRoundedRect(cx-180, cy-70-30, 360, 60, 18);
            this.speedItem.setPosition(cx-120, cy-40);
            this.speedPriceCoin.setPosition(cx+80, cy-40);
            this.speedPriceTag.setPosition(cx+105, cy-40);
            // Double jump card
            this.doubleJumpCard.clear();
            this.doubleJumpCard.fillStyle(0xaaf, 0.98);
            this.doubleJumpCard.fillRoundedRect(cx-180, cy-0-30, 360, 60, 18);
            this.doubleJumpItem.setPosition(cx-120, cy+30);
            this.doubleJumpPriceCoin.setPosition(cx+80, cy+30);
            this.doubleJumpPriceTag.setPosition(cx+105, cy+30);
            // Skin 2 card
            this.skin2Card.clear();
            this.skin2Card.fillStyle(0x4ecdc4, 0.98);
            this.skin2Card.fillRoundedRect(cx-180, cy+70-30, 360, 60, 18);
            this.skin2Preview.setPosition(cx-140, cy+100);
            this.skin2Btn.setPosition(cx-80, cy+100);
            this.skin2PriceCoin.setPosition(cx+80, cy+100);
            this.skin2PriceTag.setPosition(cx+105, cy+100);
            // Skin 3 card
            this.skin3Card.clear();
            this.skin3Card.fillStyle(0xff6b6b, 0.98);
            this.skin3Card.fillRoundedRect(cx-180, cy+140-30, 360, 60, 18);
            this.skin3Preview.setPosition(cx-140, cy+170);
            this.skin3Btn.setPosition(cx-80, cy+170);
            this.skin3PriceCoin.setPosition(cx+80, cy+170);
            this.skin3PriceTag.setPosition(cx+105, cy+170);
            // Feedback
            this.storeFeedback.setPosition(cx, cy+210);
        }
    }

    handleButtonPress(player, button) {
       
        if (button === this.button && !button.isPressed) {
            //console.log('Button pressed at position:', button.x, button.y); // Debug log
            
           
            this.sound.play('buttonPress');
            
           
            button.setFrame(149);  
            button.isPressed = true;
            button.setTint(0x00ff00); 
            
            //console.log('Making invisible layer visible'); // Debug log
           
            this.invisibleLayer.visible = true;

            
            if (this.ladders) {
                this.ladders.forEach(ladder => {
                    this.tweens.add({
                        targets: ladder,
                        alpha: 1,
                        duration: 500,
                        ease: 'Power2'
                    });
                });
            }

           
            if (this.movingPlatforms) {
                // Activate cloud group 1
                this.cloudGroup1.getChildren().forEach(platform => {
                    this.tweens.add({
                        targets: platform,
                        alpha: 1,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            platform.active = true;
                        }
                    });
                });

                // Activate cloud group 2
                this.cloudGroup2.getChildren().forEach(platform => {
                    this.tweens.add({
                        targets: platform,
                        alpha: 1,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            platform.active = true;
                        }
                    });
                });
            }
        }
    }

    collectKey(player, key) {
        if (!key.collected) {
            key.collected = true;
            this.hasKey = true;  
            
            
            this.sound.play('keyCollect');
            
           
            this.keyText.setText('Key Collected!');
            
            key.setBlendMode(Phaser.BlendModes.ADD);
            
           // console.log('Key collected!'); // Debug log
            
           
            this.tweens.add({
                targets: key,
                alpha: { from: 1, to: 0 },
                scale: { from: 2, to: 3 },
                duration: 200,
                onComplete: () => {
                    key.destroy();
                }
            });
        }
    }

    openLock(player, lock) {
        if (this.hasKey && !this.lockOpened) {
            this.lockOpened = true;
            this.sound.play('levelComplete');
            this.tweens.add({
                targets: lock,
                alpha: { from: 1, to: 0 },
                scale: { from: 2, to: 3 },
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    lock.destroy();
                    // Start cutscene after lock is destroyed
                    this.startSpaceshipCutscene();
                }
            });
        } else if (!this.hasKey) {
            
            if (!this.needKeyText) {
                this.needKeyText = this.add.text(
                    this.cameras.main.worldView.centerX,
                    this.cameras.main.worldView.centerY + 50,
                    'Find the key first!',
                    {
                        fontSize: '32px',
                        fill: '#fff',
                        stroke: '#000',
                        strokeThickness: 4
                    }
                ).setOrigin(0.5);
                this.needKeyText.setScrollFactor(0);
                this.needKeyText.setDepth(100);
                
               
                this.tweens.add({
                    targets: this.needKeyText,
                    alpha: { from: 1, to: 0 },
                    duration: 2000,
                    onComplete: () => {
                        this.needKeyText.destroy();
                        this.needKeyText = null;
                    }
                });
            }
        }
    }

    createStoreUI() {
        const { width, height } = this.scale;
        // Remove old rectangle storeBg
        // --- NEW STORE BACKGROUND (Graphics, rounded corners) ---
        if (this.storeBgGraphics) this.storeBgGraphics.destroy();
        this.storeBgGraphics = this.add.graphics();
        this.storeBgGraphics.fillStyle(0x22223b, 0.98);
        this.storeBgGraphics.fillRoundedRect(width/2-240, height/2-180, 480, 360, 32);
        this.storeBgGraphics.lineStyle(6, 0xffe066, 1);
        this.storeBgGraphics.strokeRoundedRect(width/2-240, height/2-180, 480, 360, 32);
        this.storeBgGraphics.setDepth(201).setVisible(false).setAlpha(0).setScrollFactor(0);
        // --- Store Title ---
        this.storeTitle = this.add.text(width/2, height/2 - 140, '✨ In-Game Store ✨', {
            fontSize: '36px', fill: '#ffe066', fontStyle: 'bold', stroke: '#000', strokeThickness: 8, shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 8, fill: true }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setVisible(false)
        .setDepth(202)
        .setAlpha(0)
        .setScale(0.95);
        // --- Close Button ---
        this.storeCloseBtn = this.add.text(width/2 + 210, height/2 - 160, '✖', {
            fontSize: '28px', fill: '#fff', backgroundColor: '#c00', padding: { x:10, y:6 }, borderRadius: 12, fontStyle: 'bold', shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive()
        .setVisible(false)
        .setDepth(202)
        .setAlpha(0)
        .setScale(0.95)
        .on('pointerup', () => this.toggleStore());
        // --- ITEM CARDS ---
        // Helper to draw a card
        const drawCard = (y, color=0x333344) => {
            const g = this.add.graphics();
            g.fillStyle(color, 0.98);
            g.fillRoundedRect(width/2-180, y-30, 360, 60, 18);
            g.setDepth(202).setVisible(false).setAlpha(0).setScrollFactor(0);
            return g;
        };
        // Speed Boost Card
        this.speedCard = drawCard(height/2 - 70, 0xffe066);
        this.speedItem = this.add.text(width/2-120, height/2 - 70, '⚡ Speed Boost', {
            fontSize: '26px', fill: '#333', fontStyle: 'bold', stroke: '#fff', strokeThickness: 3, fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setInteractive()
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1)
        .on('pointerup', () => this.buySpeedBoost());
        this.speedPriceCoin = this.add.image(width/2 + 80, height/2 - 70, 'tilemap_sheet', 151)
            .setScale(0.8)
            .setVisible(false)
            .setDepth(203)
            .setAlpha(0)
            .setScrollFactor(0);
        this.speedPriceTag = this.add.text(width/2 + 105, height/2 - 70, '10', {
            fontSize: '22px', fill: '#fff', backgroundColor: '#333', padding: {x:8,y:4}, borderRadius: 8, fontStyle: 'bold', fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1);
        // Double Jump Card
        this.doubleJumpCard = drawCard(height/2, 0xaaf);
        this.doubleJumpItem = this.add.text(width/2-120, height/2 , '🌈 Double Jump', {
            fontSize: '26px', fill: '#222', fontStyle: 'bold', stroke: '#fff', strokeThickness: 3, fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setInteractive()
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1)
        .on('pointerup', () => this.buyDoubleJump());
        this.doubleJumpPriceCoin = this.add.image(width/2 + 80, height/2 , 'tilemap_sheet', 151)
            .setScale(0.8)
            .setVisible(false)
            .setDepth(203)
            .setAlpha(0)
            .setScrollFactor(0);
        this.doubleJumpPriceTag = this.add.text(width/2 + 105, height/2 , '15', {
            fontSize: '22px', fill: '#fff', backgroundColor: '#333', padding: {x:8,y:4}, borderRadius: 8, fontStyle: 'bold', fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1);
        // --- SKIN CARDS ---
        this.skin2Card = drawCard(height/2 + 70, 0x4ecdc4);
        this.skin2Preview = this.add.sprite(width/2-140, height/2 +70, 'player2_walk', 0)
            .setScale(0.18)
            .setVisible(false)
            .setDepth(203)
            .setAlpha(0)
            .setScrollFactor(0);
        this.skin2Btn = this.add.text(width/2-100, height/2 + 70, 'Unlock Player 2', {
            fontSize: '22px', backgroundColor: '#fff', padding: {x:10,y:6}, color: '#333', fontStyle: 'bold', stroke: '#fff', strokeThickness: 2, borderRadius: 8, fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setInteractive()
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1)
        .on('pointerup', () => this.buyOrSelectSkin(2));
        // this.skin2PriceCoin = this.add.image(width/2 + 80, height/2 + 70, 'tilemap_sheet', 151)
        //     .setScale(0.7)
        //     .setVisible(false)
        //     .setDepth(203)
        //     .setAlpha(0)
        //     .setScrollFactor(0);
        this.skin2PriceTag = this.add.text(width/2 + 120, height/2 + 70, '10', {
            fontSize: '20px', fill: '#fff', backgroundColor: '#333', padding: {x:6,y:2}, borderRadius: 8, fontStyle: 'bold', fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1);
        this.skin3Card = drawCard(height/2 + 140, 0xff6b6b);
        this.skin3Preview = this.add.sprite(width/2-140, height/2 + 140, 'player3_walk', 0)
            .setScale(0.18)
            .setVisible(false)
            .setDepth(203)
            .setAlpha(0)
            .setScrollFactor(0);
        this.skin3Btn = this.add.text(width/2-100, height/2 + 140, 'Unlock Player 3', {
            fontSize: '22px', backgroundColor: '#fff', padding: {x:10,y:6}, color: '#222', fontStyle: 'bold', stroke: '#fff', strokeThickness: 2, borderRadius: 8, fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setInteractive()
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1)
        .on('pointerup', () => this.buyOrSelectSkin(3));
        // this.skin3PriceCoin = this.add.image(width/2 + 80, height/2 + 170, 'tilemap_sheet', 151)
        //     .setScale(0.7)
        //     .setVisible(false)
        //     .setDepth(203)
        //     .setAlpha(0)
        //     .setScrollFactor(0);
        this.skin3PriceTag = this.add.text(width/2 + 120, height/2 + 140, '10', {
            fontSize: '20px', fill: '#fff', backgroundColor: '#333', padding: {x:6,y:2}, borderRadius: 8, fontStyle: 'bold', fontFamily: 'monospace'
        })
        .setOrigin(0,0.5)
        .setScrollFactor(0)
        .setVisible(false)
        .setDepth(203)
        .setAlpha(0)
        .setScale(1);
        // --- FEEDBACK TEXT ---
        this.storeFeedback = this.add.text(width/2, height/2 + 210, '', {
            fontSize: '24px', fill: '#fff', backgroundColor: '#222', padding: {x:14,y:8}, align: 'center', fontStyle: 'bold', stroke: '#000', strokeThickness: 5, shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 6, fill: true }, fontFamily: 'monospace'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setVisible(false)
        .setDepth(204)
        .setAlpha(0)
        .setScale(1);
        // Store elements for toggling/animation
        this.storeElements = [
            this.storeBgGraphics, this.storeTitle, this.storeCloseBtn,
            this.speedCard, this.speedItem, this.speedPriceCoin, this.speedPriceTag,
            this.doubleJumpCard, this.doubleJumpItem, this.doubleJumpPriceCoin, this.doubleJumpPriceTag,
            this.skin2Card, this.skin2Preview, this.skin2Btn, this.skin2PriceCoin, this.skin2PriceTag,
            this.skin3Card, this.skin3Preview, this.skin3Btn, this.skin3PriceCoin, this.skin3PriceTag,
            this.storeFeedback
        ];
        this.storeOpen = false;
    }

    toggleStore() {
        this.storeOpen = !this.storeOpen;
        // Animate all store elements
        this.storeElements.forEach(el => {
            if (!el) return;
            if (this.storeOpen) {
                el.setVisible(true);
                this.tweens.add({
                    targets: el,
                    alpha: 1,
                    scale: 1,
                    duration: 300,
                    ease: 'Back.Out',
                });
            } else {
                this.tweens.add({
                    targets: el,
                    alpha: 0,
                    scale: 0.95,
                    duration: 200,
                    ease: 'Back.In',
                    onComplete: () => el.setVisible(false)
                });
            }
        });
        // Update skin buttons on open
        if (this.storeOpen) this.updateSkinButtons();
    }

    buySpeedBoost() {
        if (this.coinCount < 10) {
            this.storeFeedback.setText('Not enough coins!').setBackgroundColor('#c00').setFill('#fff').setVisible(true);
            this.time.delayedCall(1200, () => this.storeFeedback.setVisible(false));
            return;
        }
        this.coinCount -= 10;
        this.updateCoinText();
        this.coinText._pop = true;
        this.storeFeedback.setText('Speed Boost Activated!').setBackgroundColor('#ffe066').setFill('#333').setVisible(true);
        // JUICE: Camera shake
        this.cameras.main.shake(200, 0.01);
        // Play placeholder animation (e.g. flash player)
        this.tweens.add({
            targets: this.player,
            alpha: { from: 1, to: 0.3 },
            yoyo: true,
            repeat: 6,
            duration: 100,
            onComplete: () => {
                this.player.alpha = 1;
            }
        });
        // Apply speed boost
        if (!this._originalMaxSpeed) this._originalMaxSpeed = this.MAX_SPEED;
        this.MAX_SPEED = this._originalMaxSpeed * 1.7;
        // After 7 seconds, revert
        this.time.delayedCall(7000, () => {
            this.MAX_SPEED = this._originalMaxSpeed;
            this.storeFeedback.setText('Speed Boost Ended').setBackgroundColor('#222').setFill('#fff').setVisible(true);
            this.tweens.add({
                targets: this.storeFeedback,
                alpha: { from: 1, to: 0 },
                duration: 1000,
                onComplete: () => {
                    this.storeFeedback.setVisible(false).setAlpha(1);
                }
            });
        });
    }

    buyDoubleJump() {
        if (this.coinCount < 15) {
            this.storeFeedback.setText('Not enough coins!').setBackgroundColor('#c00').setFill('#fff').setVisible(true);
            this.time.delayedCall(1200, () => this.storeFeedback.setVisible(false));
            return;
        }
        this.coinCount -= 15;
        this.updateCoinText();
        this.coinText._pop = true;
        this.storeFeedback.setText('Double Jump Activated!').setBackgroundColor('#aaf').setFill('#222').setVisible(true);
        // JUICE: Camera shake
        this.cameras.main.shake(200, 0.01);
        // Play placeholder animation (e.g. rainbow flash)
        this.tweens.add({
            targets: this.player,
            tint: { from: 0xffffff, to: 0xff00ff },
            yoyo: true,
            repeat: 4,
            duration: 80,
            onComplete: () => {
                this.player.clearTint();
            }
        });
        this.hasDoubleJump = true;
        this.canDoubleJump = true;
        if (this.doubleJumpTimer) this.doubleJumpTimer.remove();
        this.doubleJumpTimer = this.time.delayedCall(20000, () => {
            this.hasDoubleJump = false;
            this.canDoubleJump = false;
            this.storeFeedback.setText('Double Jump Ended').setBackgroundColor('#222').setFill('#fff').setVisible(true);
            this.tweens.add({
                targets: this.storeFeedback,
                alpha: { from: 1, to: 0 },
                duration: 1000,
                onComplete: () => {
                    this.storeFeedback.setVisible(false).setAlpha(1);
                }
            });
        });
    }

    buyOrSelectSkin(skinNum) {
        if (this.unlockedSkins[skinNum]) {
            this.selectedSkin = skinNum;
            this.updatePlayerSkin();
            this.updateSkinButtons();
            this.storeFeedback.setText(`Player ${skinNum} selected!`).setBackgroundColor('#ffe066').setFill('#333').setVisible(true);
            this.tweens.add({
                targets: this.storeFeedback,
                alpha: 1,
                scale: 1,
                duration: 200,
                onComplete: () => {
                    this.time.delayedCall(900, () => {
                        this.tweens.add({
                            targets: this.storeFeedback,
                            alpha: 0,
                            scale: 0.8,
                            duration: 400,
                            onComplete: () => this.storeFeedback.setVisible(false)
                        });
                    });
                }
            });
            return;
        }
        // Try to buy
        if (this.coinCount < 10) {
            this.storeFeedback.setText('Not enough coins!').setBackgroundColor('#c00').setFill('#fff').setVisible(true);
            this.tweens.add({
                targets: this.storeFeedback,
                alpha: 1,
                scale: 1,
                duration: 200,
                onComplete: () => {
                    this.time.delayedCall(900, () => {
                        this.tweens.add({
                            targets: this.storeFeedback,
                            alpha: 0,
                            scale: 0.8,
                            duration: 400,
                            onComplete: () => this.storeFeedback.setVisible(false)
                        });
                    });
                }
            });
            return;
        }
        this.coinCount -= 10;
        this.updateCoinText();
        this.unlockedSkins[skinNum] = true;
        this.selectedSkin = skinNum;
        this.updatePlayerSkin();
        this.updateSkinButtons();
        this.storeFeedback.setText(`Player ${skinNum} unlocked!`).setBackgroundColor('#aaf').setFill('#222').setVisible(true);
        this.tweens.add({
            targets: this.storeFeedback,
            alpha: 1,
            scale: 1,
            duration: 200,
            onComplete: () => {
                this.time.delayedCall(900, () => {
                    this.tweens.add({
                        targets: this.storeFeedback,
                        alpha: 0,
                        scale: 0.8,
                        duration: 400,
                        onComplete: () => this.storeFeedback.setVisible(false)
                    });
                });
            }
        });
    }

    updateSkinButtons() {
        // Update button text and visuals for skin 2
        if (this.unlockedSkins[2]) {
            this.skin2Btn.setText(this.selectedSkin === 2 ? 'Selected!' : 'Select Player 2')
                .setBackgroundColor(this.selectedSkin === 2 ? '#ffe066' : '#fff')
                .setFill(this.selectedSkin === 2 ? '#333' : '#222');
            this.skin2PriceCoin.setVisible(false);
            this.skin2PriceTag.setVisible(false);
        } else {
            this.skin2Btn.setText('Unlock Player 2')
                .setBackgroundColor('#ffe066')
                .setFill('#333');
            this.skin2PriceCoin.setVisible(true);
            this.skin2PriceTag.setVisible(true);
        }
        // Update button text and visuals for skin 3
        if (this.unlockedSkins[3]) {
            this.skin3Btn.setText(this.selectedSkin === 3 ? 'Selected!' : 'Select Player 3')
                .setBackgroundColor(this.selectedSkin === 3 ? '#aaf' : '#fff')
                .setFill(this.selectedSkin === 3 ? '#222' : '#222');
            this.skin3PriceCoin.setVisible(false);
            this.skin3PriceTag.setVisible(false);
        } else {
            this.skin3Btn.setText('Unlock Player 3')
                .setBackgroundColor('#aaf')
                .setFill('#222');
            this.skin3PriceCoin.setVisible(true);
            this.skin3PriceTag.setVisible(true);
        }
    }

    updatePlayerSkin() {
        // Remove old sprite and create new one with correct skin/animations
        const skin = this.selectedSkin;
        const anims = [null, ['walk','idle','jump'], ['walk2','idle2','jump2'], ['walk3','idle3','jump3']];
        const keys = [null, 'player1_walk', 'player2_walk', 'player3_walk'];
        const jumps = [null, 'player1_jump', 'player2_jump', 'player3_jump'];
        // Save old position/velocity
        const { x, y } = this.player;
        const vel = { x: this.player.body.velocity.x, y: this.player.body.velocity.y };
        this.player.destroy();
        this.player = this.physics.add.sprite(x, y, keys[skin], 0).setScale(.6);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(44, 100);
        const offsetX = (256 - 44) / 2;
        const offsetY = 256 - 100;
        this.player.body.setOffset(offsetX, offsetY);
        this.player.body.velocity.x = vel.x;
        this.player.body.velocity.y = vel.y;
        // Re-add collisions
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.invisibleLayer, null, () => this.invisibleLayer.visible, this);
        // Re-add overlaps
        if (this.coinGroup) this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
            this.coinGroup.remove(obj2);
            this.sound.play('coinCollect');
            obj2.setBlendMode(Phaser.BlendModes.ADD);
            this.tweens.add({
                targets: obj2,
                alpha: { from: 1, to: 0 },
                scale: { from: 2, to: 3 },
                duration: 100,
                onComplete: () => {
                    if (obj2.body) obj2.body.destroy();
                    obj2.destroy();
                }
            });
            this.sparkleCoin(obj2.x, obj2.y);
            this.coinCount++;
            this.updateCoinText();
            this.coinText._pop = true;
        });
        if (this.ladderGroup) this.physics.add.overlap(this.player, this.ladderGroup);
        if (this.key) this.physics.add.overlap(this.player, this.key, this.collectKey, null, this);
        if (this.lock) this.physics.add.overlap(this.player, this.lock, this.openLock, null, this);
        if (this.button) this.physics.add.overlap(this.player, this.button, this.handleButtonPress, null, this);
        // Camera follow
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    updateCoinText() {
        if (this.coinText) {
            this.coinText.setText('Coins: ' + this.coinCount);
        }
    }

    // --- JUICE: Coin sparkle effect ---
    sparkleCoin(x, y) {
        this.coinSparkleEmitter.explode(6, x, y);
    }

    // --- JUICE: Jump particle burst ---
    burstJump(x, y) {
        this.jumpBurstEmitter.explode(8, x, y+20);
    }

    // Spaceship cutscene logic
    startSpaceshipCutscene() {
        // Make spaceship visible
        this.spaceship.setVisible(true);
        // Optional: disable player controls here if needed
        this.player.body.enable = false;
        // Tween player to spaceship position
        this.tweens.add({
            targets: this.player,
            x: this.spaceship.x,
            y: this.spaceship.y, // slightly below spaceship
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Fade out player as they "enter" the spaceship
                this.tweens.add({
                    targets: this.player,
                    alpha: { from: 1, to: 0 },
                    duration: 400,
                    onComplete: () => {
                        this.player.setVisible(false);
                        // Spaceship blast off animation
                        this.tweens.add({
                            targets: this.spaceship,
                            y: this.spaceship.y - 200,
                            x: this.spaceship.x + 60,
                            scale: { from: 1, to: 0.5 },
                            duration: 1200,
                            ease: 'Cubic.easeIn',
                            onComplete: () => {
                                // Fade out camera and start Spaceshooter
                                this.cameras.main.fade(1000, 0, 0, 0);
                                this.time.delayedCall(1000, () => {
                                    this.scene.start('GameScene');
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    shutdown() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }
}
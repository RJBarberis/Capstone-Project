namespace SpriteKind {
    export const Block = SpriteKind.create()
    export const Layer = SpriteKind.create()
    export const ScoreParticle = SpriteKind.create()
    
}
// Globals
let Player: Sprite = null
let canDoubleJump = false
let isLevel2 = false
let dead = false
let cantMove = false
let flagTimer = 0
let coins = 0
let mSprBig: Sprite = null
let mSpr: Sprite = null
let scoreParticle: Sprite = null
let lastXVno0 = 0
let powerUp: Sprite = null
let QParticle: Sprite = null
let enemy1: EnemySprite = null
let song = music.createSong(assets.song`overworld`)

// Constants
const GRAVITY = 600
const JUMP_SPEED = -290
const ENEMY_SPEED = 75
const FOOD_BOUNCE_SPEED = 75




// Classes
class EnemySprite extends sprites.ExtendableSprite {
    hp: number
    wasStompedRecently: boolean

    constructor(img: Image, vx: number) {
        super(img, SpriteKind.Enemy)
        this.hp = 1
        this.vx = -30
        this.ay = 1000
        this.wasStompedRecently = false
    }

    hit() {
        this.hp -= 1
        this.setImage(assets.image`EnemySquish`)
        if (this.hp <= 0) {
            this.destroy(effects.none, 500)
        }
    }
}

class FoodSprite extends sprites.ExtendableSprite {
    points: number
    constructor(img: Image, vx: number, points: number) {
        super(img, SpriteKind.Food)
        this.vx = vx
        this.ay = 2000
        this.points = points
    }
    reward() {
        info.changeScoreBy(this.points)
        this.sayText(`${this.points} pts`)
        pause(500)
        this.destroy()
    }
}

// Functions
function spawnPlayer() {
    lastXVno0 = 1
    mSpr = sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Layer)
    mSprBig = sprites.create(img`
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        ................
        `, SpriteKind.Layer)
    music.play(song, music.PlaybackMode.LoopingInBackground)
    Player = sprites.create(assets.image`Player`, SpriteKind.Player)
    Player.ay = GRAVITY
    Player.fx = 400
    Player.setFlag(SpriteFlag.Invisible, true)
    tiles.placeOnTile(Player, tiles.getTileLocation(2, 13))
    Player.x += 8

    scene.cameraFollowSprite(Player)
    scene.setBackgroundColor(6)
    game.onUpdate(function () {
        if (!(dead)) {
            if (!(cantMove)) {
                if (controller.right.isPressed()) {
                    if (Player.vy < 0) {
                        Player.ax = 100
                    } else {
                        Player.ax = 400
                    }
                } else if (controller.left.isPressed()) {
                    if (Player.vy < 0) {
                        Player.ax = -100
                    } else {
                        Player.ax = -400
                    }
                } else {
                    Player.ax = 0
                }
                if (controller.B.isPressed()) {
                    if (Math.abs(Player.vx) > 175) {
                        Player.vx = Player.vx / Math.abs(Player.vx) * 175
                    }
                } else {
                    if (Math.abs(Player.vx) > 125) {
                        Player.vx = Player.vx / Math.abs(Player.vx) * 125
                    }
                }
            } else {
                if (Math.abs(Player.vx) > 100) {
                    Player.vx = Player.vx / Math.abs(Player.vx) * 100
                }
            }
        } else {
            Player.ax = 0
            Player.vx = 0
        }
    })
    scene.centerCameraAt(scene.cameraProperty(CameraProperty.X), scene.cameraProperty(CameraProperty.Y) - 20)
    game.onUpdate(function () {
        if (!(dead)) {
            if (Player.bottom - 8 - scene.cameraProperty(CameraProperty.Y) < -25) {
                scene.centerCameraAt(scene.cameraProperty(CameraProperty.X), Player.bottom - 8 + 25)
            }
            if (Player.bottom - 8 - scene.cameraProperty(CameraProperty.Y) > 25) {
                scene.centerCameraAt(scene.cameraProperty(CameraProperty.X), Player.bottom - 8 + -25)
            }

        }
        scene.centerCameraAt(scene.cameraProperty(CameraProperty.X) + (Player.x + Player.vx / 1.6 - scene.cameraProperty(CameraProperty.X)) / 10, scene.cameraProperty(CameraProperty.Y))
        if (Player.x - scene.cameraProperty(CameraProperty.X) < -30) {
            scene.centerCameraAt(Player.x + 30, scene.cameraProperty(CameraProperty.Y))
        }
        if (Player.x - scene.cameraProperty(CameraProperty.X) > 30) {
            scene.centerCameraAt(Player.x - 30, scene.cameraProperty(CameraProperty.Y))
        }
        if (Player.vy == 0) {
            Player.fx = 400
        } else {
            Player.fx = 0
        }
    })
    game.onUpdate(function () {
        mSpr.setPosition(Player.x, Player.y)
        mSprBig.x = Player.x
        mSprBig.bottom = Player.bottom
        mSprBig.setFlag(SpriteFlag.Invisible, true)
        if (dead) {
            characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.HittingWallDown, Predicate.MovingUp))
            characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.HittingWallDown, Predicate.MovingUp))
        } else {
            if (Player.vy == 0) {
                if (Player.vx > 0) {
                    if (controller.left.isPressed() && !(controller.right.isPressed())) {
                        characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingDown))
                        characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingDown))
                    } else {
                        characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.MovingRight, Predicate.FacingRight))
                        characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.MovingRight, Predicate.FacingRight))
                    }
                } else if (lastXVno0 > 0) {
                    if (!(Player.vx < 0)) {
                        characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.FacingRight, Predicate.NotMoving))
                        characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.FacingRight, Predicate.NotMoving))
                    }
                }
                if (Player.vx < 0) {
                    if (controller.right.isPressed() && !(controller.left.isPressed())) {
                        characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.FacingRight, Predicate.MovingDown))
                        characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.FacingRight, Predicate.MovingDown))
                    } else {
                        characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.MovingLeft, Predicate.FacingLeft))
                        characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.MovingLeft, Predicate.FacingLeft))
                    }
                } else if (lastXVno0 < 0) {
                    if (!(Player.vx > 0)) {
                        characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.FacingLeft, Predicate.NotMoving))
                        characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.FacingLeft, Predicate.NotMoving))
                    }
                }
            } else {
                if (lastXVno0 > 0) {
                    characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.FacingRight, Predicate.MovingUp))
                    characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.FacingRight, Predicate.MovingUp))
                } else if (lastXVno0 < 0) {
                    characterAnimations.setCharacterState(mSpr, characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingUp))
                    characterAnimations.setCharacterState(mSprBig, characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingUp))
                }
            }
        }
        if (Player.vx != 0 && Player.isHittingTile(CollisionDirection.Bottom)) {
            lastXVno0 = Player.vx
            if (controller.left.isPressed() && Player.vx > 0 || controller.right.isPressed() && Player.vx < 0) {
                if (!(controller.left.isPressed() && controller.right.isPressed())) {
                    lastXVno0 = 0 - lastXVno0
                }
            }
        }
    })
    
}

function jumpHandler() {
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        if (Player.isHittingTile(CollisionDirection.Bottom)) {
            Player.vy = JUMP_SPEED + Math.abs(Player.vx) / -50
            canDoubleJump = true
        }
    })
}

function spawnEnemies() {
    for (let location of tiles.getTilesByType(assets.tile`goombSpawn`)) {
        enemy1 = new EnemySprite(assets.image`Enemy`, ENEMY_SPEED)
        tiles.placeOnTile(enemy1, location)
    }
    game.onUpdate(function () {
        for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
            if (e.isHittingTile(CollisionDirection.Right)) e.vx = -ENEMY_SPEED
            else if (e.isHittingTile(CollisionDirection.Left)) e.vx = ENEMY_SPEED
        }
    })
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
        if (!(sprites.readDataBoolean(otherSprite, "dead"))) {
            if (sprites.readDataString(otherSprite, "type") == "G") {
                if (sprite.vy > 0) {
                    sprite.vy = -100
                    sprite.y += -5
                    sprites.setDataBoolean(otherSprite, "dead", true)
                    otherSprite.vx = 0
                    otherSprite.lifespan = 500
                    animation.runImageAnimation(
                    otherSprite,
                    [img`
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . e e e e . . . . . . 
                        . . . e e e e e e e e e e . . . 
                        . e e f f f e e e e f f f e e . 
                        e e d d d d f f f f d d d d e e 
                        e e e e e e e e e e e e e e e e 
                        . . . d d d d d d d d d d . . . 
                        . . . . d d d d d d d d . . . . 
                        . f f f f f . . . . f f f f f . 
                        `],
                    500,
                    false
                    )
                    scoreParticle = sprites.create(img`
                        . . . 1 . . . 1 . . . 1 . . . . 
                        . . 1 1 . . 1 . 1 . 1 . 1 . . . 
                        . . . 1 . . 1 . 1 . 1 . 1 . . . 
                        . . . 1 . . 1 . 1 . 1 . 1 . . . 
                        . . . 1 . . 1 . 1 . 1 . 1 . . . 
                        . . . 1 . . 1 . 1 . 1 . 1 . . . 
                        . . 1 1 1 . 1 1 1 . 1 1 1 . . . 
                        . . 1 1 1 . . 1 . . . 1 . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        `, SpriteKind.ScoreParticle)
                    scoreParticle.setPosition(otherSprite.x, otherSprite.y)
                    music.play(music.createSoundEffect(WaveShape.Square, 731, 553, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    music.play(music.createSoundEffect(WaveShape.Square, 731, 553, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    music.play(music.createSoundEffect(WaveShape.Square, 731, 553, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    timer.after(100, function () {
                        music.play(music.createSoundEffect(WaveShape.Square, 954, 776, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                        music.play(music.createSoundEffect(WaveShape.Square, 954, 776, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                        music.play(music.createSoundEffect(WaveShape.Square, 954, 776, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    })
                } else if (sprite.bottom >= otherSprite.bottom && sprites.readDataNumber(Player, "inv") == 0) {
                    if (sprites.readDataNumber(Player, "power") > 0) {
                        sprites.setDataNumber(Player, "inv", 100)
                        sprites.setDataNumber(Player, "power", 0)
                        timer.throttle("psound", 5000, function () {
                            for (let index = 0; index < 5; index++) {
                                music.play(music.createSoundEffect(WaveShape.Square, 910, 107, 255, 0, 175, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                            }
                            timer.after(200, function () {
                                for (let index = 0; index < 5; index++) {
                                    music.play(music.createSoundEffect(WaveShape.Square, 910, 107, 255, 0, 175, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                                }
                                timer.after(200, function () {
                                    for (let index = 0; index < 5; index++) {
                                        music.play(music.createSoundEffect(WaveShape.Square, 910, 107, 255, 0, 175, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                                    }
                                })
                            })
                        })
                    } else {
                        die()
                    }
                } else if (sprites.readDataNumber(Player, "inv") > 100) {
                    sprites.destroy(otherSprite)
                    for (let index = 0; index < 3; index++) {
                        music.play(music.createSoundEffect(WaveShape.Square, 731, 553, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    }
                    timer.after(100, function () {
                        for (let index = 0; index < 3; index++) {
                            music.play(music.createSoundEffect(WaveShape.Square, 954, 776, 0, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                        }
                    })
                } else {
                    
                }
            } else {
                
            }
        }
    })
    game.onUpdate(function () {
        for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
            if (Player.overlapsWith(enemy)) {
                let e = enemy as EnemySprite
                if (e.wasStompedRecently) continue
                let isStomp = Player.vy > 0 && Player.bottom <= enemy.top + 6
                if (isStomp) {
                    e.wasStompedRecently = true
                    e.hit()
                    Player.vy = JUMP_SPEED / 2
                    timer.after(200, function () {
                        e.wasStompedRecently = false
                    })
                } else {
                    die()
                }
            }
        }
    })
}

function spawnFoods() {
    let food1 = new FoodSprite(assets.image`DonutFood`, FOOD_BOUNCE_SPEED, 1)
    tiles.placeOnTile(food1, tiles.getTilesByType(assets.tile`foodTile`)[0])

    let food2 = new FoodSprite(assets.image`HamburgerFood`, -FOOD_BOUNCE_SPEED, 2)
    tiles.placeOnTile(food2, tiles.getTilesByType(assets.tile`foodTile`)[1])

    game.onUpdate(function () {
        for (let f of sprites.allOfKind(SpriteKind.Food)) {
            if (f.isHittingTile(CollisionDirection.Right)) f.vx = -FOOD_BOUNCE_SPEED
            else if (f.isHittingTile(CollisionDirection.Left)) f.vx = FOOD_BOUNCE_SPEED
        }
    })

    sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (player, food) {
        (food as FoodSprite).reward()
    })
}

function powerUpBlock() {
scene.onHitWall(SpriteKind.Player, function (sprite, location) {
    if (location.bottom == sprite.top) {
        sprite.vy = Math.abs(sprite.vy) / 2
        music.play(music.createSoundEffect(WaveShape.Square, 241, 0, 255, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(WaveShape.Square, 241, 0, 255, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(WaveShape.Square, 241, 0, 255, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(WaveShape.Square, 241, 0, 255, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        if (tiles.tileAtLocationEquals(location, assets.tile`question`) || tiles.tileAtLocationEquals(location, assets.tile`questionInvis`)) {
            QParticle = sprites.create(img`
                . f f f f f f f f f f f f f f . 
                f e e e e e e e e e e e e e e f 
                f e f e e e e e e e e e e f e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e e e e e e e e e e e e e e f 
                f e f e e e e e e e e e e f e f 
                f e e e e e e e e e e e e e e f 
                . f f f f f f f f f f f f f f .
                `, SpriteKind.Projectile)
            sprites.setDataNumber(QParticle, "yval", location.y)
            sprites.setDataNumber(QParticle, "yrow", location.row)
            sprites.setDataString(QParticle, "type", "Q")
            tiles.setTileAt(location, assets.tile`transparency16`)
            tiles.placeOnTile(QParticle, location)
            if (QParticle.tileKindAt(TileDirection.Top, assets.tile`mushroomSpawner`)) {
                if (sprites.readDataNumber(Player, "power") > 0) {
                    powerUp = sprites.create(img`
                        . . . . 1 1 1 1 1 1 1 1 . . . . 
                        . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
                        . 1 1 1 4 4 4 4 4 4 4 4 1 1 1 . 
                        1 1 4 4 4 a a a a a a 4 4 4 1 1 
                        1 1 4 4 4 a a a a a a 4 4 4 1 1 
                        . 1 1 1 4 4 4 4 4 4 4 4 1 1 1 . 
                        . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
                        . . . . 1 1 1 1 1 1 1 1 . . . . 
                        . . . . . . . 8 8 . . . . . . . 
                        8 8 8 . . . . 8 8 . . . . 8 8 8 
                        . 8 8 8 . . . 8 8 . . . 8 8 8 . 
                        . 8 8 8 8 . . 8 8 . . 8 8 8 8 . 
                        . . 8 8 8 8 . 8 8 . 8 8 8 8 . . 
                        . . 8 8 8 8 . 8 8 . 8 8 8 8 . . 
                        . . . 8 8 8 8 8 8 8 8 8 8 . . . 
                        . . . . . . 8 8 8 8 . . . . . . 
                        `, SpriteKind.Food)
                    sprites.setDataString(powerUp, "type", "F")
                } else {
                    powerUp = sprites.create(img`
                        . . . . . . 4 4 4 4 . . . . . . 
                        . . . . . 4 4 4 4 e e . . . . . 
                        . . . . 4 4 4 4 e e e e . . . . 
                        . . . 4 4 4 4 4 e e e e e . . . 
                        . . 4 4 4 4 4 4 4 e e e 4 4 . . 
                        . 4 4 e e e 4 4 4 4 4 4 4 4 4 . 
                        . 4 e e e e e 4 4 4 4 4 4 4 4 . 
                        4 4 e e e e e 4 4 4 4 4 e e 4 4 
                        4 4 e e e e e 4 4 4 4 4 e e e 4 
                        4 4 4 e e e 4 4 4 4 4 4 4 e e 4 
                        4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 
                        . 4 e e e 1 1 1 1 1 1 e e e 4 . 
                        . . . . 1 1 1 1 1 1 1 1 . . . . 
                        . . . . 1 1 1 1 1 1 4 1 . . . . 
                        . . . . 1 1 1 1 1 1 4 1 . . . . 
                        . . . . . 1 1 1 1 4 1 . . . . . 
                        `, SpriteKind.Food)
                    sprites.setDataString(powerUp, "type", "M")
                }
                tiles.placeOnTile(powerUp, location)
                tiles.setTileAt(location.getNeighboringLocation(CollisionDirection.Top), assets.tile`transparency16`)
            } else if (QParticle.tileKindAt(TileDirection.Top, assets.tile`1upSpawner`)) {
                powerUp = sprites.create(img`
                    . . . . . . 4 4 4 4 . . . . . . 
                    . . . . . 4 4 4 4 8 8 . . . . . 
                    . . . . 4 4 4 4 8 8 8 8 . . . . 
                    . . . 4 4 4 4 4 8 8 8 8 8 . . . 
                    . . 4 4 4 4 4 4 4 8 8 8 4 4 . . 
                    . 4 4 8 8 8 4 4 4 4 4 4 4 4 4 . 
                    . 4 8 8 8 8 8 4 4 4 4 4 4 4 4 . 
                    4 4 8 8 8 8 8 4 4 4 4 4 8 8 4 4 
                    4 4 8 8 8 8 8 4 4 4 4 4 8 8 8 4 
                    4 4 4 8 8 8 4 4 4 4 4 4 4 8 8 4 
                    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 
                    . 4 8 8 8 1 1 1 1 1 1 8 8 8 4 . 
                    . . . . 1 1 1 1 1 1 1 1 . . . . 
                    . . . . 1 1 1 1 1 1 4 1 . . . . 
                    . . . . 1 1 1 1 1 1 4 1 . . . . 
                    . . . . . 1 1 1 1 4 1 . . . . . 
                    `, SpriteKind.Food)
                sprites.setDataString(powerUp, "type", "P")
                tiles.placeOnTile(powerUp, location)
                tiles.setTileAt(location.getNeighboringLocation(CollisionDirection.Top), assets.tile`transparency16`)
            } else {
                coins += 1
                music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.InBackground)
            }
        } else if (tiles.tileAtLocationEquals(location, assets.tile`brick`)) {
            if (sprites.readDataNumber(sprite, "power") == 0 || !(tiles.tileAtLocationEquals(location.getNeighboringLocation(CollisionDirection.Top), assets.tile`transparency16`))) {
                QParticle = sprites.create(img`
                    d d d d d d d d d d d d d d d d 
                    e e e e e e e f e e e e e e e f 
                    e e e e e e e f e e e e e e e f 
                    f f f f f f f f f f f f f f f f 
                    e e e f e e e e e e e f e e e e 
                    e e e f e e e e e e e f e e e e 
                    e e e f e e e e e e e f e e e e 
                    f f f f f f f f f f f f f f f f 
                    e e e e e e e f e e e e e e e f 
                    e e e e e e e f e e e e e e e f 
                    e e e e e e e f e e e e e e e f 
                    f f f f f f f f f f f f f f f f 
                    e e e f e e e e e e e f e e e e 
                    e e e f e e e e e e e f e e e e 
                    e e e f e e e e e e e f e e e e 
                    f f f f f f f f f f f f f f f f 
                    `, SpriteKind.Projectile)
                sprites.setDataNumber(QParticle, "yval", location.y)
                sprites.setDataNumber(QParticle, "yrow", location.row)
                sprites.setDataString(QParticle, "type", "B")
                tiles.setTileAt(location, assets.tile`transparency16`)
                tiles.placeOnTile(QParticle, location)
                if (QParticle.tileKindAt(TileDirection.Top, assets.tile`starSpawner`)) {
                    powerUp = sprites.create(img`
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        . . . . . . . . . . . . . . . . 
                        `, SpriteKind.Food)
                    sprites.setDataString(powerUp, "type", "S")
                    animation.runImageAnimation(
                    powerUp,
                    [img`
                        . . . . . . . c c . . . . . . . 
                        . . . . . . . c c . . . . . . . 
                        . . . . . . c c c c . . . . . . 
                        . . . . . . c c c c . . . . . . 
                        . . . . . c c c c c c . . . . . 
                        . c c c c c c c c c c c c c c . 
                        . c c c c c 2 c c 2 c c c c c . 
                        . . c c c c 2 c c 2 c c c c . . 
                        . . . c c c 2 c c 2 c c c . . . 
                        . . . . c c c c c c c c . . . . 
                        . . . . c c c c c c c c . . . . 
                        . . . c c c c c c c c c c . . . 
                        . . . c c c c c c c c c c . . . 
                        . . . c c c c . . c c c c . . . 
                        . . c c c . . . . . . c c c . . 
                        . . c c . . . . . . . . c c . . 
                        `,img`
                        . . . . . . . 4 4 . . . . . . . 
                        . . . . . . . 4 4 . . . . . . . 
                        . . . . . . 4 4 4 4 . . . . . . 
                        . . . . . . 4 4 4 4 . . . . . . 
                        . . . . . 4 4 4 4 4 4 . . . . . 
                        . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
                        . 4 4 4 4 4 8 4 4 8 4 4 4 4 4 . 
                        . . 4 4 4 4 8 4 4 8 4 4 4 4 . . 
                        . . . 4 4 4 8 4 4 8 4 4 4 . . . 
                        . . . . 4 4 4 4 4 4 4 4 . . . . 
                        . . . . 4 4 4 4 4 4 4 4 . . . . 
                        . . . 4 4 4 4 4 4 4 4 4 4 . . . 
                        . . . 4 4 4 4 4 4 4 4 4 4 . . . 
                        . . . 4 4 4 4 . . 4 4 4 4 . . . 
                        . . 4 4 4 . . . . . . 4 4 4 . . 
                        . . 4 4 . . . . . . . . 4 4 . . 
                        `,img`
                        . . . . . . . 4 4 . . . . . . . 
                        . . . . . . . 4 4 . . . . . . . 
                        . . . . . . 4 4 4 4 . . . . . . 
                        . . . . . . 4 4 4 4 . . . . . . 
                        . . . . . 4 4 4 4 4 4 . . . . . 
                        . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
                        . 4 4 4 4 4 a 4 4 a 4 4 4 4 4 . 
                        . . 4 4 4 4 a 4 4 a 4 4 4 4 . . 
                        . . . 4 4 4 a 4 4 a 4 4 4 . . . 
                        . . . . 4 4 4 4 4 4 4 4 . . . . 
                        . . . . 4 4 4 4 4 4 4 4 . . . . 
                        . . . 4 4 4 4 4 4 4 4 4 4 . . . 
                        . . . 4 4 4 4 4 4 4 4 4 4 . . . 
                        . . . 4 4 4 4 . . 4 4 4 4 . . . 
                        . . 4 4 4 . . . . . . 4 4 4 . . 
                        . . 4 4 . . . . . . . . 4 4 . . 
                        `,img`
                        . . . . . . . e e . . . . . . . 
                        . . . . . . . e e . . . . . . . 
                        . . . . . . e e e e . . . . . . 
                        . . . . . . e e e e . . . . . . 
                        . . . . . e e e e e e . . . . . 
                        . e e e e e e e e e e e e e e . 
                        . e e e e e f e e f e e e e e . 
                        . . e e e e f e e f e e e e . . 
                        . . . e e e f e e f e e e . . . 
                        . . . . e e e e e e e e . . . . 
                        . . . . e e e e e e e e . . . . 
                        . . . e e e e e e e e e e . . . 
                        . . . e e e e e e e e e e . . . 
                        . . . e e e e . . e e e e . . . 
                        . . e e e . . . . . . e e e . . 
                        . . e e . . . . . . . . e e . . 
                        `],
                    100,
                    true
                    )
                    tiles.placeOnTile(powerUp, location)
                    tiles.setTileAt(location.getNeighboringLocation(CollisionDirection.Top), assets.tile`transparency16`)
                }
            } else {
                tiles.setTileAt(location, assets.tile`transparency16`)
                tiles.setWallAt(location, false)
            }
        }
    }
})
}
function FlagPole() {
    game.onUpdate(function () {
        if (!(flagTimer)) {
            for (let value5 of tiles.getTilesByType(assets.tile`flagTop`)) {
                if (Player.x >= value5.left && Player.y >= value5.y) {
                    flagTimer = game.runtime()
                    Player.vx = 0
                    Player.ax = 0
                    Player.x = value5.left
                }
            }
        } else {
            if (game.runtime() - flagTimer < 500) {
                music.stopAllSounds()
                Player.ay = 0
                Player.vy = 0
                Player.ax = 0
                cantMove = true
            } else if (game.runtime() - flagTimer < 1500) {
                timer.throttle("flagsound", 5000, function () {
                    music.play(music.createSoundEffect(WaveShape.Square, 330, 687, 255, 255, 1000, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    music.play(music.createSoundEffect(WaveShape.Square, 330, 687, 255, 255, 1000, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    music.play(music.createSoundEffect(WaveShape.Square, 330, 687, 255, 255, 1000, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
                    Player.vy = 125
                })
            } else if (game.runtime() - flagTimer > 2000 && game.runtime() - flagTimer < 2500) {
                timer.throttle("flagmusic", 5000, function () {
                    Player.ax = 400
                    Player.ay = 600
                    music.stopAllSounds()
                    music.play(music.createSong(hex`0078000408030101001c000f05001202c102c20100040500280000006400280003140006020004ae0000000200010802000400010d04000600011106000800011408000a0001190a000c00011d0c001000012010001400012014001800011d18001a0001081a001c00010d1c001e0001111e002000011420002200011922002400011d24002800012028002c0001202c003000011d30003200010a32003400010f34003600011236003800011638003a00011b3a003c00011e3c0040000122400044000122440046000122460048000122480050000125`), music.PlaybackMode.InBackground)
                    timer.after(5500, function () {
                        game.setGameOverPlayable(true, music.melodyPlayable(music.baDing), false)
                        game.setGameOverScoringType(game.ScoringType.None)
                        info.setScore(coins)
                        game.gameOver(true)
                    })
                })
            } else if (Player.vx == 0 && Player.tileKindAt(TileDirection.Center, assets.tile`castleVoid`)) {
                mSpr.setFlag(SpriteFlag.Invisible, true)
                mSprBig.setFlag(SpriteFlag.Invisible, true)
            }
        }
    })
}

function die() {
    dead = true
    Player.setFlag(SpriteFlag.Ghost, true)
    music.stopAllSounds()
    Player.vy = 0
    Player.ay = 0
    music.play(music.createSoundEffect(WaveShape.Square, 642, 553, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    music.play(music.createSoundEffect(WaveShape.Square, 642, 553, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundEffect(WaveShape.Square, 330, 286, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    music.play(music.createSoundEffect(WaveShape.Square, 330, 286, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    music.play(music.createSoundEffect(WaveShape.Square, 642, 553, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    music.play(music.createSoundEffect(WaveShape.Square, 642, 553, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    timer.after(750, function () {
        Player.vy = -200
        Player.ay = 400
        music.play(music.createSong(assets.song`die`), music.PlaybackMode.InBackground)
        timer.after(2500, function () {
            game.reset()
        })
    })
}
function initiateBig() {
    characterAnimations.setCharacterAnimationsEnabled(mSprBig, false)
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        ................
        ................
        .......22222....
        .....2222224....
        ....22222244....
        ....22222222222.
        ....ccc44c444...
        ...c44c44cc4444.
        ...c44cc44444444
        ..cc44cc444c4444
        ..cc44444cccccc.
        ...cc44444ccccc.
        .....c44444444..
        ....c222444.....
        ...c2ccc2c......
        ..c22cccc2c.....
        ..c22ccccc2244..
        .cc22ccccccc4444
        .c2222cccccc4444
        .c2222ccccccc444
        ..22222cccccc444
        ..2222222ccc2...
        ..22222222222...
        ..2222222222c...
        cccc2222222c22..
        cccc22222cc222..
        cccc2222c2222...
        cccc222..2222...
        cccc.....cccc...
        cc.......cccc...
        c........cccccc.
        .........cccccc.
        `, img`
        ................
        ......22222.....
        ....2222224.....
        ...22222244.....
        ...22222222222..
        ...ccc44c444....
        ..c44c44cc4444..
        ..c44cc44444444.
        .cc44cc444c4444.
        .cc44444cccccc..
        .ccc44444ccccc..
        ...cc44444444...
        ....222244......
        ...c2cc22.......
        ..c2cccc22......
        ..c2cccc22......
        ..c2cccc222.....
        ..c2ccccc44.....
        ..c2cccc4444....
        ..22cccc44442...
        ..222ccc444422..
        ..2222cc444222..
        ..222222cc2222..
        ...22222ccc22...
        ....222cccccc...
        ....22cccccc....
        .....22cccc.....
        .....c222ccc....
        .....cccc.cc....
        ....ccccc.......
        ....ccccccc.....
        ......ccccc.....
        `, img`
        ......22222.....
        ....2222224.....
        ...22222244.....
        ...22222222222..
        ...ccc44c444....
        ..c44c44cc4444..
        ..c44cc44444444.
        .cc44cc444c4444.
        .cc44444cccccc..
        ..cc44444ccccc..
        ...cc44444444...
        .....ccc44......
        ....2222cc2...4.
        ...cccc22cc2.444
        ..cccccc22c2c444
        .ccccccc22cc2444
        .ccccccc22cc2c4c
        .cccccc222cc2cc.
        cccccc22242c4c..
        cccc222222222...
        4444422222222...
        4444422222222..c
        4444222222222.cc
        .4442222222ccccc
        ...2c222222ccccc
        ..c22c22222ccccc
        ccc222cc222ccccc
        cccc2222...ccccc
        ccccc2..........
        .ccc............
        .ccc............
        ..ccc...........
        `],
        100,
        characterAnimations.rule(Predicate.MovingRight, Predicate.FacingRight)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        ......22222.....
        ....2222224.....
        ...22222244.....
        ...22222222222..
        ...ccc44c444....
        ..c44c44cc4444..
        ..c44cc44444444.
        .cc44cc444c4444.
        .cc44444cccccc..
        .ccc44444ccccc..
        ...cc44444444...
        ....c44444c.....
        ....c2cccc2c....
        ...cc2cccc2cc...
        ..ccc2cccc2ccc..
        .cccc2cccc2cccc.
        .ccc22cccc22ccc.
        cccc22cccc22cccc
        cccc22222222cccc
        cccc24222242cccc
        4444222222224444
        4444222222224444
        .44422222222444.
        .44222222222244.
        ..222222222222..
        .222222..222222.
        .22222....22222.
        .22222....22222.
        ..cccc....cccc..
        ..cccc....cccc..
        cccccc....cccccc
        cccccc....cccccc
        `],
        500,
        characterAnimations.rule(Predicate.FacingRight, Predicate.NotMoving)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        ................
        ................
        ....22222.......
        ....4222222.....
        ....44222222....
        .22222222222....
        ...444c44ccc....
        .4444cc44c44c...
        44444444cc44c...
        4444c444cc44cc..
        .cccccc44444cc..
        .ccccc44444cc...
        ..44444444c.....
        .....444222c....
        ......c2ccc2c...
        .....c2cccc22c..
        ..4422ccccc22c..
        4444ccccccc22cc.
        4444cccccc2222c.
        444ccccccc2222c.
        444cccccc22222..
        ...2ccc2222222..
        ...22222222222..
        ...c2222222222..
        ..22c2222222cccc
        ..222cc22222cccc
        ...2222c2222cccc
        ...2222..222cccc
        ...cccc.....cccc
        ...cccc.......cc
        .cccccc........c
        .cccccc.........
        `, img`
        ................
        .....22222......
        .....4222222....
        .....44222222...
        ..22222222222...
        ....444c44ccc...
        ..4444cc44c44c..
        .44444444cc44c..
        .4444c444cc44cc.
        ..cccccc44444cc.
        ..ccccc44444ccc.
        ...44444444cc...
        ......442222....
        .......22cc2c...
        ......22cccc2c..
        ......22cccc2c..
        .....222cccc2c..
        .....44ccccc2c..
        ....4444cccc2c..
        ...24444cccc22..
        ..224444ccc222..
        ..222444cc2222..
        ..2222cc222222..
        ...22ccc22222...
        ...cccccc222....
        ....cccccc22....
        .....cccc22.....
        ....ccc222c.....
        ....cc.cccc.....
        .......ccccc....
        .....ccccccc....
        .....ccccc......
        `, img`
        .....22222......
        .....4222222....
        .....44222222...
        ..22222222222...
        ....444c44ccc...
        ..4444cc44c44c..
        .44444444cc44c..
        .4444c444cc44cc.
        ..cccccc44444cc.
        ..ccccc44444cc..
        ...44444444cc...
        ......44ccc.....
        .4...2cc2222....
        444.2cc22cccc...
        444c2c22cccccc..
        4442cc22ccccccc.
        c4c2cc22ccccccc.
        .cc2cc222cccccc.
        ..c4c24222cccccc
        ...222222222cccc
        ...2222222244444
        c..2222222244444
        cc.2222222224444
        ccccc2222222444.
        ccccc222222c2...
        ccccc22222c22c..
        ccccc222cc222ccc
        ccccc...2222cccc
        ..........2ccccc
        ............ccc.
        ............ccc.
        ...........ccc..
        `],
        100,
        characterAnimations.rule(Predicate.MovingLeft, Predicate.FacingLeft)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        .....22222......
        .....4222222....
        .....44222222...
        ..22222222222...
        ....444c44ccc...
        ..4444cc44c44c..
        .44444444cc44c..
        .4444c444cc44cc.
        ..cccccc44444cc.
        ..ccccc44444ccc.
        ...44444444cc...
        .....c44444c....
        ....c2cccc2c....
        ...cc2cccc2cc...
        ..ccc2cccc2ccc..
        .cccc2cccc2cccc.
        .ccc22cccc22ccc.
        cccc22cccc22cccc
        cccc22222222cccc
        cccc24222242cccc
        4444222222224444
        4444222222224444
        .44422222222444.
        .44222222222244.
        ..222222222222..
        .222222..222222.
        .22222....22222.
        .22222....22222.
        ..cccc....cccc..
        ..cccc....cccc..
        cccccc....cccccc
        cccccc....cccccc
        `],
        500,
        characterAnimations.rule(Predicate.FacingLeft, Predicate.NotMoving)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        ............444.
        ...........44c44
        ......2222244cc4
        ....222222244444
        ...22222222ccccc
        ...22222222222cc
        ...ccc44c444cccc
        ..c44c44c44444cc
        ..c44cc44444444c
        ..c44cc444c4444c
        .cc44444ccccccc.
        .cccc4444cccc4c.
        ...cc44444444cc.
        ....2222cc2cccc.
        .cccccc22c2ccc..
        cccccccc2cc2cc..
        cccccccc22c2c...
        cc44cccc22cc2...
        c4444cc2222c4...
        44444c2224222...
        4444422222222...
        4.44222222222..c
        .442222222222.cc
        ...222222222cccc
        ...c22222222cccc
        ccc2cc222222cccc
        ccc222cc2222cccc
        ccc22222..22cccc
        ccc22222........
        ccc2222.........
        cc..............
        c...............
        `],
        500,
        characterAnimations.rule(Predicate.FacingRight, Predicate.MovingUp)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        .444............
        44c44...........
        4cc4422222......
        444442222222....
        ccccc22222222...
        cc22222222222...
        cccc444c44ccc...
        cc44444c44c44c..
        c44444444cc44c..
        c4444c444cc44c..
        .ccccccc44444cc.
        .c4cccc4444cccc.
        .cc44444444cc...
        .cccc2cc2222....
        ..ccc2c22cccccc.
        ..cc2cc2cccccccc
        ...c2c22cccccccc
        ...2cc22cccc44cc
        ...4c2222cc4444c
        ...2224222c44444
        ...2222222244444
        c..22222222244.4
        cc.222222222244.
        cccc222222222...
        cccc22222222c...
        cccc222222cc2ccc
        cccc2222cc222ccc
        cccc22..22222ccc
        ........22222ccc
        .........2222ccc
        ..............cc
        ...............c
        `],
        500,
        characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingUp)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        ......2222222...
        ..cc222222244...
        .ccc22222224....
        .44cc44c222222..
        4444c44c44c4422.
        4444c44c44cc4...
        44c42444c444444.
        4c4c2244444c4444
        44c22cc44cccc444
        ...2ccc4444cccc.
        ..22ccccc44444..
        ..2cc444cc222cc.
        ..2c44444222ccc.
        ..2c44444cc2ccc.
        ....44444ccccccc
        ..2224c44ccccccc
        ..222244cccccccc
        ..2222222ccccccc
        ...2222222cccccc
        ....ccc22222ccc.
        .....ccccc22222.
        ..cccccccc22222.
        ..c4444cccc222..
        ..c444444cc2....
        ....222244c.....
        c..2222222......
        cc..c2222.......
        ccccccc22.......
        .ccccccc........
        ..cccccc........
        ...cccc.........
        ....ccc.........
        `],
        500,
        characterAnimations.rule(Predicate.FacingRight, Predicate.MovingDown)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        ...2222222......
        ...442222222cc..
        ....42222222ccc.
        ..222222c44cc44.
        .2244c44c44c4444
        ...4cc44c44c4444
        .444444c44424c44
        4444c4444422c4c4
        444cccc44cc22c44
        .cccc4444ccc2...
        ..44444ccccc22..
        .cc222cc444cc2..
        .ccc22244444c2..
        .ccc2cc44444c2..
        ccccccc44444....
        ccccccc44c4222..
        cccccccc442222..
        ccccccc2222222..
        cccccc2222222...
        .ccc22222ccc....
        .22222ccccc.....
        .22222cccccccc..
        ..222cccc4444c..
        ....2cc444444c..
        .....c442222....
        ......2222222..c
        .......2222c..cc
        .......22ccccccc
        ........ccccccc.
        ........cccccc..
        .........cccc...
        .........ccc....
        `],
        500,
        characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingDown)
    )
    characterAnimations.loopFrames(
        mSprBig,
        [img`
        . . . . . . 2 2 2 2 . . . . . . 
        . . . 4 . 2 2 2 2 2 2 . 4 . . . 
        . 4 4 4 c 4 c 4 4 c 4 c 4 4 4 . 
        . 4 4 c c 4 c 4 4 c 4 c c 4 4 . 
        . 4 4 c c c 4 4 4 4 c c c 4 4 . 
        . . . c c c c 4 4 c c c c . . . 
        . . . . c 4 c c c c 4 c . . . . 
        . . . . c 4 4 4 4 4 4 c . . . . 
        . . . 2 2 2 4 4 4 4 2 2 2 . . . 
        . . c c 2 2 c c c c 2 2 c c . . 
        . . c c c 2 2 c c 2 2 c c c . . 
        . . c c c 2 4 2 2 4 2 c c c . . 
        . . c c c 2 2 2 2 2 2 c c c . . 
        . . . c c 2 2 2 2 2 2 c c . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `],
        500,
        characterAnimations.rule(Predicate.HittingWallDown, Predicate.MovingUp)
    )
}
function initiateSmall() {
    characterAnimations.setCharacterAnimationsEnabled(mSpr, false)
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . 2 2 2 2 2 . . . . . . 
        . . . . 2 2 2 2 2 2 2 2 2 . . . 
        . . . . c c c 4 4 c 4 . . . . . 
        . . . c 4 c 4 4 4 c 4 4 4 . . . 
        . . . c 4 c c 4 4 4 c 4 4 4 . . 
        . . . c c 4 4 4 4 c c c c . . . 
        . . . . . 4 4 4 4 4 4 4 . . . . 
        . . c c c c 2 2 c c . . . . . . 
        4 4 c c c c 2 2 2 c c c 4 4 4 . 
        4 4 4 . c c 2 4 2 2 2 c c 4 4 . 
        4 4 . . 2 2 2 2 2 2 2 . . c . . 
        . . . 2 2 2 2 2 2 2 2 2 c c . . 
        . . 2 2 2 2 2 2 2 2 2 2 c c . . 
        . c c 2 2 2 . . . 2 2 2 c c . . 
        . c c c . . . . . . . . . . . . 
        . . c c c . . . . . . . . . . . 
        `, img`
        . . . . . 2 2 2 2 2 . . . . . . 
        . . . . 2 2 2 2 2 2 2 2 2 . . . 
        . . . . c c c 4 4 c 4 . . . . . 
        . . . c 4 c 4 4 4 c 4 4 4 . . . 
        . . . c 4 c c 4 4 4 c 4 4 4 . . 
        . . . c c 4 4 4 4 c c c c . . . 
        . . . . . 4 4 4 4 4 4 4 . . . . 
        . . . . c c 2 c c c . . . . . . 
        . . . c c c c 2 2 c c . . . . . 
        . . . c c c 2 2 4 2 2 4 . . . . 
        . . . c c c c 2 2 2 2 2 . . . . 
        . . . 2 c c 4 4 4 2 2 2 . . . . 
        . . . . 2 c 4 4 2 2 2 . . . . . 
        . . . . . 2 2 2 c c c . . . . . 
        . . . . . c c c c c c c . . . . 
        . . . . . c c c c . . . . . . . 
        `, img`
        . . . . . . . . . . . . . . . . 
        . . . . . . 2 2 2 2 2 . . . . . 
        . . . . . 2 2 2 2 2 2 2 2 2 . . 
        . . . . . c c c 4 4 c 4 . . . . 
        . . . . c 4 c 4 4 4 c 4 4 4 . . 
        . . . . c 4 c c 4 4 4 c 4 4 4 . 
        . . . . c c 4 4 4 4 c c c c . . 
        . . . . . . 4 4 4 4 4 4 4 . . . 
        . . . . . c c c c 2 c . 4 . . . 
        . . . . 4 c c c c c c 4 4 4 . . 
        . . . 4 4 2 c c c c c 4 4 . . . 
        . . . c c 2 2 2 2 2 2 2 . . . . 
        . . . c 2 2 2 2 2 2 2 2 . . . . 
        . . c c 2 2 2 . 2 2 2 . . . . . 
        . . c . . . . c c c . . . . . . 
        . . . . . . . c c c c . . . . . 
        `],
        100,
        characterAnimations.rule(Predicate.MovingRight, Predicate.FacingRight)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . 2 2 2 2 2 . . . . . . 
        . . . . 2 2 2 2 2 2 2 2 2 . . . 
        . . . . c c c 4 4 c 4 . . . . . 
        . . . c 4 c 4 4 4 c 4 4 4 . . . 
        . . . c 4 c c 4 4 4 c 4 4 4 . . 
        . . . c c 4 4 4 4 c c c c . . . 
        . . . . . 4 4 4 4 4 4 4 . . . . 
        . . . . c c 2 c c c . . . . . . 
        . . . c c c 2 c c 2 c c c . . . 
        . . c c c c 2 2 2 2 c c c c . . 
        . . 4 4 c 2 4 2 2 4 2 c 4 4 . . 
        . . 4 4 4 2 2 2 2 2 2 4 4 4 . . 
        . . 4 4 2 2 2 2 2 2 2 2 4 4 . . 
        . . . . 2 2 2 . . 2 2 2 . . . . 
        . . . c c c . . . . c c c . . . 
        . . c c c c . . . . c c c c . . 
        `],
        500,
        characterAnimations.rule(Predicate.FacingRight, Predicate.NotMoving)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . . 2 2 2 2 2 . . . . . 
        . . . 2 2 2 2 2 2 2 2 2 . . . . 
        . . . . . 4 c 4 4 c c c . . . . 
        . . . 4 4 4 c 4 4 4 c 4 c . . . 
        . . 4 4 4 c 4 4 4 c c 4 c . . . 
        . . . c c c c 4 4 4 4 c c . . . 
        . . . . 4 4 4 4 4 4 4 . . . . . 
        . . . . . . c c 2 2 c c c c . . 
        . 4 4 4 c c c 2 2 2 c c c c 4 4 
        . 4 4 c c 2 2 2 4 2 c c . 4 4 4 
        . . c . . 2 2 2 2 2 2 2 . . 4 4 
        . . c c 2 2 2 2 2 2 2 2 2 . . . 
        . . c c 2 2 2 2 2 2 2 2 2 2 . . 
        . . c c 2 2 2 . . . 2 2 2 c c . 
        . . . . . . . . . . . . c c c . 
        . . . . . . . . . . . c c c . . 
        `, img`
        . . . . . . 2 2 2 2 2 . . . . . 
        . . . 2 2 2 2 2 2 2 2 2 . . . . 
        . . . . . 4 c 4 4 c c c . . . . 
        . . . 4 4 4 c 4 4 4 c 4 c . . . 
        . . 4 4 4 c 4 4 4 c c 4 c . . . 
        . . . c c c c 4 4 4 4 c c . . . 
        . . . . 4 4 4 4 4 4 4 . . . . . 
        . . . . . . c c c 2 c c . . . . 
        . . . . . c c 2 2 c c c c . . . 
        . . . . 4 2 2 4 2 2 c c c . . . 
        . . . . 2 2 2 2 2 c c c c . . . 
        . . . . 2 2 2 4 4 4 c c 2 . . . 
        . . . . . 2 2 2 4 4 c 2 . . . . 
        . . . . . c c c 2 2 2 . . . . . 
        . . . . c c c c c c c . . . . . 
        . . . . . . . c c c c . . . . . 
        `, img`
        . . . . . . . . . . . . . . . . 
        . . . . . 2 2 2 2 2 . . . . . . 
        . . 2 2 2 2 2 2 2 2 2 . . . . . 
        . . . . 4 c 4 4 c c c . . . . . 
        . . 4 4 4 c 4 4 4 c 4 c . . . . 
        . 4 4 4 c 4 4 4 c c 4 c . . . . 
        . . c c c c 4 4 4 4 c c . . . . 
        . . . 4 4 4 4 4 4 4 . . . . . . 
        . . . 4 . c 2 c c c c . . . . . 
        . . 4 4 4 c c c c c c 4 . . . . 
        . . . 4 4 c c c c c 2 4 4 . . . 
        . . . . 2 2 2 2 2 2 2 c c . . . 
        . . . . 2 2 2 2 2 2 2 2 c . . . 
        . . . . . 2 2 2 . 2 2 2 c c . . 
        . . . . . . c c c . . . . c . . 
        . . . . . c c c c . . . . . . . 
        `],
        100,
        characterAnimations.rule(Predicate.MovingLeft, Predicate.FacingLeft)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . . 2 2 2 2 2 . . . . . 
        . . . 2 2 2 2 2 2 2 2 2 . . . . 
        . . . . . 4 c 4 4 c c c . . . . 
        . . . 4 4 4 c 4 4 4 c 4 c . . . 
        . . 4 4 4 c 4 4 4 c c 4 c . . . 
        . . . c c c c 4 4 4 4 c c . . . 
        . . . . 4 4 4 4 4 4 4 . . . . . 
        . . . . . . c c c 2 c c . . . . 
        . . . c c c 2 c c 2 c c c . . . 
        . . c c c c 2 2 2 2 c c c c . . 
        . . 4 4 c 2 4 2 2 4 2 c 4 4 . . 
        . . 4 4 4 2 2 2 2 2 2 4 4 4 . . 
        . . 4 4 2 2 2 2 2 2 2 2 4 4 . . 
        . . . . 2 2 2 . . 2 2 2 . . . . 
        . . . c c c . . . . c c c . . . 
        . . c c c c . . . . c c c c . . 
        `],
        500,
        characterAnimations.rule(Predicate.FacingLeft, Predicate.NotMoving)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . . . . . . . . . 4 4 4 
        . . . . . . 2 2 2 2 2 . . 4 4 4 
        . . . . . 2 2 2 2 2 2 2 2 2 4 4 
        . . . . . c c c 4 4 c 4 . c c c 
        . . . . c 4 c 4 4 4 c 4 4 c c c 
        . . . . c 4 c c 4 4 4 c 4 4 4 c 
        . . . . c c 4 4 4 4 c c c c c . 
        . . . . . . 4 4 4 4 4 4 4 c . . 
        . . c c c c c 2 c c c 2 c . . . 
        . c c c c c c c 2 c c c 2 . . c 
        4 4 c c c c c c 2 2 2 2 2 . . c 
        4 4 4 . 2 2 c 2 2 4 2 2 4 2 c c 
        . 4 . c 2 2 2 2 2 2 2 2 2 2 c c 
        . . c c c 2 2 2 2 2 2 2 2 2 c c 
        . c c c 2 2 2 2 2 2 2 . . . . . 
        . c . . 2 2 2 2 . . . . . . . . 
        `],
        500,
        characterAnimations.rule(Predicate.FacingRight, Predicate.MovingUp)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        4 4 4 . . . . . . . . . . . . . 
        4 4 4 . . 2 2 2 2 2 . . . . . . 
        4 4 2 2 2 2 2 2 2 2 2 . . . . . 
        c c c . 4 c 4 4 c c c . . . . . 
        c c c 4 4 c 4 4 4 c 4 c . . . . 
        c 4 4 4 c 4 4 4 c c 4 c . . . . 
        . c c c c c 4 4 4 4 c c . . . . 
        . . c 4 4 4 4 4 4 4 . . . . . . 
        . . . c 2 c c c 2 c c c c c . . 
        c . . 2 c c c 2 c c c c c c c . 
        c . . 2 2 2 2 2 c c c c c c 4 4 
        c c 2 4 2 2 4 2 2 c 2 2 . 4 4 4 
        c c 2 2 2 2 2 2 2 2 2 2 c . 4 . 
        c c 2 2 2 2 2 2 2 2 2 c c c . . 
        . . . . . 2 2 2 2 2 2 2 c c c . 
        . . . . . . . . 2 2 2 2 . . c . 
        `],
        500,
        characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingUp)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . 2 2 2 2 2 . . . . . . 
        . . . c 2 2 2 2 2 2 2 2 . . . . 
        . . c c c c c c 4 c 4 . . . . . 
        . 4 4 c 4 4 c 4 4 4 4 4 4 . . . 
        . 4 4 c 4 4 c c 4 4 c c 4 4 . . 
        . . 4 4 c 4 4 4 4 4 4 c c . . . 
        . . . 2 2 2 c c c 2 4 4 . . . . 
        . . 2 2 4 4 4 c 2 2 c c c . . . 
        . . 2 c 4 4 4 c c c c c c . . . 
        . . 2 2 2 4 4 c c c c c c . . . 
        . . . 2 2 2 2 2 c c c c . . . . 
        . . . 2 c c c 2 2 2 2 . . . . . 
        . . . . c c c c 2 2 2 . . . . . 
        . c . c 2 2 c c c 2 . . . . . . 
        . c c c c c 2 . . . . . . . . . 
        . . c c c c . . . . . . . . . . 
        `],
        500,
        characterAnimations.rule(Predicate.FacingRight, Predicate.MovingDown)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . . 2 2 2 2 2 . . . . . 
        . . . . 2 2 2 2 2 2 2 2 c . . . 
        . . . . . 4 c 4 c c c c c c . . 
        . . . 4 4 4 4 4 4 c 4 4 c 4 4 . 
        . . 4 4 c c 4 4 c c 4 4 c 4 4 . 
        . . . c c 4 4 4 4 4 4 c 4 4 . . 
        . . . . 4 4 2 c c c 2 2 2 . . . 
        . . . c c c 2 2 c 4 4 4 2 2 . . 
        . . . c c c c c c 4 4 4 c 2 . . 
        . . . c c c c c c 4 4 2 2 2 . . 
        . . . . c c c c 2 2 2 2 2 . . . 
        . . . . . 2 2 2 2 c c c 2 . . . 
        . . . . . 2 2 2 c c c c . . . . 
        . . . . . . 2 c c c 2 2 c . c . 
        . . . . . . . . . 2 c c c c c . 
        . . . . . . . . . . c c c c . . 
        `],
        500,
        characterAnimations.rule(Predicate.FacingLeft, Predicate.MovingDown)
    )
    characterAnimations.loopFrames(
        mSpr,
        [img`
        . . . . . . 2 2 2 2 . . . . . . 
        . . . 4 . 2 2 2 2 2 2 . 4 . . . 
        . 4 4 4 c 4 c 4 4 c 4 c 4 4 4 . 
        . 4 4 c c 4 c 4 4 c 4 c c 4 4 . 
        . 4 4 c c c 4 4 4 4 c c c 4 4 . 
        . . . c c c c 4 4 c c c c . . . 
        . . . . c 4 c c c c 4 c . . . . 
        . . . . c 4 4 4 4 4 4 c . . . . 
        . . . 2 2 2 4 4 4 4 2 2 2 . . . 
        . . c c 2 2 c c c c 2 2 c c . . 
        . . c c c 2 2 c c 2 2 c c c . . 
        . . c c c 2 4 2 2 4 2 c c c . . 
        . . c c c 2 2 2 2 2 2 c c c . . 
        . . . c c 2 2 2 2 2 2 c c . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `],
        500,
        characterAnimations.rule(Predicate.HittingWallDown, Predicate.MovingUp)
    )
}
function BlackHole() {
    game.onUpdate(function () {
        if (Player.y > tiles.getTileLocation(0, 15).bottom && !(dead)) {
            timer.background(function () {
                die()
            })
        }
    })
}

// Animations
function setupAnimations() {
    animation.runImageAnimation(enemy1, [assets.image`Enemy`, assets.image`Enemy0`], 150, true)
}

// Main
scene.setTileMapLevel(assets.tilemap`level1`)
spawnPlayer()
spawnEnemies()
spawnFoods()
powerUpBlock()
setupAnimations()
jumpHandler()
FlagPole()
BlackHole()
initiateSmall()
initiateBig()

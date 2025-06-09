namespace SpriteKind {
    export const Block = SpriteKind.create()
}
// Constants
const GRAVITY = 900
const JUMP_SPEED = -350
const ENEMY_SPEED = 75
const FOOD_BOUNCE_SPEED = 75

// Globals
let Player: Sprite = null
let canDoubleJump = false
let isLevel2 = false



// Classes
class EnemySprite extends sprites.ExtendableSprite {
    hp: number
    wasStompedRecently: boolean

    constructor(img: Image, vx: number) {
        super(img, SpriteKind.Enemy)
        this.hp = 1
        this.vx = vx
        this.ay = 0
        this.wasStompedRecently = false
    }

    hit() {
        this.hp -= 1
        if (this.hp <= 0) {
            this.destroy(effects.confetti, 500)
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
    Player = sprites.create(assets.image`Player`, SpriteKind.Player)
    Player.ay = GRAVITY
    scene.cameraFollowSprite(Player)
    scene.setBackgroundColor(6)
    controller.moveSprite(Player, 100, 0)
    let placeholder = tiles.getTilesByType(sprites.dungeon.collectibleInsignia)
    tiles.placeOnTile(Player, placeholder[0])
    let ph = tiles.getTilesByType(sprites.dungeon.collectibleBlueCrystal)
    scene.onOverlapTile(SpriteKind.Player, sprites.dungeon.collectibleBlueCrystal, function (sprite, tile) {
        switchTilemap()
    })
}

function jumpHandler() {
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        if (Player.isHittingTile(CollisionDirection.Bottom)) {
            Player.vy = JUMP_SPEED
            canDoubleJump = true
        } else if (canDoubleJump) {
            Player.vy = JUMP_SPEED
            canDoubleJump = false
        }
    })
}

function spawnEnemies() {
    let enemy1 = new EnemySprite(assets.image`Enemy`, ENEMY_SPEED)
    tiles.placeOnTile(enemy1, tiles.getTilesByType(assets.tile`enemyTile`)[0])

    let enemy2 = new EnemySprite(assets.image`Enemy2`, -ENEMY_SPEED)
    tiles.placeOnTile(enemy2, tiles.getTilesByType(assets.tile`enemyTile`)[1])

    game.onUpdate(function () {
        for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
            if (e.isHittingTile(CollisionDirection.Right)) e.vx = -ENEMY_SPEED
            else if (e.isHittingTile(CollisionDirection.Left)) e.vx = ENEMY_SPEED
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
                    game.over(false)
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
    for (let tile of tiles.getTilesByType(assets.tile`question`)) {
        let block = sprites.create(assets.image`QuestionSprite`, SpriteKind.Block)
        tiles.placeOnTile(block, tile)
        block.setFlag(SpriteFlag.Ghost, false)
    }

    sprites.onOverlap(SpriteKind.Player, SpriteKind.Block, function (player, block) {
        if (player.y < block.y && player.vy < 0) {
            let tileLoc = block.tilemapLocation()
            block.destroy(effects.confetti)
            tiles.setTileAt(tileLoc, assets.tile`empty`)
            tiles.setWallAt(tileLoc, true)
            player.ay = 10000
            pause(500)
            player.ay = GRAVITY
        }
    })
}

function switchTilemap() {
    isLevel2 = !isLevel2
    if (isLevel2) {
        scene.setTileMapLevel(assets.tilemap`level2`)
    } else {
        scene.setTileMapLevel(assets.tilemap`level1`)
    }
    spawnPlayer()
    spawnEnemies()
    spawnFoods()
    powerUpBlock()
}

// Animations
function setupAnimations() {
    animation.runImageAnimation(Player, [assets.image`Player`, assets.image`Player2`, assets.image`Player3`], 200, true)
}

// Main
scene.setTileMapLevel(assets.tilemap`level1`)
spawnPlayer()
spawnEnemies()
spawnFoods()
powerUpBlock()
setupAnimations()
jumpHandler()

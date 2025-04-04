namespace SpriteKind{
    export const Moving_Enemies = SpriteKind.create()
    export const Fruit = SpriteKind.create()
}
// #1
// #2
// Global variables
let heroSprite: Sprite = null
let projectile: Sprite = null
let enemySprite: Sprite = null
let projnum: number = null
let laser: Sprite = null
let laser2: Sprite = null
let laser3: Sprite = null
let fruit: Sprite = null
let i: number = null
let aliens: Sprite[] = []
let out_of_screen: boolean = null
// #1
// #2
// Functions
// #3
function createHeroSprite(): void {
    heroSprite = sprites.create(assets.image`myImage`, SpriteKind.Player)
    heroSprite.y = 110
    controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
        heroSprite.vx = -100
    })
    controller.left.onEvent(ControllerButtonEvent.Released, function() {
        heroSprite.vx = 0
    })
    controller.right.onEvent(ControllerButtonEvent.Pressed, function() {
        heroSprite.vx = 100
    })
    controller.right.onEvent(ControllerButtonEvent.Released, function() {
        heroSprite.vx = 0
    })


    heroSprite.setFlag(SpriteFlag.StayInScreen, true)
}
// #6
// #10
function createEnemySprites(rows: number, columns: number): void {
    for (let i = 8; i < ((rows * 16) + 8); i += 16) {
        for (let j = 8; j < ((columns * 16) + 8); j += 16) {
            let myAlien = (sprites.create(assets.image`myImage1`, SpriteKind.Moving_Enemies))
            // #9
            myAlien.x = j;
            myAlien.y = i;
            // #10
            myAlien.setVelocity(10, 0)
            // #11
            aliens.push(myAlien)
            // #12
            game.onUpdate(function () {
                out_of_screen = false
                for (let h = 0; h < aliens.length; h++) {
                    // #14
                    if (aliens[h].x > 160) {
                        out_of_screen = true
                        myAlien.setVelocity(-10, 0)
                    } else if (aliens[h].x < 0) {
                        out_of_screen = true
                        myAlien.setVelocity(10, 0)
                    } else {
                        out_of_screen = false
                    }
                    // #15
                    if (out_of_screen == true) {
                        myAlien.y += 0.5
                    }
                }
            })
        }
    }
}
// #4
function createLasersSprites(): void {
    controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
        projnum = randint(1, 3)
        if (projnum == 1){
            laser = sprites.create(assets.image`myImage0`,SpriteKind.Projectile)
            laser.setFlag(SpriteFlag.AutoDestroy, true)
            laser.x = heroSprite.x
            laser.y = heroSprite.y
            laser.vy = -60
        }
        else if (projnum == 2) {
            laser2 = sprites.create(assets.image`myImage0`, SpriteKind.Projectile)
            laser2.setFlag(SpriteFlag.AutoDestroy, true)
            laser2.x = heroSprite.x
            laser2.y = heroSprite.y
            laser2.vy = -30
            laser2.vx = randint(1,160)
        }
        else if (projnum == 3) {
            laser3 = sprites.create(assets.image`myImage0`, SpriteKind.Projectile)
            laser3.setFlag(SpriteFlag.AutoDestroy, true)
            laser3.x = heroSprite.x
            laser3.y = heroSprite.y
            laser3.vy = -30
            laser3.vx = randint(-160, -1)
        } 
    })
}
function createOverlap(): void {
    sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Moving_Enemies, function(sprite: Sprite, otherSprite: Sprite) {
        sprites.destroy(otherSprite)
        sprites.destroy(sprite)
        info.changeScoreBy(50)
    })
    
    sprites.onOverlap(SpriteKind.Moving_Enemies, SpriteKind.Player, function(sprite: Sprite, otherSprite: Sprite) {
        game.gameOver(false)
    })
    sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Fruit, function (sprite: Sprite, otherSprite: Sprite) {
        sprites.destroy(otherSprite)
        info.changeScoreBy(calculateScore(fruit))
    })
}
// #7
// #8
// #9
function calculateScore(Fruit: Sprite): number {
    return Math.sqrt((fruit.x - heroSprite.x) ** 2 + (fruit.y - heroSprite.y) ** 2)
}
// #5
function dropFruit(): void {
        fruit = sprites.create(assets.image`myImage2`, SpriteKind.Fruit)
        fruit.x = randint(8, 144)
        fruit.y = 8
        fruit.vy = 25
        pause(randint(1000, 5000))
        dropFruit()
    
}
// #1
// #2
// on start
// #11
createHeroSprite()
createEnemySprites(randint(1, 4), randint(1, 9))
createLasersSprites()
createOverlap()
dropFruit()

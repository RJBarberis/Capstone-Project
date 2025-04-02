// Global variables
let heroSprite: Sprite = null
let projectile: Sprite = null
let enemySprite: Sprite = null
// Functions
function createHeroSprite(): void {
    heroSprite = sprites.create(assets.image`myImage`, SpriteKind.Player)
    controller.moveSprite(heroSprite)
    projectile = sprites.create(assets.image`myImage0`, SpriteKind.Projectile)
    if (controller.A.isPressed()) {
        projectile.x = heroSprite.x
        projectile.y = heroSprite.y
        projectile.vy = 50
    }
}
// on start
createHeroSprite()

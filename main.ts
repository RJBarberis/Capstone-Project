// Global variables
let heroSprite: Sprite = null
let projectile: Sprite = null
// Functions
function createHeroSprite(): void {
    heroSprite = sprites.create(img``, SpriteKind.Player)
    controller.moveSprite(heroSprite)
    projectile = sprites.create(img``, SpriteKind.Projectile)
}
// on start
createHeroSprite()

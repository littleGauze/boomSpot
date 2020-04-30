const { ccclass, property } = cc._decorator

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    score: cc.Label = null

    @property(cc.Node)
    player: cc.Node = null

    @property(cc.Node)
    enemy: cc.Node = null

    @property(cc.Node)
    boom: cc.Node = null

    isFire: boolean = false

    playerAction: cc.Action = null
    enemyAction: cc.Action = null

    scoreCounter: number = 0

    onLoad() {
        this.placePlayer()
        this.placeEnemy()

        this.node.on('touchstart', this.fire, this)
    }

    onDestroy() {
        this.node.off('touchstart', this.fire, this)
    }

    placePlayer(): void {
        this.player.active = true
        this.player.y = -cc.winSize.height / 4

        // falling down
        const duration = 10
        const bY: number = -cc.winSize.height / 2 + 80
        const down: cc.ActionInterval = cc.sequence(
            cc.moveTo(duration, cc.v2(0, bY)),
            cc.callFunc(this.die, this)
        )
        this.player.runAction(down)
    }

    placeEnemy(): void {
        this.enemy.active = true
        this.enemy.x = 0
        this.enemy.y = cc.winSize.height / 3

        const x: number = cc.winSize.width / 2 - this.enemy.width / 2
        const y: number = Math.random() * cc.winSize.height / 4
        const duration: number = 0.6 + Math.random() + 0.5

        const seq: cc.ActionInterval = cc.repeatForever(
            cc.sequence(
                cc.moveTo(duration, -x, y),
                cc.moveTo(duration, x, y)
            )
        )

        this.playerAction = this.enemy.runAction(seq)
    }

    fire(): void {
        if (this.isFire) return
        this.isFire = true

        const speed = .6
        const y: number = cc.winSize.height / 2 - 80
        const seq: cc.ActionInterval = cc.sequence(
            cc.moveTo(speed, cc.v2(0, y)),
            cc.callFunc(this.die, this)
        )
        this.enemyAction = this.player.runAction(seq)
    }

    playBoom(pos: cc.Vec2, color: cc.Color): void {
        this.boom.setPosition(pos)
        const particle: cc.ParticleSystem = this.boom.getComponent(cc.ParticleSystem)
        if (color !== undefined) {
            particle.startColor = particle.endColor = color
        }
        particle.resetSystem()
    }

    die(): void {
        console.log('you are dead')
        this.isFire = false
        this.scoreCounter = 0
        this.player.active = false
        this.playBoom(this.player.position, this.player.color)

        setTimeout(() => {
            cc.director.loadScene('game')
        }, 1000)
    }

    update() {
        if (this.player.position.sub(this.enemy.position).mag() < this.player.width / 2 + this.enemy.width / 2) {
            this.isFire = false
            this.enemy.active = false
            this.playBoom(this.enemy.position, this.enemy.color)

            this.player.stopAction(this.playerAction)
            this.enemy.stopAction(this.enemyAction)

            this.score.string = `Score: ${++this.scoreCounter}`
            this.placePlayer()
            this.placeEnemy()
        }
    }
}

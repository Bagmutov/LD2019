import { drawCircle } from "./tools/tech.js";
class PARTICLE_GLOB {
    static addGr(gr) {
        this.groups.push(gr);
    }
    static drawAll(ctx) {
        for (let gr of this.groups)
            gr.groupDraw(ctx);
    }
    static stepAll() {
        for (let gr of this.groups)
            gr.groupStep();
    }
    static addParticle() {
        if (this.emptyNodes.length > 0) {
            return this.allParticles[this.emptyNodes.pop()];
        }
        else {
            if (this.allParticles.length > 99999)
                return;
            let newp = { ind: this.allParticles.length, x: 0, y: 0, vx: 0, vy: 0, dir: 0, r: 10, opac: 0xff };
            this.allParticles.push(newp);
            return newp;
        }
    }
    static delParticle(ind) {
        this.emptyNodes.push(ind);
    }
}
PARTICLE_GLOB.groups = [];
PARTICLE_GLOB.allParticles = [];
PARTICLE_GLOB.emptyNodes = [];
class ParticleGroup {
    constructor(x, y, period) {
        this.period = period;
        this.myparticles = [];
        this.time = 0;
        this.perSum = 0;
        this.emitter = { x: 0, y: 0 };
        PARTICLE_GLOB.addGr(this);
        this.emitter.x = x;
        this.emitter.y = y;
    }
    init(p) {
        p.dir = NUM.getRND() * 6.28;
        let v = 10 + 10 * NUM.getRND();
        p.vx = Math.cos(p.dir) * v;
        p.vy = Math.sin(p.dir) * v;
        p.x = this.emitter.x;
        p.y = this.emitter.y;
    }
    step(p) {
        p.x += p.vx;
        p.y += p.vy;
        console.log('asd ' + p.x);
    }
    draw(ctx, p) {
        drawCircle(ctx, p.x, p.y, p.r, '#aa8866');
    }
    groupEmmit() {
        let p = PARTICLE_GLOB.addParticle();
        this.myparticles.push(p.ind);
        this.init(p);
    }
    groupStep() {
        this.time++;
        for (let pi of this.myparticles)
            this.step(PARTICLE_GLOB.allParticles[pi]);
        while (this.perSum < this.time) {
            this.perSum += this.period;
            this.groupEmmit();
        }
    }
    groupDraw(ctx) {
        for (let pi of this.myparticles)
            this.draw(ctx, PARTICLE_GLOB.allParticles[pi]);
    }
}
class NUM {
    static init() { for (let i = 0; i < 1000; i++)
        this.rand[i] = Math.random(); }
    static getRND() { this.ind = (this.ind + 1) % this.rand.length; return this.rand[this.ind]; }
}
NUM.rand = [];
NUM.ind = 0;
export { NUM, ParticleGroup, PARTICLE_GLOB };
//# sourceMappingURL=particles.js.map
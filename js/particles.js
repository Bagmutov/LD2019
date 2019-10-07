import { drawCircle } from "./tools/tech.js";
import { arrDel } from "./tools/math.js";
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
            let newp = { ind: this.allParticles.length, x: 0, y: 0, vx: 0, vy: 0, dir: 0, r: 10, opac: 0xff, p1: 0, p2: 0, time: 0, maxTime: 1000 };
            this.allParticles.push(newp);
            return newp;
        }
    }
    static delParticle(ind) {
        this.emptyNodes.push(ind);
    }
    static delGr(gr) {
        arrDel(this.groups, gr);
    }
}
PARTICLE_GLOB.groups = [];
PARTICLE_GLOB.allParticles = [];
PARTICLE_GLOB.emptyNodes = [];
class ParticleGroup {
    constructor(x, y, period, partN = 10, target = null) {
        this.period = period;
        this.partN = partN;
        this.target = target;
        this.myparticles = [];
        this.mypart_empt = [];
        this.time = 0;
        this.perSum = 0;
        this.emitter = { x: 0, y: 0 };
        PARTICLE_GLOB.addGr(this);
        this.emitter.x = x;
        this.emitter.y = y;
    }
    init(p) {
        p.dir = NUM.getRND() * 6.28;
        let v = 2 + 2 * NUM.getRND();
        p.vx = Math.cos(p.dir) * v;
        p.vy = Math.sin(p.dir) * v;
        p.x = this.emitter.x;
        p.y = this.emitter.y;
        // p.time=0;
    }
    step(p) {
        p.x += p.vx;
        p.y += p.vy;
        // p.time++;
        if (p.time++ == p.maxTime)
            this.groupDelPart(p.ind);
        // console.log('asd '+p.x);
    }
    draw(ctx, p) {
        drawCircle(ctx, p.x, p.y, p.r, '#aa8866');
    }
    groupEmmit() {
        if (this.partN-- <= 0) {
            return;
        }
        if (this.target) {
            this.emitter.x = this.target.x;
            this.emitter.y = this.target.y;
        }
        let ind = (this.mypart_empt.length == 0) ? this.myparticles.length : this.mypart_empt.pop();
        let p = PARTICLE_GLOB.addParticle();
        this.myparticles[ind] = p.ind;
        this.init(p);
        // console.log(this.partN);
    }
    groupStep() {
        this.time++;
        for (let pi of this.myparticles)
            if (pi != null)
                this.step(PARTICLE_GLOB.allParticles[pi]);
        while (this.perSum < this.time) {
            this.perSum += this.period;
            this.groupEmmit();
        }
    }
    groupDraw(ctx) {
        for (let pi of this.myparticles)
            if (pi != null)
                this.draw(ctx, PARTICLE_GLOB.allParticles[pi]);
    }
    groupDelPart(ind) {
        let j = this.myparticles.indexOf(ind);
        if (j == -1)
            return;
        this.myparticles[j] = null;
        this.mypart_empt.push(j);
    }
    deleteGroup() {
        PARTICLE_GLOB.delGr(this);
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
import { fMain, clrCtrl } from "./main.js";
import { NUM, ParticleGroup } from "./particles.js";
import { dist, arrFind, arrRemAll } from "./tools/math.js";
import { toHexDouble } from "./tools/color/colorCore.js";
class Flowing {
    // maxv:number=.5;
    constructor(x = 0, y = 0) {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.tx = 0;
        this.ty = 0;
        this.off = { x: 0, y: 0, vx: 0, vy: 0 };
        this.maxOff = 10;
        this.acc = .5;
        this.attr = .003;
        this.setPos(x, y);
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    addV(vx, vy) {
        this.vx += vx;
        this.vy += vy;
    }
    setTarget(ttx, tty) {
        this.tx = ttx;
        this.ty = tty;
    }
    generateOff() {
        this.off = { x: (NUM.getRND() - .5) * this.maxOff, y: (NUM.getRND() - .5) * this.maxOff, vx: 0, vy: 0 };
    }
    step() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx = this.vx * this.acc - (this.x - this.tx - this.off.x) * this.attr;
        this.vy = this.vy * this.acc - (this.y - this.ty - this.off.y) * this.attr;
    }
}
class Letter extends Flowing {
    constructor(letter, x = 0, y = 0) {
        super(x, y);
        this.letter = letter;
        this.rad = 30;
        this.active = false;
        this.op = "00";
        this.opv = 5;
        this._opac = 0x00;
    }
    set opac(v) { this.op = toHexDouble(v); this._opac = v % 0xff; }
    get opac() { return this._opac; }
    stepDraw(ctx) {
        this.step();
        if (this.opv != 0) {
            this.opac += this.opv;
            if (this.opac >= 0xff || this.opac <= 0)
                this.opv = 0;
        }
        ctx.fillStyle = ((this.active) ? clrCtrl.colors.textact : clrCtrl.colors.text) + this.op;
        ctx.font = this.rad * 2 + 'px Indie Flower';
        ctx.fillText(this.letter, this.x, this.y);
    }
    beginRemoval() {
        this.opv = -5;
    }
    activate() {
        this.active = true;
    }
    deactivate() {
        this.active = false;
    }
}
Letter.size = 30;
class Word extends Flowing {
    constructor(str, x = 0, y = 0) {
        super(x, y);
        this.str = str;
        this.letters = [];
        this.spacing = 30;
    }
    addLetter(lt) {
        this.letters.push(lt);
        this.placeLetters();
    }
    setPos(x, y) {
        super.setPos(x, y);
        if (this.letters)
            this.placeLetters();
    }
    placeLetters() {
        for (let i = 0; i < this.letters.length; i++)
            if (!this.letters[i].active)
                this.letters[i].setTarget(this.x + i * this.spacing - this.letters.length * this.spacing / 2, this.y + this.letters[i].rad);
    }
    stepDraw(ctx) {
        this.step();
        for (let i = 0; i < this.letters.length; i++)
            this.letters[i].stepDraw(ctx);
    }
    activate(str, lst) {
        let ind = this.str.indexOf(str);
        for (let i = 0; i < str.length; i++) {
            this.letters[i + ind].activate();
            lst.push(this.letters[i + ind]);
        }
    }
}
class FACE_CONTROL {
    static addWord(str) {
        let word = new Word(str);
        this.words.push(word);
        this.placeWords();
        this.createParticles(word.x, word.y, str, word);
        for (let i = 0; i < str.length; i++) {
            let lt = new Letter(str[i], word.x + NUM.getRND() * 100 - 50, word.y + NUM.getRND() * 100 - 50);
            this.letters.push(lt);
            word.addLetter(lt);
        }
    }
    static delWord(word) {
        let ind = arrFind(this.words, (w) => (w.str == word));
        if (ind == -1)
            throw new Error('no word');
        let wo = this.words[ind];
        this.deadWords.push({ w: wo, time: 1000 });
        for (let lt of wo.letters)
            lt.beginRemoval();
        this.words.splice(ind, 1);
    }
    static placeWords() {
        let ang = 6.28 / this.words.length, i = 0;
        for (let w of this.words)
            w.setPos(Math.cos(this.strtAng + ang * (i)) * fMain.width / 4 + fMain.width / 2, Math.sin(this.strtAng + ang * (i++)) * fMain.height / 4 + fMain.height / 2);
        for (let i = 0; i < this.actLetters.length; i++)
            this.actLetters[i].setTarget(fMain.width / 2 + (-this.actLetters.length / 2 + i) * Letter.size, fMain.height / 2);
    }
    static drawAll(ctx) {
        if (this.letters.length == 0)
            return;
        this.strtAng = (this.strtAng + .0005) % 6.28;
        this.placeWords();
        if (this.offTimer.t-- <= 0) {
            this.offTimer.t = 1;
            this.letters[this.offTimer.lind].generateOff();
            this.offTimer.lind = (~~(10 * NUM.getRND()) + this.offTimer.lind) % this.letters.length;
        }
        for (let wrd of this.words)
            wrd.stepDraw(ctx);
        for (let dwrd of this.deadWords) {
            dwrd.w.stepDraw(ctx);
            dwrd.time--;
        }
        arrRemAll(this.deadWords, (dw) => (dw.time < 0));
    }
    static makeWave(x, y, force) {
        for (let i = 0; i < this.letters.length; i++) {
            let lt = this.letters[i], dx = lt.x - x, dy = lt.y - y, d = dist(dx, dy) / force;
            lt.addV(dx / d, dy / d); //lt.tx+
        }
    }
    static setActiveWords(awords, hosts) {
        this.actLetters = [];
        for (let lt of this.letters)
            lt.deactivate();
        for (let i = 0; i < awords.length; i++)
            for (let wrd of this.words)
                if (hosts[i] == wrd.str)
                    wrd.activate(awords[i], this.actLetters);
    }
    static createParticles(x, y, name, word = null) {
        let ptg;
        switch (name) {
            case "light":
                ptg = new ParticleGroup(x, y, .3, 100, word.letters[0]);
                ptg.draw = function (ctx, p) {
                    p.opac *= .99;
                    p.vx *= .99;
                    p.vy *= .99;
                    ctx.beginPath();
                    ctx.strokeStyle = clrCtrl.colors.ptcls[2] + toHexDouble(~~p.opac);
                    ctx.lineWidth = 2;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.vx * p.time, p.y + p.vy * p.time);
                    ctx.stroke();
                };
                break;
            default:
                ptg = new ParticleGroup(x, y, 1, 100, word.letters[0]);
                ptg.draw = function (ctx, p) {
                    p.opac *= .99;
                    p.vx *= .9;
                    p.vy *= .9;
                    ctx.beginPath();
                    ctx.strokeStyle = clrCtrl.colors.ptcls[2] + toHexDouble(~~p.opac);
                    ctx.lineWidth = 1;
                    ctx.arc(p.x, p.y, p.time * .5 + 50, p.dir - .4, p.dir + .4);
                    // ctx.lineTo(p.x+p.vx*p.time, p.y+p.vy*p.time);
                    ctx.stroke();
                };
                ptg.init = function (p) {
                    p.dir = NUM.getRND() * 6.28;
                    let v = .0 + 5 * NUM.getRND();
                    p.vx = Math.cos(p.dir) * v;
                    p.vy = Math.sin(p.dir) * v;
                    p.x = this.emitter.x;
                    p.y = this.emitter.y;
                    // p.time=0;
                };
        }
    }
}
FACE_CONTROL.letters = [];
FACE_CONTROL.offTimer = { t: 10, lind: 0 };
FACE_CONTROL.words = [];
FACE_CONTROL.deadWords = [];
FACE_CONTROL.strtAng = 0;
FACE_CONTROL.actWord = "";
FACE_CONTROL.actLetters = [];
export { Letter, FACE_CONTROL };
//# sourceMappingURL=wordfaces.js.map
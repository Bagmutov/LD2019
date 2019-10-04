import { mmin, mmax, mabs, arrDel } from "../math.js";
export class RGB {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}
RGB.white = new RGB(255, 255, 255);
RGB.grey = new RGB(127, 127, 127);
;
export class HSV {
    constructor(h, s, v) {
        this.h = h;
        this.s = s;
        this.v = v;
    }
}
;
export class ColorCursor {
    constructor(pos = new HSV(0, 1, 1), outConn = null) {
        this.pos = pos;
        this.inConns = [];
        this.outConns = [];
        this.moved = false;
        this.props = {};
        if (outConn)
            this.connectOut(outConn);
    }
    connectOut(conn) {
        this.outConns.push(conn);
        // conn.curs2=this;
    }
    connectIn(conn) {
        this.inConns.push(conn);
        // conn.curs1=this; 
    }
    changePos(h = this.pos.h, s = this.pos.s, v = this.pos.v, changeDelta = false) {
        if (this.moved)
            return;
        if (h != 1)
            h = (h + 10) % 1;
        s = mmax(0, mmin(s, 1));
        v = mmax(0, mmin(v, 1));
        this.moved = true;
        this.pos.h = h;
        this.pos.s = s;
        this.pos.v = v;
        this.outConns.forEach(e => { e.apply(); });
        if (changeDelta)
            this.inConns.forEach(e => { e.changeVect(); });
        this.moved = false;
    }
    changePosHSV(hsv, changeDelta = false) {
        this.changePos(hsv.h, hsv.s, hsv.v, changeDelta);
    }
    collectCursors(arr, conarr) {
        if (this.props.ind >= 0)
            throw new Error('theres some ind remaining');
        this.props.ind = arr.length;
        arr.push(this);
        for (let c of this.inConns) {
            if (!(c.curs1.props.ind >= 0))
                c.curs1.collectCursors(arr, conarr);
        }
        for (let c of this.outConns) {
            c.props.ind = conarr.length;
            conarr.push(c);
            if (!(c.curs2.props.ind >= 0))
                c.curs2.collectCursors(arr, conarr);
        }
    }
    collectOutCursors(arr) {
        if (this.props.ind >= 0)
            throw new Error('theres some ind remaining');
        this.props.ind = arr.length;
        arr.push(this);
        for (let c of this.outConns)
            if (!(c.curs2.props.ind >= 0))
                c.curs2.collectOutCursors(arr);
    }
    deleteInds() {
        this.props.ind = undefined;
        for (let c of this.inConns) {
            if ((c.curs1.props.ind >= 0))
                c.curs1.deleteInds();
        }
        for (let c of this.outConns) {
            if ((c.curs1.props.ind >= 0))
                c.curs1.deleteInds();
        }
    }
    deleteMe() {
        for (let c of this.inConns)
            c.delete();
        for (let c of this.outConns)
            c.delete();
    }
    getClr() { return toClr(this.pos); }
}
export const CLR_CON_TP = {
    ADD: 0, MIRR: 1, RANGE: 2
};
export class CursorConnect {
    constructor(curs1, curs2, type = CLR_CON_TP.ADD, targ = null, perc = 0) {
        this.curs1 = curs1;
        this.curs2 = curs2;
        this.type = type;
        this.targ = targ;
        this.perc = perc;
        this.vect = null;
        this.props = {};
        curs1.connectOut(this);
        curs2.connectIn(this);
        this.changeVect();
        this.apply();
    }
    apply() {
        switch (this.type) {
            case CLR_CON_TP.ADD:
                this.curs2.changePosHSV(hsvAdd(this.curs1.pos, this.vect, 1, 1));
                break;
            case CLR_CON_TP.MIRR:
                this.curs2.changePos(this.targ.pos.h * 2 - this.curs1.pos.h, this.curs1.pos.s, this.curs1.pos.v, true);
                break;
            case CLR_CON_TP.RANGE:
                let hsv = hsvAdd(this.curs1.pos, this.targ.pos, this.perc, (1 - this.perc));
                if (mabs(this.curs1.pos.h - this.targ.pos.h) > .5) //NOTE stupid solution. Imtired
                    hsv.h = this.curs1.pos.h > this.targ.pos.h ? (this.curs1.pos.h - 1) * this.perc + this.targ.pos.h * (1 - this.perc) :
                        this.curs1.pos.h * this.perc + (this.targ.pos.h - 1) * (1 - this.perc);
                this.curs2.changePosHSV(hsv);
                break;
        }
    }
    changeVect() {
        switch (this.type) {
            case CLR_CON_TP.ADD:
                this.vect = hsvAdd(this.curs2.pos, this.curs1.pos, 1, -1);
                break;
            case CLR_CON_TP.MIRR:
                break;
            case CLR_CON_TP.RANGE:
                break;
        }
    }
    delete() {
        arrDel(this.curs1.outConns, this);
        arrDel(this.curs2.inConns, this);
    }
}
export function createColorStateObj(startCurs) {
    let obj = { cursors: [], conns: [] }, cursors = [], connects = [];
    startCurs.collectCursors(cursors, connects);
    for (let cu of cursors) {
        let cobj = { in: [], out: [], pos: { h: cu.pos.h, s: cu.pos.s, v: cu.pos.v } };
        for (let con of cu.inConns)
            cobj.in.push(con.props.ind);
        for (let con of cu.outConns)
            cobj.out.push(con.props.ind);
        obj.cursors.push(cobj);
    }
    for (let co of connects) {
        obj.conns.push({ type: co.type, curs1: co.curs1.props.ind, curs2: co.curs2.props.ind, targ: co.targ ? co.targ.props.ind : -1, perc: co.perc, vect: co.vect ? { h: co.vect.h, s: co.vect.s, v: co.vect.v } : null });
        co.props.ind = undefined;
    }
    startCurs.deleteInds();
    return obj;
}
export function cursorsFromColorState(obj) {
    let cursors = [], connects = [];
    for (let cobj of obj.cursors)
        cursors.push(new ColorCursor(new HSV(cobj.pos.h, cobj.pos.s, cobj.pos.v)));
    for (let conobj of obj.conns)
        connects.push(new CursorConnect(cursors[conobj.curs1], cursors[conobj.curs2], conobj.type, cursors[conobj.targ], conobj.perc));
    for (let i = 0; i < obj.cursors.length; i++) {
        const cobj = obj.cursors[i];
        for (let coi of cobj.in)
            cursors[i].inConns.push(connects[coi]);
        for (let coi of cobj.out)
            cursors[i].outConns.push(connects[coi]);
    }
    return cursors;
}
const OL = 2.1;
export function HSVtoRGB2(hsv) {
    return new RGB(~~mmin(0xff, 2 * mmax(0xff - mabs(hsv.h > OL ? hsv.h - 6.28 : hsv.h) * 0xff / OL, 0)), ~~mmin(0xff, 2 * mmax(0xff - mabs(2.1 - hsv.h) * 0xff / OL, 0)), ~~mmin(0xff, 2 * mmax(0xff - (mabs((hsv.h < OL ? hsv.h + 6.28 : hsv.h) - 4.2)) * 0xff / OL, 0)));
}
export function HSVtoRGB(hsv) {
    let vmin = ~~((1 - hsv.s) * hsv.v * 255), vmax = ~~(hsv.v * 255), a = ~~((vmax - vmin) * (hsv.h % .1666) * 6);
    switch (~~(hsv.h / .1666)) {
        case 1: return new RGB(vmax - a, vmax, vmin);
        case 2: return new RGB(vmin, vmax, vmin + a);
        case 3: return new RGB(vmin, vmax - a, vmax);
        case 4: return new RGB(vmin + a, vmin, vmax);
        case 5: return new RGB(vmax, vmin, vmax - a);
        default: return new RGB(vmax, vmin + a, vmin);
    }
}
export function RGBtoHSV(rgb) {
    let max = Math.max(rgb.r, rgb.g, rgb.b), min = Math.min(rgb.r, rgb.g, rgb.b), rng = max - min, h = (max == rgb.r) ? (1 + .1666 * (rgb.g - rgb.b) / rng) % 1 : (max == rgb.g) ? .333 + .1666 * (rgb.b - rgb.r) / rng : .666 + .1666 * (rgb.r - rgb.g) / rng;
    return new HSV(h, 1 - min / (max || 1), max / 255);
}
export function toClr(n) {
    if (n instanceof HSV)
        n = HSVtoRGB(n);
    if (n instanceof RGB)
        n = n.r * 0x10000 + n.g * 0x100 + n.b;
    var res = (~~n).toString(16);
    while (res.length < 6)
        res = "0" + res;
    return "#" + res;
}
//returns arctg(dy/dx)
export function getAng(dx, dy) { return (Math.atan(dy / (dx || .01)) + (dx < 0 ? 3.14 : 0) + 6.28) % 6.28; }
// export function getRad(dx,dy,rad){return Math.min(rad,dist(dx,dy))}
export function rgbAdd(c1, c2, a = .5, b = 1 - a) { return new RGB(~~(c1.r * a + c2.r * b), ~~(c1.g * a + c2.g * b), ~~(c1.b * a + c2.b * b)); }
export function hsvAdd(c1, c2, a = .5, b = 1 - a) { return new HSV((c1.h * a + c2.h * b) % 1, (c1.s * a + c2.s * b), (c1.v * a + c2.v * b)); }
export function rgbLim(n) { n.r = mmax(0, mmin(0xff, n.r)); n.g = mmax(0, mmin(0xff, n.g)); n.b = mmax(0, mmin(0xff, n.b)); return n; }
export function hsvLim(n) { n.h = (n.h + 10) % 1; n.s = mmax(0, mmin(1, n.s)); n.v = mmax(0, mmin(1, n.v)); return n; }
export function rgbMult(clr, a, b = a, c = a) { return new RGB(Math.min(255, ~~(clr.r * a)), Math.min(255, ~~(clr.g * b)), Math.min(255, ~~(clr.b * c))); }
export function getRndClrN() {
    var n = ~~(Math.random() * 0xffffff);
    return n;
}
export function getRndClr() { return toClr(getRndClrN()); }
export function brightness(clr) { return (clr >>> 16) + ((clr & 0xff00) >>> 8) + (clr & 0xff); }
export function toHexDouble(n) { return (n > 0xf ? "" : "0") + (~~n).toString(16); }
export function hsvSet({ hsv, h = -1, s = -1, v = -1 }) { return new HSV(h > 0 ? h : hsv.h, s > 0 ? s : hsv.s, v > 0 ? v : hsv.v); }
export const COLOR = {
    white: { r: 255, g: 255, b: 255 }
};
//# sourceMappingURL=colorCore.js.map
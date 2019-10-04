import { mmin, mmax, mabs, dist, arrFindMin, arrFind } from "../math.js";
import { toClr, getAng, rgbAdd, COLOR, HSV, HSVtoRGB } from "./colorCore.js";
import { Button } from "../button.js";
import { ColorPicker } from "./colorPickerGUI.js";
import { drawCircle } from "../tech.js";
class ColorWheelEdi {
    constructor(gui, picker) {
        this.gui = gui;
        this.picker = picker;
        this.stripMode = false;
        this.attrAngs = [0];
        this.wheelFun = ColorPicker.wheels[0];
        this.prism = ColorPicker.prisms[0];
        this.cursObjs = [];
        this.lastDrawWidth = 0;
        let edi = this;
        this.whBut = new Button({ par: gui, crad: 0, z: 0, shadow: 0, canvN: 1, canvFirst: true });
        this.whBut.drawMe = function (ctx) {
            // ctx.drawImage(this.picker.clrWhCanv,this.picker.clrx,this.picker.clry);
            for (var c of edi.cursObjs) {
                if (c == edi.cursObjs[0])
                    drawCircle(ctx, edi.cntrx + c.dx * edi.w, edi.cntry + c.dy * edi.w, 5, '#000000', (picker.selectC.c && c.curs == picker.selectC.c.curs) ? 3 : 1);
                else
                    drawCircle(ctx, edi.cntrx + c.dx * edi.w, edi.cntry + c.dy * edi.w, 3, '#000000', (picker.selectC.c && c.curs == picker.selectC.c.curs) ? 3 : 1);
            }
            ctx.beginPath();
            ctx.lineWidth = .2;
            if (edi.stripMode) {
                ctx.moveTo(this.x, this.y + edi.cursObjs[0].curs.pos.s * this.h);
                ctx.lineTo(this.x + this.w, this.y + edi.cursObjs[0].curs.pos.s * this.h);
            }
            else
                ctx.arc(edi.cntrx, edi.cntry, edi.cursObjs[0].curs.pos.s * this.w / 2, 0, 6.29);
            ctx.stroke();
        };
        this.whBut.msdown = function (mx, my, rmb) {
            // if(mx>x && mx<x+w && my>y && my<y+h){
            console.log('s');
            let x = (mx - edi.cntrx) / edi.w, y = (my - edi.cntry) / edi.w;
            let min = arrFindMin(edi.cursObjs, (c) => (dist(x - c.dx, y - c.dy)));
            // var md = 2,dd,mc, 
            // for(var c of this.edi.cursObjs){dd=dist(x-c.dx,y-c.dy);if(dd<md){md=dd;mc=c;}};
            if (min.d < .1) {
                picker.selectCursorInd(arrFind(picker.curspicks, c => c.curs == min.o.curs));
            } //min.o.but.mmsdown(0,0,rmb);min.o.but.mmsclick(0,0,rmb);
            edi.processInput(mx - edi.cntrx, my - edi.cntry);
            // }
        };
        this.whBut.msmove = function (mx, my) {
            edi.processInput(mx - edi.cntrx, my - edi.cntry);
        };
        this.whBut.msup = function (mx, my) {
            // var a = this.edi.cursObjs[0].ang;
            // if(this.picker.attrAngs[0]!=a){
            //     this.picker.attrAngs=[a];
            //     getattr(3,a,this.picker.attrAngs);	getattr(4,a,this.picker.attrAngs);	getattr(5,a,this.picker.attrAngs);
            // }
            // function getattr(n,a,arr){for(var j=1;j<n;j++)arr.push((a+6.28/n*j)%6.28);}
        };
    }
    initPos(x, y, w) {
        this.whBut.setPos({ x, y, w, h: w });
        this.x = x;
        this.y = y;
        this.w = w;
        this.cntrx = x + w / 2;
        this.cntry = y + w / 2;
    }
    initDraw() {
        if (this.w != this.lastDrawWidth) {
            this.lastDrawWidth = this.w;
            this.redraw();
        }
    }
    processInput(dx, dy) {
        dx = dx / this.w;
        dy = dy / this.w;
        var r = (this.stripMode) ? dy + .5 : dist(dx, dy) * 2;
        if (!this.stripMode) {
            if (r > .97) {
                dx = (dx) * .97 / r;
                dy = (dy) * .97 / r;
                r = 1;
            }
        }
        else {
            dx = Math.max(Math.min(dx, .5), -.5);
            dy = Math.max(Math.min(dy, .5), -.5);
            r = dy + .5;
        }
        var a = (this.stripMode) ? (dx + .5) * 6.28 : getAng(dx, dy);
        this.picker.setSelCursor(a, r);
        this.moveCursors();
        //attraction to angles
        // if(cursor!=this.cursors[0]){	// NOTE here is "shift on" should be checked
        // 	var mda=9, ma, da;
        // 	for(var aa of this.attrAngs){da=mmin(mabs(aa-a+6.28)%6.28,mabs(aa-a-6.28)%6.28);if(da<mda){mda=da;ma=aa;}}
        // 	if(mda<.2)a=ma;
        // 	dx=(this.stripMode)?a/6.28-.5:Math.cos(a)*r/2; dy=(this.stripMode)?r-.5:Math.sin(a)*r/2;
        // }
    }
    addCObj(c) {
        this.cursObjs.push({ curs: c.curs, dx: 0, dy: 0 });
        this.moveCursors();
    }
    delCObj(c) {
        let i = arrFind(this.cursObjs, (o) => (o.curs == c.curs));
        this.cursObjs.splice(i, 1);
    }
    moveCursors() {
        for (let c of this.cursObjs) {
            c.dx = (this.stripMode) ? c.curs.pos.h - .5 : Math.cos(c.curs.pos.h * 6.28) * c.curs.pos.s / 2;
            c.dy = (this.stripMode) ? c.curs.pos.s - .5 : Math.sin(c.curs.pos.h * 6.28) * c.curs.pos.s / 2;
        }
    }
    redraw() {
        this.whBut.ctx.clearRect(0, 0, this.w, this.w);
        this.whBut.ctx.fillStyle = "#ffffff";
        if (this.stripMode)
            drawColorStrip(this.whBut.ctx, 0, 0, this.w, this.w, this.wheelFun, this.prism);
        else {
            this.whBut.ctx.lineWidth = 35;
            this.whBut.ctx.strokeStyle = '#000000';
            this.whBut.ctx.arc(this.w / 2, this.w / 2, this.w / 2 - 35 / 2, 0, 6.29);
            this.whBut.ctx.stroke();
            drawColorWheel(this.whBut.ctx, this.w / 2, this.w / 2, this.w / 2 - 0, this.wheelFun, this.prism);
        }
        // this.renewCursClrs();
    }
    whToStrip() {
        for (var c of this.cursObjs) {
            c.dx = c.curs.pos.h - .5;
            c.dy = c.curs.pos.s - .5;
        }
    }
    stripToWh() {
        for (var c of this.cursObjs) {
            c.dx = Math.cos(c.curs.pos.h * 6.28) * c.curs.pos.s / 2;
            c.dy = Math.sin(c.curs.pos.h * 6.28) * c.curs.pos.s / 2;
        }
    }
}
function drawColorStrip(ctx, x, y, w, h, whFun, prism = null) {
    var a;
    for (var i = x; i < x + w; i++)
        for (var j = y; j < y + h; j++) {
            var dx = i - x, dy = j - y;
            a = dx / w * 6.28; //prism.apply()
            ctx.fillStyle = toClr(whFun(a, dy / h));
            ctx.fillRect(i, j, 1, 1);
        }
}
function drawColorWheel(ctx, x, y, r, whFun, prism) {
    var a;
    for (var i = -r; i < r; i++)
        for (var j = -r; j < r; j++) {
            var d = dist(i, j) / r;
            if (d <= 1) {
                a = getAng(i, j); //prism.apply(,)
                ctx.fillStyle = toClr(whFun(a, d)) + ((d > .95) ? (~~(0xef * (1 - d) * 20 + 0x10)).toString(16) : '');
                ctx.fillRect(x + i, y + j, 1, 1);
            }
        }
}
const OL = 2.1;
const WHEEL = {
    basic: function (hue, sat, val = 1) {
        return HSVtoRGB(new HSV(hue / 6.28, sat, val));
    },
    spiral: function (ang, rad) {
        ang = (ang + 6.28 * (1 - rad)) % 6.28;
        var r = mmin(0xff, 2 * mmax(0xff - mabs(ang > OL ? ang - 6.28 : ang) * 0xff / OL, 0)), g = mmin(0xff, 2 * mmax(0xff - mabs(2.1 - ang) * 0xff / OL, 0)), b = mmin(0xff, 2 * mmax(0xff - (mabs((ang < OL ? ang + 6.28 : ang) - 4.2)) * 0xff / OL, 0));
        var res = rgbAdd({ r: ~~r, g: ~~g, b: ~~b }, COLOR.white, mmax(0, rad - .0));
        return res;
    },
    triangles: function (ang, rad) {
        ang = (ang + 6.28) % 6.28;
        var r = 2 * Math.max(0xff - Math.abs(ang > OL ? ang - 6.28 : ang) * 0xff / OL, 0), g = 2 * Math.max(0xff - Math.abs(2.1 - ang) * 0xff / OL, 0), b = 2 * Math.max(0xff - (Math.abs((ang < OL ? ang + 6.28 : ang) - 4.2)) * 0xff / OL, 0);
        r = Math.min(0xff, r + (1 - rad) * 0xff);
        g = Math.min(0xff, g + (1 - rad) * 0xff);
        b = Math.min(0xff, b + (1 - rad) * 0xff);
        return { r: ~~r, g: ~~g, b: ~~b };
    },
    constIntens: function (ang, rad) {
        ang = (ang + 6.28) % 6.28;
        var r = mmin(0xff, 2 * mmax(0xff - mabs(ang > OL ? ang - 6.28 : ang) * 0xff / OL, 0)), g = mmin(0xff, 2 * mmax(0xff - mabs(2.1 - ang) * 0xff / OL, 0)), b = mmin(0xff, 2 * mmax(0xff - (mabs((ang < OL ? ang + 6.28 : ang) - 4.2)) * 0xff / OL, 0));
        var res = rgbAdd({ r: ~~r, g: ~~g, b: ~~b }, COLOR.white, Math.sqrt(rad));
        return res;
    }
};
class Prism {
    constructor(pts, reverse = false) {
        this.pts = pts;
        this.params = [];
        var lst = [], k;
        // if(!reverse){pts.push({x:6.28,y:6.28});	pts.unshift({x:0,y:0});}
        // else {pts.unshift({x:0,y:6.28});	pts.push({x:6.28,y:0});}
        for (var i = 1; i < pts.length; i++) {
            k = (pts[i].y - pts[i - 1].y) / (pts[i].x - pts[i - 1].x);
            this.params.push({ h: pts[i].x, k: k, c: pts[i].y - k * pts[i].x });
        }
    }
    apply(ang) {
        var i = 0;
        while (ang > this.params[i].h)
            i++;
        return this.params[i].k * ang + this.params[i].c;
    }
    drawMe(ctx, x, y, size) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(this.pts[0].x / 6.28 * size + x, (1 - this.pts[0].y / 6.28) * size + y);
        for (var i = 1; i < this.pts.length; i++)
            ctx.lineTo(this.pts[i].x / 6.28 * size + x, (1 - this.pts[i].y / 6.28) * size + y);
        ctx.stroke();
        ctx.strokeRect(x, y, size, size);
    }
}
const PRISM = {
    line: new Prism([{ x: 0, y: 0 }, { x: 6.28, y: 6.28 }]),
    lineRev: new Prism([{ x: 0, y: 6.28 }, { x: 6.28, y: 0 }]),
    ryb: new Prism([{ x: 0, y: 0 }, { x: 2.1, y: 1.043 }, { x: 4.2, y: 4.2 }, { x: 6.28, y: 6.28 }]),
    rybRev: new Prism([{ x: 0, y: 6.28 }, { x: 2.1, y: 4.2 }, { x: 4.2, y: 1.043 }, { x: 6.28, y: 0 }]),
    rybAdobe: new Prism([{ x: 0, y: 6.28 }, { x: 0.521, y: 5.237 }, { x: 2.5, y: 3.14 }, { x: 4.3, y: 1.043 }, { x: 6.28, y: 0 }]),
};
export { PRISM, WHEEL, ColorWheelEdi, drawColorStrip };
//# sourceMappingURL=colorWheel.js.map
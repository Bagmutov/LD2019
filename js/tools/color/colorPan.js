import { Checkbox, RadioGroup, Panel } from "../button.js";
import { drawRoundRect, drawLine, drawCircle } from "../tech.js";
import { CursorConnect, CLR_CON_TP } from "./colorCore.js";
import { mmin, mmax, dist, arrDel, arrFind, arrRemAll } from "../math.js";
//  conns:{cind:number,c2ind:number,type:number}[],
class ColorPalette {
    constructor(gui, picker, x = 0, y = 0, w = 0, h = 0) {
        this.gui = gui;
        this.picker = picker;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.curspanos = [];
        this.cursorRG = new RadioGroup();
        let main = this;
        this.pan = new Panel(gui, 0, 0, 0, 0, 1, 0, 0);
        this.pan.color.panback = "#ffffff";
        this.pan.drawMe = function (ctx) {
            drawRoundRect(ctx, this.x, this.y, 10, this.w, this.h, '#ffffff');
            ctx.lineWidth = 3;
            for (let cc of main.curspanos)
                for (let con of cc.conns)
                    if (con.type < 2)
                        drawLine(ctx, cc.but.x, cc.but.y, con.c.but.x, con.c.but.y, (['#000000', '#3377aa'])[con.type], con.type * 2 + 1);
                    else if (con.type == 2)
                        drawLine(ctx, cc.but.x, cc.but.y, (con.c.but.x + con.c2.but.x) / 2, (con.c.but.y + con.c2.but.y) / 2, (['#000000', '#335588'])[con.type - 2], con.type * 1 + 1);
        };
        if (w * h > 0) {
            this.initPos(x, y, w, h);
            this.initDraw();
        }
    }
    initPos(x, y, w, h) {
        for (let co of this.curspanos)
            co.but.setPos({ x: x + co.but.w + (co.but.x + (w - co.but.w)) % (w - co.but.w), y: y + co.but.h + (co.but.y + (h - co.but.h)) % (h - co.but.h) });
        this.pan.setPos({ x, y, w, h });
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.x2 = x + w;
        this.y2 = y + h;
    }
    initDraw() {
    }
    addPanObj(cur, info = {}) {
        let cpo = this.crtPanObj(cur, info);
        this.curspanos.push(cpo);
        this.cursorRG.add(cpo.but);
        return cpo;
    }
    crtPanObj(cur, info = {}) {
        let { par = null, type = "", targ = null, perc = 1 } = info;
        let sz = (type == "range" ? 1 : 1.5) * this.picker.sizes.buth;
        var b = new Checkbox({ par: this.gui, x: this.x + this.w * 0.25 + (30 * this.curspanos.length) % (this.w / 2), y: this.y + this.h / 2, w: sz, h: sz, z: -1 / sz, crad: sz / 4, shadow: 0 });
        let cobj = { cpick: cur, but: b, conns: [], crtInfo: info }, main = this;
        switch (type) {
            case "simple":
                new CursorConnect(par.curs, cur.curs, CLR_CON_TP.ADD);
                par.panobj.conns.push({ c: cobj, c2: null, type: 0 });
                break;
            case "twin":
                new CursorConnect(par.curs, cur.curs, CLR_CON_TP.MIRR, targ.curs);
                new CursorConnect(cur.curs, par.curs, CLR_CON_TP.MIRR, targ.curs);
                new CursorConnect(targ.curs, cur.curs, CLR_CON_TP.ADD);
                par.panobj.conns.push({ c: cobj, c2: null, type: 1 });
                cobj.conns.push({ c: par.panobj, c2: null, type: 1 });
                targ.panobj.conns.push({ c: par.panobj, c2: cobj, type: 2 });
                break;
            case "range":
                new CursorConnect(par.curs, cur.curs, CLR_CON_TP.RANGE, targ.curs, perc);
                new CursorConnect(targ.curs, cur.curs, CLR_CON_TP.RANGE, par.curs, 1 - perc);
                par.panobj.conns.push({ c: cobj, c2: null, type: 3 });
                targ.panobj.conns.push({ c: cobj, c2: null, type: 3 });
                break;
        }
        b.props.lst = [];
        b.props.moveMe = function (x, y) {
            this.x = x;
            this.y = y;
            this.props.lst.forEach(e => { e.panobj.but.props.renewPos(); });
        };
        let msMoveFun = function (mx, my, rmb) {
            if (!rmb) {
                this.props.moveMe.call(this, mmin(main.x2 - this.w / 2, mmax(main.x + this.w / 2, mx - this.props.dragx)), mmin(main.y2 - this.h / 2, mmax(main.y + this.h / 2, my - this.props.dragy)));
            }
        };
        switch (type) {
            case "twin":
                b.props.twin = par.panobj.but;
                par.panobj.but.props.twin = b;
                b.msmove = par.panobj.but.msmove = function (mx, my, rmb) {
                    msMoveFun.call(this, mx, my, rmb);
                    let x = this.props.twin.x, y = this.props.twin.y, d = dist(this.x - x, this.y - y) + 1, max = mmin(main.h, main.w) / 2;
                    if (d > max) {
                        msMoveFun.call(this.props.twin, this.props.twin.x + this.props.twin.props.dragx + (this.x - x) * (d - max) / d, this.props.twin.y + this.props.twin.props.dragy + (this.y - y) * (d - max) / d, false);
                        // this.props.twin.x+=(this.x-x)*(d-max)/d;this.props.twin.y+=(this.y-y)*(d-max)/d;
                    }
                };
                break;
            case "range":
                par.panobj.but.props.lst.push(cur);
                targ.panobj.but.props.lst.push(cur);
                b.props.par1 = par.panobj.but;
                b.props.par2 = targ.panobj.but;
                b.props.perc = perc;
                b.props.renewPos = () => {
                    b.props.moveMe.call(b, (b.props.par1.x) * b.props.perc + (b.props.par2.x) * (1 - b.props.perc), (b.props.par1.y) * b.props.perc + (b.props.par2.y) * (1 - b.props.perc));
                    if (b.par == null) {
                        arrDel(par.panobj.but.props.lst, cur);
                        arrDel(targ.panobj.but.props.lst, cur);
                    }
                };
                b.props.renewPos();
            case "simple":
            default:
                b.msmove = msMoveFun;
        }
        let picker = this.picker;
        b.props.dragx = 0;
        b.props.dragy = 0;
        ;
        b.msdown = function (mx, my, rmb) {
            if (rmb) {
                picker.deleteCursor(this.props.cursor);
            }
            else {
                if (picker.buts.crtrange.checked && this.props.cursor != picker.selectC.c) {
                    picker.buts.crtrange.uncheck();
                    let N = picker.buts.rangenum.pos;
                    let targ = picker.selectC.c;
                    for (let i = 0; i < N; i++)
                        picker.createCursor(1, 1, 1, { par: this.props.cursor, type: "range", targ: targ, perc: (i + 1) / (N + 1) });
                }
                picker.selectCursor(this.props.cursor);
                this.props.dragx = mx - this.x;
                this.props.dragy = my - this.y;
            }
        };
        b.mswheel = function (mx, my, d) {
            this.w = mmin(main.w, mmax(picker.sizes.buth, this.w + d * 5));
            this.h = mmin(main.h, mmax(picker.sizes.buth, this.h + d * 5));
            this.z = -1 / this.w;
            this.par.sortButtons();
            msMoveFun.call(this, this.x + this.props.dragx, this.y + this.props.dragy, false);
        };
        b.cntrx = 0;
        b.cntry = 0; //shift center for proper inMask detection
        b.drawMe = function (ctx) {
            let d = this.state % 2;
            drawRoundRect(ctx, this.x + d - this.w / 2, this.y + d - this.h / 2, this.crad, this.w - 2 * d, this.h - 2 * d, this.props.cursor.color);
            if (this.props.cursor == picker.selectC.c) {
                ctx.lineWidth = 2;
                drawCircle(ctx, this.x, this.y, this.crad, '#000000', 2);
            }
        };
        b.props.cursor = cur;
        b.mmsclick(0, 0, false);
        return cobj;
    }
    deletePanObj(cur) {
        this.gui.deleteButton(cur.but);
        arrDel(this.curspanos, cur);
        // while(cur.conns.length>0){
        // 	let con = cur.conns.pop();
        // 	if(this.picker.curspicks.indexOf(con.c.cpick)>=0)this.picker.deleteCursor(con.c.cpick);
        // }
        for (let c of this.curspanos)
            arrRemAll(c.conns, (a) => (this.curspanos.indexOf(a.c) < 0));
    }
    createPaletteStateObj(cpicks) {
        let palst = { cupanos: [] };
        for (let cup of this.curspanos) {
            let cps = {
                cpInd: arrFind(cpicks, cp => (cp == cup.cpick)),
                // conns:[],
                crtInfo: { par: (cup.crtInfo.par) ? arrFind(cpicks, cp => (cp == cup.crtInfo.par)) : null, type: cup.crtInfo.type,
                    targ: (cup.crtInfo.targ) ? arrFind(cpicks, cp => (cp == cup.crtInfo.targ)) : null, perc: cup.crtInfo.perc },
                prop: { x: (cup.but.x - this.x) / this.w, y: (cup.but.y - this.y) / this.h, z: cup.but.z, w: cup.but.w / this.w, h: cup.but.h / this.h }
            };
            // for(let con of cup.conns)
            // 	cps.conns.push({cind: this.curspanos.indexOf(con.c), c2ind: (con.c2)? this.curspanos.indexOf(con.c2): null, type: con.type});
            palst.cupanos.push(cps);
        }
        return palst;
    }
    loadPaletteStateObj(pstate, cpicks) {
        let curspanos = [];
        for (let cps of pstate.cupanos) {
            let cp = this.crtPanObj(cpicks[cps.cpInd], { par: cpicks[cps.crtInfo.par], targ: cpicks[cps.crtInfo.targ], type: cps.crtInfo.type, perc: cps.crtInfo.perc });
            curspanos.push(cp);
            cp.but.setPos({ x: this.x + cps.prop.x * this.w, y: this.y + cps.prop.y * this.h, z: cps.prop.z, w: cps.prop.w * this.w, h: cps.prop.h * this.h });
            cp.cpick.panobj = cp;
        }
        // for(let i=0;i<pstate.cupanos.length;i++){
        // 	let cp=curspanos[i];
        // 	for(let con of pstate.cupanos[i].conns)
        // 		cp.conns.push({c: curspanos[con.cind], c2: (con.c2ind)? curspanos[con.c2ind]: null, type: con.type});
        // }
        // 
        // this.deletePanObj(this.curspanos[0]);
        this.curspanos = curspanos;
        return curspanos;
    }
}
export { ColorPalette as CursorPanel };
//# sourceMappingURL=colorPan.js.map
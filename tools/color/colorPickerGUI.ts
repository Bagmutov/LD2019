import { mmin, mmax, mabs, pow2, dist, isNum, arrRemAll, arrDel, arrFind } from "../math.js";
import { ButtonGroup, RadioGroup, Checkbox, Button, Switcher, Slider, DrawMethods, MOUSE, NumSlider, SHAPES, Panel } from "../button.js";
import { WHEEL, PRISM, ColorWheelEdi, drawColorStrip,  } from "./colorWheel.js";
import { getAng, ColorCursor, HSV, CursorConnect, HSVtoRGB, hsvSet, toClr, rgbMult, RGB, ColorState, createColorStateObj, cursorsFromColorState } from "./colorCore.js";
import { drawRoundRect, drawLine, drawCircle, drawShape, saveFile, loadJSON } from "../tech.js";
import { CursorPanel, CursPanObj, PaletteState } from "./colorPan.js";

//A tuple specifically for this class
export type CursorPick = {curs:ColorCursor, color:string, panobj:CursPanObj}
type EditorState = {ps:PaletteState, cs:ColorState, out:{N:number, curs:number[]}};

class ColorPicker{
	x:number;y: number; w: number; h: number;  colorN:number;
	gui=new ButtonGroup(1); 
	colorOutputs:Button[]=[];
	edi:ColorWheelEdi;
	colorPan:CursorPanel;
	buts: { back: Panel; crtcurs: Button; crttwins: Button; crtrange: Checkbox; rangenum: NumSlider; stripmode?: Switcher; valSlider: Slider;saveout:Button ;save:Button ;load:Button };
    curspicks:CursorPick[]=[];
	selectC:{c:CursorPick,i:number} = {c:null,i:-1};
	sizes;
	private colorUser:ColorUser = null;
	colors:string[]=[];
	constructor({ x = 0, y = 0, w = 0, h = 0, colorN = 0, clrs=null }: { x?: number; y?: number; w?: number; h?: number; colorN?: number; clrs?:any} = {}){
		this.edi = new ColorWheelEdi(this.gui,this);
        this.colorPan = new CursorPanel(this.gui,this);
		
		let  picker=this;
		this.buts = {
			back:new Panel(this.gui,x,y,w,h,  2, 0, 0),	//Background panel
			crtcurs:new Button({ par: this.gui,  }),
			crttwins:new Button({ par: this.gui,  }),
			crtrange:new Checkbox({ par: this.gui,}),
			rangenum:new NumSlider({ par: this.gui, maxNum: 10 , val: .5, drawText:true}),
			stripmode:new Switcher({
				par: this.gui, posN: 2, valFun: (v: any) => {
					picker.edi.stripMode = !picker.edi.stripMode;
					if (picker.edi.stripMode)
						picker.edi.whToStrip();
					else
						picker.edi.stripToWh();
					picker.edi.redraw();
				}
				}),
			valSlider: new Slider( { par: this.gui,  val: 1, 
				valFun: (v: number) => { if(picker.selectC.c)picker.selectC.c.curs.changePos(undefined, undefined, v, true); picker.renewCursClrs(); } }),
			saveout:new Button({ par: this.gui,  }),
			save:new Button({ par: this.gui, msclick:()=>{saveFile(picker.createEditorState(),'clrs.json');} }),
			load:new Button({ par: this.gui, msclick:()=>{loadJSON('clrs.json',extractJSON)}}),
		}
		this.initPos(x,y,w,h);

		this.buts.crtcurs.msclick = (mx: any,my: any,rmb: any)=>{if(picker.selectC.c)picker.createCursor(1,1,1,{par:picker.selectC.c,type:"simple"});}
		this.buts.crttwins.msclick = (mx: any,my: any,rmb: any)=>{
			if(!picker.selectC.c)return;
			let targ = picker.selectC.c, newc = picker.createCursor(1,1,1);
			picker.createCursor(1,1,1,{par:newc,type:"twin",targ:targ});
		}
		this.buts.saveout.msclick = (mx,my) => {console.log('['+picker.getColors().reduce((a,b)=>a+"'"+b.toString()+"',",'')+']')}
		this.buts.valSlider.drawMe=function(ctx){
			drawColorStrip(ctx,this.x,this.y,this.w,this.h,(a,r)=>((picker.selectC.c)?HSVtoRGB(hsvSet({ hsv: picker.selectC.c.curs.pos, v:a/6.28+.01 })):RGB.grey));
			ctx.fillStyle=this.val>.5?'#000000':'#ffffff';
			ctx.fillRect(this.x+this.val*(this.w)-2,this.y,4,this.h);
		}

		if(clrs)this.initDraw(clrs);
	   
	   this.createCursor(1,1,1);
	   this.selectCursorInd(0);
	   this.renewCursClrs();

	   if(colorN)this.setOutput(colorN);

	   function extractJSON(json:EditorState){
		   let cpicks=picker.loadFromEditorState(json);
	   }

	   this.buts.load.mmsclick(0,0,false);
	}

	// draw(ctx: CanvasRenderingContext2D){
	// 	if(this.gui.active)this.gui.drawButtons(ctx);
	// }
	initPos(x,y,w,h){
		let off=mmax(w*.01,2),ww=w-2*off,hh=h/2,whh=mmin(ww,hh), buth=mmax(h/30,20);
		const S=this.sizes={ww:ww,butw:(ww-off*4)/5,wheelw:whh,sly:whh+off*2,slh:buth,buty:whh+buth+off*3,buth:buth,crad1:buth/2,
			panx:off,pany:whh+buth*2+off*4,panw:ww,panh:h-whh-off*6-buth*4,outw:mmin(ww/this.colorN*.8,buth),outy:h-off-buth,outh:buth,
			off:off, shdws:buth>30?1:0}
		this.x=x;this.y=y;this.h=h;	this.w=w;
		this.buts.back.setPos({x, y, w, h,});
		this.buts.crtcurs.setPos({x: x + S.off, y: y + S.buty, w: S.butw, h: S.buth, crad: S.crad1, z: 0, shadow: S.shdws});
		this.buts.crttwins.setPos({x: x + S.butw * 1.1 + S.off, y: y + S.buty, w: S.butw, h: S.buth, crad: S.crad1, z: 0, shadow: S.shdws});
		this.buts.crtrange.setPos({ x: x + S.butw * 2.2 + S.off, y: y + S.buty, w: S.butw, h: S.buth, z: 0, crad: S.crad1, shadow: S.shdws });
		this.buts.rangenum.setPos({ x: x + S.butw * 3.3 + S.off, y: y + S.buty, w: S.buth, z: 0,shadow:S.shdws });
		this.buts.stripmode.setPos({ x: x + w - S.buth - S.off, y: y + S.buty, w: S.buth, h: S.buth, z: 0, shadow: S.shdws});
		this.buts.valSlider.setPos({x: x + S.off, y: y + S.sly, w: w - 2 * S.off, h: S.slh, z: 0, shadow: S.shdws});
		this.buts.saveout.setPos({x: x + S.off, y: y + h - S.off - S.buth, w: S.outw, h: S.buth, crad: mmin(S.buth,S.outw)/2, z: 0, shadow: S.shdws});
		this.buts.save.setPos({x: x + S.off, y: y + h - S.off - S.buth*2, w: S.butw, h: S.buth, crad: mmin(S.buth,S.outw)/2, z: 0, shadow: S.shdws});
		this.buts.load.setPos({x: x + S.off + S.butw, y: y + h - S.off - S.buth*2, w: S.butw, h: S.buth, crad: mmin(S.buth,S.outw)/2, z: 0, shadow: S.shdws});
		this.initOutPos();

		this.x=x;this.y=y;this.w=w;this.h=h;
		this.edi.initPos(x+(this.w-this.sizes.wheelw)/2,y+this.sizes.off,this.sizes.wheelw);
		this.colorPan.initPos(x+ this.sizes.panx,y+this.sizes.pany,this.sizes.panw,this.sizes.panh);
	}
	initOutPos(){
		for(let i=0;i<this.colorN;i++)
			this.colorOutputs[i].setPos({x: this.x + (this.sizes.ww - this.sizes.outw) / this.colorN * (i + 0.5) + this.sizes.off + this.sizes.outw * 0.5, 
				y: this.y + this.sizes.outy, w: this.sizes.outw, h: this.sizes.outh, crad: 0, z: 0, shadow: this.sizes.shdws});
		}
	initDraw(clrs){
		this.buts.crtcurs.drawAllCanv((self,ctx,ind)=>{drawRoundRect(ctx,0,0,self.crad,self.w,self.h,clrs.butbk[ind]);drawShape(ctx,self.h,self.h,SHAPES.plus,clrs.butpic[ind],.4,.15,.7,.1);},true);
		this.buts.crttwins.drawAllCanv((self,ctx,ind)=>{drawRoundRect(ctx,0,0,self.crad,self.w,self.h,clrs.butbk[ind]);drawShape(ctx,self.h,self.h,SHAPES.plus,clrs.butpic[ind],.15,.25,.5,.1);drawShape(ctx,self.h,self.h,SHAPES.plus,clrs.butpic[ind],.75,.25,.5,-.2);},true);
		this.buts.crtrange.drawAllCanv((self,ctx,ind)=>{drawRoundRect(ctx,0,0,self.crad,self.w,self.h,clrs.butbk[ind]);drawShape(ctx,self.w,self.h*.2,SHAPES.rect,clrs.butpic[ind],.15,2,.7,.1);},true);
		this.buts.saveout.drawAllCanv((self,ctx,ind)=>{drawRoundRect(ctx,0,0,self.crad,self.w,self.h,clrs.butbk[ind]);drawShape(ctx,self.w,self.h/10,SHAPES.rect,clrs.butpic[ind],.1,5,.8,-.1);
		drawShape(ctx,self.w,self.h/10,SHAPES.rect,clrs.butpic[ind],.1,3,.8,-.11);drawShape(ctx,self.w*.9,self.h/10,SHAPES.rect,clrs.butpic[ind],.15,7,.8,-.1);},true);
		this.edi.initDraw();
		this.colorPan.initDraw();
	}
	setOutput(N:number){
		this.colorN=N;
		for(let co of this.colorOutputs)
			this.gui.deleteButton(co);
		this.colorOutputs = [];
		let picker=this;
		for(let i=0;i<N;i++){
			this.colors[i]="#ffffff";
			let but=new Button({ par: this.gui });
			but.msover =but.msdown = function(x,y,rmb){
				if(rmb){
					this.props.cursor = this.props.prev;
					picker.renewCursClrs();
				}else
					if(MOUSE.mouseDown){
						if(picker.selectC && this.props.cursor != picker.selectC.c){
							this.props.prev = this.props.cursor;
							this.props.cursor = picker.selectC.c;
							picker.renewCursClrs();
						}
					}
			}
			but.props.cursor=this.curspicks[0];
			but.props.prev=this.curspicks[0];
			but.setLabel(1,this.colorUser.labels[i] || "_");
			but.drawMe=function(ctx){
				ctx.fillStyle="#000000";
				ctx.moveTo(this.x+this.w/2,this.y+this.h);
				ctx.lineTo(this.x+this.w*1.3,this.y+this.h*.75);
				ctx.lineTo(this.x-this.w*.3,this.y+this.h*.75);
				ctx.fill();
				ctx.fillRect(this.x,this.y,this.w,this.h*.75);
				ctx.fillStyle=this.props.cursor.color;
				ctx.fillRect(this.x+2,this.y+this.h*.75,this.w-4,-this.h*.75+17-((picker.selectC.c==this.props.cursor)?15:10));
			};
			this.colorOutputs.push(but);
		}
	}

    createCursor(h: number,s: number,v: number, other:any={}):CursorPick{
		var c:CursorPick = {curs:new ColorCursor(new HSV(h,s,v)),color:'#ffffff', panobj:null};
		let pano = this.colorPan.addPanObj(c,other);
		c.panobj=pano;
		this.curspicks.push(c);
		this.edi.addCObj(c);
		this.selectCursor(c);
		this.renewCursClrs();
		return c;
	}
    setSelCursor(ang: number,rad: number){
		if(!this.selectC.c)return;
		this.selectC.c.curs.changePos(ang/6.28,rad, undefined, true);
		this.renewCursClrs();
    }
    selectCursor(c:CursorPick){ this.selectCursorInd(this.curspicks.indexOf(c)); }
    selectCursorInd(ind:number){ this.selectC.i=ind;this.selectC.c=this.curspicks[ind]; this.buts.valSlider.val=this.selectC.c.curs.pos.v; }
	deleteCursor(c:CursorPick , ci=this.curspicks.indexOf(c), deleteFirst=false){
		if(ci==0 && !deleteFirst)return;
		if(ci<0)throw new Error('delete cursor err');
		let delcs:ColorCursor[]=[], ths=this;
		c.curs.collectOutCursors(delcs);
		for(let cc of delcs)
			delCurs(this.curspicks[arrFind(this.curspicks,a=>(a.curs==cc))]);
		function delCurs(c:CursorPick){
			c.curs.deleteMe();
			ths.curspicks.splice(ci,1);
			if(ths.selectC.i>ci)ths.selectC.i--;
			if(ths.selectC.i==ci)ths.selectC={c:null,i:-1}//ths.selectCursorInd(0);
			ths.edi.delCObj(c);
			ths.colorPan.deletePanObj(c.panobj);
			for(let o of ths.colorOutputs){
				if(o.props.cursor==c)o.props.cursor=ths.curspicks[0];
				if(o.props.prev==c)o.props.prev=ths.curspicks[0];
			}
		}
	}
	renewCursClrs(){
		for(var c of this.curspicks)
			c.color=c.curs.getClr();
		if(this.colorUser)this.colorUser.changeColors(this.getColors());		
	}
	getColors(){
		for(var i=0;i<this.colorOutputs.length;i++)this.colors[i]=this.colorOutputs[i].props.cursor.color;
		return this.colors;
	}
	addColorUser(user:ColorUser){
		this.colorUser = user;
		this.setOutput(user.numOfColors);
	}
	createEditorState():EditorState{
		let es:EditorState = {
			cs:createColorStateObj(this.curspicks[0].curs),
			ps:this.colorPan.createPaletteStateObj(this.curspicks),
			out:{N:this.colorN, curs:[]}
		}
		for(let o of this.colorOutputs)
			es.out.curs.push(this.curspicks.indexOf(o.props.cursor));
		return es;
	}
	loadFromEditorState(es:EditorState):CursorPick[]{
		this.deleteCursor(this.curspicks[0],0,true);	//Delete all cursors!
			// this.edi.delCObj(cp);
		let curspicks:CursorPick[]=[];
		let ccurs:ColorCursor[] = cursorsFromColorState(es.cs);
		for(let cc of ccurs)
			curspicks.push({curs:cc, color:cc.getClr() , panobj:null});
		let cursopanos:CursPanObj[]=this.colorPan.loadPaletteStateObj(es.ps,curspicks);
		// for(let i=0;i< curspicks.length;i++)
		// 	curspicks[i].panobj = cursopanos[i];
		this.curspicks=curspicks;
		for(let cp of this.curspicks)
			this.edi.addCObj(cp);
		this.setOutput(es.out.N);
		for(let i=0;i<this.colorOutputs.length;i++)
			this.colorOutputs[i].props.cursor = this.curspicks[es.out.curs[i]];
		this.initOutPos();
		this.renewCursClrs();
		return curspicks;
	}

	activate(val: boolean){	this.gui.active=val;};

	static prisms=[PRISM.lineRev, PRISM.rybAdobe,PRISM.rybRev];							//not in use for now
	static wheels = [WHEEL.basic,WHEEL.constIntens,WHEEL.spiral,WHEEL.triangles];		//not in use for now
}

//parent objects, which use colors. Picker will give colors to the method and obj must redraw all, using new clrs
interface ColorUser{
	changeColors(clrs:string[]):void;
	numOfColors:number;
	labels:string[];	
}

export {ColorPicker, ColorUser}
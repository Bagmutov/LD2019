import { isRightMB, drawCircle, drawLine, drawRoundRect, drawTextBox } from "./tech.js";
import { pow2, mmax, mmin, arrRemAll, arrFind, mabs, dist2, arrSortOne, dist } from "./math.js";

class BUT_GLOB{
	static allGroups:ButtonGroup[] = [];
	static mouseFocusBut:Button=null;
	static msOverTopDraw:Button = null;
	static shiftOn=false;
	static readyLabel:Label = null;
	static activeLabel:Label = null;
	static fontSize:number = 15;
	private static lopacity:number=0;
	private static label={x:0,y:0,vx:0,vy:0,w:50,h:20,text:''};
	static drawAll(ctx:CanvasRenderingContext2D){
		for(let g of this.allGroups)
			g.drawButtons(ctx);
		if(this.msOverTopDraw && this.msOverTopDraw.visible)
			this.msOverTopDraw.draw(ctx);
		this.drawLabel(ctx);
	}
	static drawLabel(ctx,maxx=window.innerWidth,maxy=window.innerHeight){
		if(this.activeLabel)this.lopacity=mmin(this.lopacity+.1,1);
		else this.lopacity=mmax(this.lopacity-.1,0);
		if(this.lopacity==0){this.label.x=MOUSE.mx;this.label.y=MOUSE.my;this.label.vy=0;this.label.vx=0;}
		else {
			let tx = mmax(0,mmin(maxx-this.label.w,MOUSE.mx)), ty= mmax(0,mmin(maxy-this.label.h,MOUSE.my-40));
			if(dist(tx-this.label.x,ty-this.label.y)>5){
				this.label.vx+=(tx-this.label.x)*.1;
				this.label.vy+=(ty-this.label.y)*.1;
			}
			this.label.vx*=.6;
			this.label.vy*=.6;
			this.label.x+=this.label.vx;
			this.label.y+=this.label.vy;
		}
			let op = (~~(this.lopacity*0xff)).toString(16); if(op.length==1)op='0'+op;
			drawTextBox(ctx,this.label.x,this.label.y,10,this.label.w,this.label.h,this.label.text,15,{boxclr:'#ffffff'+op,textclr:'#000000'+op})
	}
	static setActive(l:Label){
		this.activeLabel=l;
		this.label.w=l.w;
		this.label.h=l.h;
		this.label.text=l.text;
	}
}
export  const MOUSE = {mx:0, my:0, mouseDown:false};

window.addEventListener('mousedown',mouseDownButton);
window.addEventListener('mouseup',mouseUpButton);
window.addEventListener('mousemove',mouseMoveButton);
window.addEventListener('keydown',keyDownButton);
window.addEventListener("mousewheel", mouseWheelButton, false);// IE9, Chrome, Safari, Opera
window.addEventListener("DOMMouseScroll", mouseWheelButton, false);// Firefox
// window.addEventListener("dblclick", );

//button state: 0 - mouse out or in&pressed on oth but, 1 - mouse in, unpressed, 2 - mouse in, pressed on this but.

function keyDownButton(e){
	// console.log(e);
	for(var g of BUT_GLOB.allGroups)
		if(g.active){
			for(var hk of g.hotKeys)
				if(hk.k==e.key)hk.b.mmsclick(e.clientX,e.clientY,isRightMB(e));
		}
}
	// let brek=false;
	// 				brek=true;
	// 		if(brek)break;
function mouseDownButton(e){
	MOUSE.mouseDown=true;
	for(var g of BUT_GLOB.allGroups)
		if(g.active){
			// g.stopChanges();		//deprecated system
			for(var b of g.butlist)
				if(b.inMask(e.clientX,e.clientY)){
					BUT_GLOB.mouseFocusBut=b;
					b.mmsdown(e.clientX,e.clientY,isRightMB(e));
					return;
				}
		}
}
function mouseUpButton(e){
	MOUSE.mouseDown=false;
	if(BUT_GLOB.mouseFocusBut)BUT_GLOB.mouseFocusBut.mmsup(e.clientX,e.clientY,isRightMB(e));
	// for(var g of allGroups)
	// 	if(g.active){
	// 		g.stopChanges();
	// 		for(var b of g.list)
	// 			if(mouseFocusBut==b)
	if(!BUT_GLOB.mouseFocusBut)return;
	let b = BUT_GLOB.mouseFocusBut
	if(b.inMask(e.clientX,e.clientY))
		b.mmsclick(e.clientX,e.clientY,isRightMB(e));
		// }
	BUT_GLOB.mouseFocusBut=undefined;
}
function mouseMoveButton(e){
	BUT_GLOB.shiftOn=e.shiftKey;
	MOUSE.mx=e.clientX;
	MOUSE.my=e.clientY;
	// BUT_GLOB.msOverTopDraw=null;
	for(var g of BUT_GLOB.allGroups)
		if(g.active){
			for(var b of g.butlist)
				if(b.inMask(e.clientX,e.clientY)){
					b.mmsover(e.clientX,e.clientY,isRightMB(e));
					if(b.label)
						b.label.beginTimeout();
					if(b.msOverToTop && (!BUT_GLOB.msOverTopDraw || BUT_GLOB.mouseFocusBut!=BUT_GLOB.msOverTopDraw))BUT_GLOB.msOverTopDraw=b;
					// if(b.state==0){
					// 	if(!MOUSE.mouseDown){b.state = 1;}
					// 	else 
					// 		if(mouseFocusBut==b)
					// 			b.state=2;
					// }
				} else {
					// b.state=0; 
					b.mmsout(e.clientX,e.clientY,isRightMB(e));
					if(b.label==BUT_GLOB.readyLabel)
						BUT_GLOB.readyLabel=null;
					if(b.label==BUT_GLOB.activeLabel)
						BUT_GLOB.activeLabel=null;
				}
		}
	if(BUT_GLOB.mouseFocusBut){BUT_GLOB.mouseFocusBut.mmsmove(e.clientX,e.clientY,isRightMB(e));}
}
function mouseWheelButton(e){
    var delta =  (e.wheelDelta/120 || -e.detail/3);
	for(var g of BUT_GLOB.allGroups)
		if(g.active){
			for(var b of g.butlist)
				if(b.inMask(e.clientX,e.clientY))
					b.mmswheel(e.clientX,e.clientY,delta);
		}
}


class ButtonGroup{
	constructor(public z:number=0){
		BUT_GLOB.allGroups.push(this);
		arrSortOne(BUT_GLOB.allGroups,v=>v.z);
		arrSortOne(BUT_GLOB.allGroups,v=>v.z,true);
	}
	butlist:Button[] = [];
	displaylist:Panel[] = [];
	hotKeys:{k:string,b:Button}[] = [];
	active:boolean = true;

	drawButtons(cctx){
		for( var i=this.displaylist.length-1; i>=0; i-- ){
			var p = this.displaylist[i];
			if(p.visible&&(BUT_GLOB.msOverTopDraw!=p||!BUT_GLOB.msOverTopDraw.msOverToTop)) p.draw(cctx);
		}
		// if(BUT_GLOB.mouseOverBut && BUT_GLOB.mouseOverBut.msOverToTop && BUT_GLOB.mouseOverBut.visible) BUT_GLOB.mouseOverBut.draw(cctx);
	}
	sortButtons(){// actually only one pass up and one down.. Not complete sort
		arrSortOne(this.butlist,v=>v.z);
		arrSortOne(this.butlist,v=>v.z,true);
		arrSortOne(this.displaylist,v=>v.z);
		arrSortOne(this.displaylist,v=>v.z,true);
	}
	addPanel(pan:Panel):Panel{
			this.displaylist.push(pan);
			this.sortButtons();
		return pan;
	}
	addButton(but:Button):Button{
			this.butlist.push(but);
			this.sortButtons();
		return but;
	}
	deleteButton(but:Button){
			var i=-1;
			while(++i<this.hotKeys.length)
			if(this.hotKeys[i].b==but)this.hotKeys.splice(i,1);
			this.butlist.splice(this.butlist.indexOf(but),1);
			this.displaylist.splice(this.displaylist.indexOf(but),1);
			if(BUT_GLOB.mouseFocusBut==but)BUT_GLOB.mouseFocusBut=null;
			but.deleteMe();
	}
	addHotKey(but, key){
		this.hotKeys.push({k:key,b:but});
	}
}

const BUT_CLR={
	 panback:"#aaaaaa",
	 back:["#888888","#999999","#555555"],
	 line:'#000000',
	 shdw:'#000000',
	 text:'#000000',
	 numsl:'#ab3fa2',
	 swtch:'#dab4ac',
}
type AllClrs={panback:string;back:string[],shdw:string,line:string,text:string};
type ButInputs = { par: ButtonGroup; x?: number; y?: number; w?: number; h?: number; crad?: number; z?: number; shadow?: number; msclick?: ClickFun; canvN?:number; props?:any;
					val?: number; valFun?: ValFun; drawText?: boolean; maxNum?: number; posN?: number; canvFirst?:boolean; lines?:string[];
					lstTop?:number;lstBot?:number;fontSize?:number, valmult?:number, sideOff?:number};
class Panel{
	// static colors=["#777777","#000000",'#000000'];	//color for back, lines and shadow
	cntrx:number=.5;	cntry:number=.5; //position of center of button. Change Manually
	color:AllClrs=BUT_CLR;//{back:BUT_CLR.back[0],shdw:BUT_CLR.shdw,line:BUT_CLR.line,text:BUT_CLR.text};
	visible:boolean=true;
	canv:HTMLCanvasElement[]=[];	//canvases
	ctx:CanvasRenderingContext2D;
	canvFirst:boolean = false;
	label:Label = null;
	msOverToTop:boolean=false;
	constructor(public par:ButtonGroup, public x:number=0, public y:number=0, public w:number=0, public h:number=0,
				public z:number=0,public crad:number=0,public shadow:number=0, public canvN:number =1, public props:any={}){//props are	just for anything if needed
		par.addPanel(this);
		this.setPos({x,y,w,h,z,crad,shadow});
	}
	setPos({ x = this.x, y = this.y, w = this.w, h = this.h||w, z = this.z, crad = this.crad, shadow = this.shadow }: { x?: number; y?: number; w?: number; h?: number; z?: number; crad?: number; shadow?: number; } = {}){
		this.x=x;this.y=y;this.w=w;this.h=h;this.z=z;this.crad=crad;this.shadow=shadow;
		if(w*h>0)this.crtAllCanv(w,h);
	}
	protected _draw(ctx){
		// ctx.shadowOffsetX = ctx.shadowOffsetY = this.shadow;//()?[2,1.5,-1][this.state]:0;
		ctx.beginPath();
		ctx.fillStyle = this.color.panback;
		ctx.strokeStyle=this.color.line;
		if(!this.canvFirst)this.drawMe.call(this,ctx);
		ctx.drawImage(this.canv[0],this.x,this.y);
		if(this.canvFirst)this.drawMe.call(this,ctx);
	}
	get draw(){return this._draw}
	drawMe:(ctx:CanvasRenderingContext2D)=>void = ButDrawMe.drawMeRoundRect;
	crtAllCanv(w=this.w,h=this.h){
		for (let i = 0; i < this.canvN; i++) {
			this.canv[i]=document.createElement('canvas');
			this.canv[i].width=w;//+(this.shadow?6:0);
			this.canv[i].height=h;//+(this.shadow?6:0);
			// if(this.shadow)	{let ctx = this.canv[i].getContext('2d'); ctx.shadowOffsetX = ctx.shadowOffsetY = this.shadow; ctx.shadowColor=this.color.shdw;}
		}
		this.ctx=this.canv[0].getContext('2d');
	}
	drawAllCanv(drawFun:(self:Panel,ctx:CanvasRenderingContext2D,ind:number)=>void, delDrawme=false){
		if(delDrawme)this.drawMe=(ctx)=>{};
		for (let i = 0; i < this.canvN; i++){
			this.canv[i].getContext('2d').clearRect(0,0,this.canv[i].width,this.canv[i].height);
			drawFun(this,this.canv[i].getContext('2d'),i);
		}
	}
	setLabel(time:number,text:string,getText:()=>string=null){
		this.label=new Label(time,text,getText);
	}
}


type ClickFun=(x:number,y:number,rmb:boolean)=>void;
type WheelFun=(x:number,y:number,delta:number)=>void;

class Button extends Panel{
	// static colors=["#888888","#999999","#777777",'#000000','#000000'];	//one color for each state, lines and shadow
	state:number=0;	
	constructor({ par, x=0, y=0, w=0, h=0, z = 0, crad = 10, shadow = 0, msclick =null, canvN=3,canvFirst=false,props={}}: ButInputs){
			super(par, x, y, w, h, z, crad, shadow,canvN,props);
			this.canvFirst = canvFirst;
			// this.color.back=BUT_CLR.back;
			this.msclick=msclick;
			par.addButton(this);
			// this.ctx.shadowColor=this.color[4];

	}
	inMask(x:number,y:number):boolean{
		x=mabs(x-(this.x+this.cntrx*this.w)); y=mabs(y-(this.y+this.cntry*this.h));
		if(x>this.w/2 || y>this.h/2)return false;
		x = x-this.w/2+this.crad; y = y-this.h/2+this.crad;
		return !(x>0 && y>0 && dist2(x,y)>pow2(this.crad));
	};
	protected _draw(ctx){
		ctx.shadowOffsetX = ctx.shadowOffsetY = (this.shadow)?[2,1.5,-1][this.state]*this.shadow:0;//this.shadow*(2-this.state);//
		ctx.shadowColor=this.color.shdw;
		ctx.beginPath();
		ctx.fillStyle = this.color.back[this.state];
		ctx.strokeStyle=this.color.line;
		if(!this.canvFirst)this.drawMe.call(this,ctx);
		ctx.drawImage(this.canv[this.canvN==1?0:this.state],this.x,this.y);
		if(this.canvFirst)this.drawMe.call(this,ctx);
	}
	get mmsclick(){console.log(this);
	return this._msclick};
	protected _msclick:ClickFun = (mx,my,rmb)=>{this.state=1;if(this.msclick)this.msclick(mx,my,rmb);}
	msclick:ClickFun=null;
	get mmsover(){return this._msover};
	protected _msover:ClickFun = (mx,my,rmb)=>{
		if(this.state==0)
			if(!MOUSE.mouseDown) this.state = 1;
			else if(BUT_GLOB.mouseFocusBut==this) this.state=2;
		if(this.msover)this.msover(mx,my,rmb);}
	msover:ClickFun=null;
	get mmsout(){return this._msout};
	protected _msout:ClickFun = (mx,my,rmb)=>{this.state=0; if(this.msout)this.msout(mx,my,rmb);}
	msout:ClickFun=null;
	get mmsdown(){return this._msdown};
	protected _msdown:ClickFun = (mx,my,rmb)=>{this.state = 2;if(this.msdown)this.msdown(mx,my,rmb);}
	msdown:ClickFun=null;
	get mmsup(){return this._msup};
	protected _msup:ClickFun = (mx,my,rmb)=>{if(this.msup)this.msup(mx,my,rmb);}
	msup:ClickFun=null;
	get mmsmove(){return this._msmove};
	protected _msmove:ClickFun = (mx,my,rmb)=>{if(this.msmove)this.msmove(mx,my,rmb);}
	msmove:ClickFun=null;
	get mmswheel(){return this._mswheel};
	protected _mswheel:WheelFun = (mx,my,delta)=>{if(this.mswheel)this.mswheel(mx,my,delta);}
	mswheel:WheelFun=null;
	deleteMe(){this.par=null;}//called when button is being deleted
}
type ValFun = (v:number)=>void;
class Slider extends Button{
	sideOff=0;
	valFun:ValFun;
	_val:number;
	set val(v){this._val=mmax(0,mmin(v,1));};
	get val(){return this._val};
	valmult:number;
	horizontal:boolean;
	maxNum:number;
	get pos(){return mmin(this.maxNum-1,~~(this.val*this.maxNum));}	//discrete representation of val from interval [0,maxNum]
	constructor(inp: ButInputs){
		super(inp);
		let { par, x = 0, y = 0, w = 0, h = 0, z = 0, val = 0, maxNum = 10, valFun = (() => (null)), shadow = 0, crad=0,valmult=1, sideOff=0 }=inp;
		this.val=val; this.valFun=valFun;this.valmult=valmult;this.sideOff=sideOff;
		this.maxNum=maxNum;
		this.horizontal=w>h;
		this.drawMe=(this.horizontal)?ButDrawMe.drawMeHSlider:ButDrawMe.drawMeVSlider;
		this._msdown=function(x,y,rmb){
			this.state=2;
			this.val=(this.horizontal)?(x-this.x-this.sideOff)/(this.w-2*this.sideOff):(y-this.y-this.sideOff)/(this.h-2*this.sideOff);
			this.valFun(this.val);if(this.msdown)this.msdown(x,y,rmb);};
		this._msmove=function(x,y,rmb){
			this.val=(this.horizontal)?(x-this.x-this.sideOff)/(this.w-2*this.sideOff):(y-this.y-this.sideOff)/(this.h-2*this.sideOff);
			this.valFun(this.val);if(this.msmove)this.msmove(x,y,rmb);};
		this._mswheel=function(x,y,d){this.val=this.val+d/20*this.valmult;this.valFun(this.val);if(this.mswheel)this.mswheel(x,y,d);};	
		this._msout = (mx,my,rmb)=>{if(this.state==1)this.state=0; if(this.msout)this.msout(mx,my,rmb);}
		this._msup = (mx,my,rmb)=>{this.state=0; if(this.msup)this.msup(mx,my,rmb);}
	}
	setPos(inp){
		super.setPos(inp);
		let {w, h, sideOff=0}=inp;
		this.horizontal=w>h;
		this.sideOff=sideOff;
		if(this.drawMe == ButDrawMe.drawMeVSlider || this.drawMe == ButDrawMe.drawMeHSlider)		
			this.drawMe=(w>h)?ButDrawMe.drawMeHSlider:ButDrawMe.drawMeVSlider;
	}
}
class NumSlider extends Slider{
	prevMsPos:number;
	textDrawer;
	drawText:boolean=false;
	constructor(inp: ButInputs){
		super(inp);
		let  { par, x = 0, y = 0, w = 0, h = w, z = 0, val = 0, valFun = null, drawText = false, shadow = 0 } =inp;
		this.color.line=BUT_CLR.numsl;
		this.valmult=10/this.maxNum;
		this.drawText=drawText;
		this.drawMe=ButDrawMe.drawMeNumSlider; 
		this._msdown=function(x,y,rmb){this.state=2;this.prevMsPos=y;if(this.msdown)this.msdown(x,y,rmb);};
		this._msmove=function(x,y,rmb){this.val = mmax(0,mmin(1,this.val-.01*(y-this.prevMsPos)*this.valmult));this.prevMsPos=y;this.valFun(this.val);if(this.msmove)this.msmove(x,y,rmb);};
		if(drawText)this.textDrawer = getTextDrawer.call(this,this.w*.6);
	}
	setPos(inp: { x?: number; y?: number; w?: number; h?: number; z?: number; crad?: number; shadow?: number; } = {}){
		super.setPos(inp);
		if(this.drawText)this.textDrawer = getTextDrawer.call(this,this.w*.6);
	}
}
class LineSlider extends NumSlider{
	lines:string[];
	lstTop:number;
	lstBot:number;
	lstTopnow:number=0;
	lstBotnow:number=0;
	fontSize:number;
	valv=0;
	free:boolean=true;
	oldval:number=0;
	constructor(inp: ButInputs){
		super(inp);
		let  { lstTop=null,lstBot=null,fontSize=15, lines=[] } =inp;
		this.lines=lines;
		this.maxNum=lines.length;
		this.valmult=10/this.maxNum;
		this.lstTop=lstTop;
		this.lstBot=lstBot;
		this.fontSize=fontSize;
		this.drawMe=ButDrawMe.drawMeListSlider;
		this.msOverToTop=true;
		this._msdown=function(x,y,rmb){
			this.state=2;this.prevMsPos=y;
			if(this.msdown)this.msdown(x,y,rmb);
			this.free=false;
		};
		this._msup=function(mx,my,rmb){
			this.state=0; if(this.msup)this.msup(mx,my,rmb);
			this.free=true;
		};
		
	}
	setPos(inp: { x?: number; y?: number; w?: number; h?: number; z?: number; crad?: number; shadow?: number; lstTop?:number,lstBot?:number,fontSize?:number} = {}){
		super.setPos(inp);
		let {lstTop=null,lstBot=null,fontSize=15} = inp;
		this.lstTop=lstTop;
		this.lstBot=lstBot;
		this.fontSize=fontSize;
	}
}
class Checkbox extends Button{
	checked=false;
	radGr:RadioGroup = null;
	constructor(inp: ButInputs){
		super(inp);
		let { par, x = 0, y = 0, w = 0, h = 0, z = 0, crad = 0, shadow = 0 }=inp;
		this._msclick = function(mx,my,rmb){ this.switch();this.state=this.checked?2:1; if(this.msclick)this.msclick(mx,my,rmb);};
		this._msout = function(mx,my,rmb){ this.state=this.checked?2:0; if(this.msout)this.msout(mx,my,rmb);};
		// this._draw = function(ctx){
		// 	ctx.fillStyle = this.color[this.state];
		// 	ctx.shadowColor = 'black';
		// 	ctx.shadowOffsetX = 2-this.state;
		// 	ctx.shadowOffsetY = 2-this.state;
		// 	ctx.beginPath();
		// 	ctx.strokeStyle="#000000";
		// 	ctx.drawImage(this.canv[this.state],this.x,this.y);
		// 	this.drawMe(ctx);
		// 	if(this.checked){
		// 			ctx.lineStyle="#000000";ctx.lineWidth=1;ctx.stroke();
		// 	}
		// };
	}
	addToRadio(radGr:RadioGroup){
		this.radGr = radGr;
		this._msclick = function(mx,my,rmb){this.radGr.switchOn(this);this.state=this.checked?2:1; this.check(); if(this.msclick)this.msclick(mx,my,rmb);};
		this.deleteMe = function(){this.radGr.remove(this);this.par=null;}
	}
	switch(){this.checked=!this.checked;};
	check(){this.checked=true;this.state=2;};
	uncheck(){this.checked=false;this.state=0;};
}
class Switcher extends Button{
	pos=0;
	posN:number;
	valFun:ValFun;
	constructor(inp: ButInputs){
		super(inp);
		let { par, x = 0, y = 0, w = 0, h = 0, z = 0, posN = 3, valFun = ()=>{}, shadow = 0 }=inp;
		this.color.line=BUT_CLR.swtch;
		this.posN=posN; this.valFun=valFun;
		this._msclick = function(mx,my,rmb){this.state=1; this.switch(rmb?-1:1);this.valFun(this.pos); if(this.msclick)this.msclick(mx,my,rmb);};
		this.drawMe=ButDrawMe.drawMeSwitcher;
	}
	switch(dir){this.pos=(this.pos+dir+this.posN)%this.posN;};
}
class RadioGroup{
	list:{ch:Checkbox, label:string}[]=[];
	pos:number=-1;
	label:string;
	constructor(members:{ch:Checkbox,l:string}[]=[]){
		for(let m of members)this.add(m.ch,m.l);
	}
	add(ch:Checkbox, label:string=''){
		if(ch.radGr)throw new Error('Checkbox already in radio group!');
		this.list.push({ch:ch, label:(label||(this.list.length+''))});
		ch.addToRadio(this);
		// if(this.list.length==1){
		// 	this.pos=0;
		// 	this.switchOn(0);
		// }
	}
	remove(ch:Checkbox){
		let ind = arrFind<any>(this.list,(a)=>(a.ch==ch));
		if(ind==undefined)throw new Error('removing error');
		if(this.pos>ind)this.pos--;
		if(this.pos==ind)this.switchOn(0);
		this.list.splice(ind,1);
	}
	switchOn(ch:number|Checkbox){
		if(ch instanceof Checkbox)ch = arrFind(this.list,(a)=>(a.ch==ch));
		if(this.pos>-1)this.list[this.pos].ch.uncheck();
		this.pos=ch;
		this.label = this.list[ch].label;
		this.list[ch].ch.check();
	};
}

//Some methods, specifically for Button.drawMe , as they lack fillStyle & beginPath.
class ButDrawMe{
	static drawMeRect = function(ctx){
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x+this.w, this.y);
		ctx.lineTo(this.x+this.w, this.y+this.h);
		ctx.lineTo(this.x, this.y+this.h);
		ctx.lineTo(this.x, this.y);
		ctx.fill();
	}
	static drawMeCircle = function(ctx){
		ctx.arc(this.x,this.y,this.rad,0,6.29);
		ctx.fill();
	}
	static drawMeRoundRect = function(ctx){
		var x1=this.x+this.crad, x2=this.x+this.w-this.crad, y1=this.y+this.crad, y2=this.y+this.h-this.crad;
		ctx.arc(x1,y1,this.crad,3.14,4.71);
		ctx.arc(x2,y1,this.crad,4.71,6.28);
		ctx.arc(x2,y2,this.crad,0,1.57);
		ctx.arc(x1,y2,this.crad,1.57,3.14);
		ctx.lineTo(this.x,y1);
		ctx.fill();
	}
	static drawMeText = function(ctx, text:string, fontSize=10, clr=this.color.text){
		ctx.fillStyle=this.color.text;
		ctx.font = fontSize+'px sans-serif';
		text+='';
		ctx.fillText(text,this.x+this.w*(.53-text.length*.2),this.y+fontSize*1.2);
	}
	static drawMeHSlider = function(ctx){
		ctx.lineWidth=1;
		ctx.moveTo(this.x+this.sideOff,this.y+this.h/2);
		ctx.lineTo(this.x+this.w-this.sideOff, this.y+this.h/2);
		ctx.stroke();
		ctx.fillRect(this.x+this.sideOff+this.val*(this.w-this.sideOff*2)-3,this.y,6,this.h);
	}
	static drawMeVSlider = function(ctx){
		ctx.lineWidth=1;
		ctx.moveTo(this.x+this.w/2,this.y+this.sideOff);
		ctx.lineTo(this.x+this.w/2, this.y+this.h-this.sideOff);
		ctx.stroke();
		ctx.fillRect(this.x,this.y+this.sideOff+this.val*(this.h-this.sideOff*2)-3,this.w,6);
	}
	static drawMeNumSlider = function(ctx){
		let w=this.w/2;
		drawCircle(ctx,this.x+w,this.y+w,w);
		ctx.lineWidth=(this.drawText)?w/4:w*.8;
		ctx.beginPath();
		ctx.arc(this.x+w,this.y+w,w-ctx.lineWidth/2,0,-6.29*this.val,true);
		ctx.stroke();
		if(this.drawText)this.textDrawer.call(this,ctx,this.pos);
	}
	static drawMeListSlider = function(ctx){
		if(this.free){
			this.val=mmax(0,mmin(1,this.valv*this.valmult+this.val));
			this.valv*=.8;
			this.valv-=(this.val*this.maxNum-.5-this.pos)*.01;
		} else {this.valv=(this.val-this.oldval)/this.valmult*.5; this.oldval=this.val;}
		let i=0, j=0,sc,op;
		this.lstTopnow=mmax(0,mmin(this.lstTopnow+(this.state-.5)*30,this.lstTop));
		this.lstBotnow=mmax(0,mmin(this.lstBotnow+(this.state-.5)*30,this.lstBot));
		op =( ~~(this.lstBotnow/this.lstBot*.5*0xff)).toString(16);if(op.length==1)op='0'+op;
		drawRoundRect(ctx,this.x-this.crad,this.y-this.lstTopnow,this.crad,this.w+this.crad*2,this.lstBotnow+this.lstTopnow,'#ffffff'+op);
		while(++i*this.h<this.lstBotnow && i+this.pos<this.maxNum){
			sc = (3-i*this.h/this.lstBotnow)/3;
			op =( mmin(0xff,~~((1-i*this.h/this.lstBotnow)/1*0xff*2))).toString(16);if(op.length==1)op='0'+op;
			drawTextBox(ctx,this.x+this.w*(1-sc)/2,this.y-(this.val*this.maxNum-this.pos-i-.5)*this.h,this.crad*sc,this.w*sc,this.h*sc,this.lines[(this.pos+i)],this.fontSize*sc,{boxclr:this.color.back[0]+op,textclr:'#000000'+op});
		}
		while(++j*this.h<this.lstTopnow && this.pos-j>=0){
			sc = (3-j*this.h/this.lstTopnow)/3;
			op =( mmin(0xff,~~((1-j*this.h/this.lstTopnow)/1*0xff*2))).toString(16);if(op.length==1)op='0'+op;
			drawTextBox(ctx,this.x+this.w*(1-sc)/2,this.y-(this.val*this.maxNum-this.pos+j-.5)*this.h,this.crad*sc,this.w*sc,this.h*sc,this.lines[(this.pos-j)],this.fontSize*sc,{boxclr:this.color.back[0]+op,textclr:'#000000'+op});
		}
		drawTextBox(ctx,this.x,this.y-(this.val*this.maxNum-this.pos-.5)*this.h,this.crad,this.w,this.h,this.lines[this.pos],this.fontSize,{boxclr:this.color.back[this.state],textclr:'#000000'});
		// console.log(this.pos);
		
	}
	static drawMeSwitcher = function(ctx){
		let w=this.w/2;
		drawCircle(ctx,this.x+w,this.y+w,w);
		ctx.lineWidth=4;
		ctx.beginPath();
		drawCircle(ctx,this.x+w,this.y+w,.8*w*(this.pos+.5)/this.posN,this.color.line)
		ctx.stroke();
		// this.textDrawer.call(this,ctx,~~(this.val*100));
	}
}
class Label{
	w:number=100;h:number=50;
	private timeoutSet:boolean=false;
	constructor(public time:number, public text:string='', public getText:()=>string=null){
	}
	beginTimeout(){
		BUT_GLOB.readyLabel = this;
		if(!this.timeoutSet){setTimeout(this.timeout.bind(this),this.time);
		this.timeoutSet=true;}
	}
	timeout(){
		this.timeoutSet=false;
		if(BUT_GLOB.readyLabel == this){
			if(this.getText)this.text = this.getText();
			this.w = 10+10+this.text.length*BUT_GLOB.fontSize*.5;
			this.h = 20;
			BUT_GLOB.readyLabel = null;
			BUT_GLOB.setActive(this);
		}
	}
}
//some shapes for button drawing
const SHAPES = {
	plus:[[.3,.3],[.3,0],[.7,0],[.7,.3],[1,.3],[1,.7],[.7,.7],[.7,1],[.3,1],[.3,.7],[0,.7],[0,.3]],
	arrowR:[[0,.3],[.6,.3],[.6,0],[1,.5],[.6,1],[.6,.7],[0,.7]],
	play:[[0,0],[1,.5],[0,1]],
	rect:[[0,0],[1,0],[1,1],[0,1]]
}
function getTextDrawer(fontSize:number,text:string=null,clr:string=this.color.text):((ctx:CanvasRenderingContext2D) => void)|((ctx:CanvasRenderingContext2D,text) => void){
	if(!text)return (ctx, text)=>{ButDrawMe.drawMeText.call(this, ctx, text, fontSize, clr);}
	return (ctx)=>{ButDrawMe.drawMeText.call(this, ctx, text, fontSize, clr);}
}


export {ButtonGroup,Panel,Button,Slider, Checkbox, RadioGroup, ButDrawMe as DrawMethods, getTextDrawer, NumSlider,Switcher,LineSlider,SHAPES,BUT_CLR, BUT_GLOB};
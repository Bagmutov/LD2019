import { resize, drawTextBox, drawCircle } from "./tools/tech.js";
import { Button, ButtonGroup, BUT_GLOB, Panel } from "./tools/button.js";
import { PARTICLE_GLOB, ParticleGroup, NUM } from "./particles.js";
import { FACE_CONTROL } from "./wordfaces.js";
import { CONTROL } from "./control.js";
import { ColorPicker, ColorUser } from "./tools/color/colorPickerGUI.js";
import { SOUND } from "./sound.js";
import { sign, mabs } from "./tools/math.js";
import { toHexDouble } from "./tools/color/colorCore.js";

class ClrControl implements ColorUser{
	h:number=.3;
	s:number=.8;
	v:number=0.8;
	th:number=.65;
	ts:number=.8;
	tv:number=1;
	constructor(public picker:ColorPicker){}
	changeColors(clrs: string[]): void {
		this.colors.back = [clrs[0],clrs[1],clrs[2]];
		this.colors.text = clrs[3];
		this.colors.textact = clrs[4];
		this.colors.ptcls = [clrs[5],clrs[6],clrs[7]];
	}
	step(){
		if(this.th){this.h+=sign(this.th-this.h)*.001; if(mabs(this.th-this.h)<.01)this.th=null}
		if(this.ts){this.s+=sign(this.ts-this.s)*.001; if(mabs(this.ts-this.s)<.01)this.ts=null}
		if(this.tv){this.v+=sign(this.tv-this.v)*.001; if(mabs(this.tv-this.v)<.01)this.tv=null}
		this.picker.curspicks[0].curs.changePos(this.h,this.s,this.v);
		this.picker.renewCursClrs();
	}
	setTarget(th,ts=null,tv=null){this.th=th;this.ts=ts;this.tv=tv;}
	numOfColors: number=8;
	labels: string[]=["back1","back2","back3","text","act_text","partcls1","partcls2","partcls3"];
	colors={text:'#333333',textact:'#9966aa',back:['#ffffff','#222222','#444444'],ptcls:['#ffffff','#999999','#aaaaaa']};
}

export let fMain = <HTMLCanvasElement> document.getElementById('can'), ctx=fMain.getContext('2d');
export let backbackCan = <HTMLCanvasElement> document.getElementById('canbackback'), ctxbb=backbackCan.getContext('2d');
export let backCan = <HTMLCanvasElement> document.getElementById('canback'), ctxb=backCan.getContext('2d');
let backStyle="stars", backInit=true, arr=[], arr2=[], backobj:any={};
resize(fMain);
resize(backCan);
resize(backbackCan);
let gameRunning=true;

window.addEventListener('keydown', keyDown);
initGame();

// let butGr = new ButtonGroup();
let clrPicker:ColorPicker = new ColorPicker();//{x:0,y:0,w:500,h:500}
export let clrCtrl = new ClrControl(clrPicker);
clrPicker.addColorUser(clrCtrl);
console.log('start');

clrPicker.initPos(-10000,0,100,100);
// clrPicker.initPos(0,0,400,400);
clrPicker.initDraw({butbk:['#333333','#555555','#888888'],butpic:['#aabbcc','#bbaacc','#bacbac']});
// clrPicker.activate(false);

gameStep();
// let ptGr = new ParticleGroup(100,200,10,1000);
CONTROL.addLvlWord("start");
// FACE_CONTROL.setActiveWord("ta");


function gameStep(){
	// console.log(clrPicker.cursors[0].dx);
	setTimeout(gameStep, 17);
	if(!gameRunning)return;
	worldStep();

	drawAll();
}

function worldStep(){
	PARTICLE_GLOB.stepAll();
	clrCtrl.step();

}

function drawAll(){
	ctx.clearRect(0,0,fMain.width,fMain.height);
	// vecEditor.drawAll(ctx);
	BUT_GLOB.drawAll(ctx);
	PARTICLE_GLOB.drawAll(ctx);
	FACE_CONTROL.drawAll(ctx);
	drawBack();
}

function drawBack(){
	switch(backStyle){
		case "mess":
			ctxb.fillStyle = clrCtrl.colors.back[0];
			ctxb.fillRect(0,0,backCan.width,backCan.height);
			ctxb.fillStyle = clrCtrl.colors.back[1];
			for(let i=0;i<10;i++)
				ctxb.fillRect(NUM.getRND()*backCan.width,NUM.getRND()*backCan.height,30,30);

		break;
		case "stars":
			if(backInit){
				for(let i=0;i<1000;i++){
					arr[i]={x:(Math.random()-.5)*backCan.width*1.4, y:(Math.random()-.5)*backCan.height*1.4};
					
				}
				backobj={ang:0, hw:backCan.width/2,hh:backCan.height/2};
				backInit=false;
			}
			backobj.ang =(backobj.ang+.0001)%6.28;
			let cos=Math.cos(backobj.ang), sin=Math.sin(backobj.ang);
			ctxbb.fillStyle = clrCtrl.colors.back[0];
			ctxbb.fillRect(0,0,backCan.width,backCan.height);
			ctxbb.fillStyle = clrCtrl.colors.back[2];
			for(let i=1;i<1000;i++)
				ctxbb.fillRect(backobj.hw+arr[i].x*cos+arr[i].y*sin,backobj.hh-arr[i].x*sin+arr[i].y*cos,2,2);
					
			
			ctxb.clearRect(0,0,backCan.width,backCan.height);
			for(let i=0;i<arr2.length;i++){
				ctxb.fillStyle = clrCtrl.colors.back[1]+toHexDouble(arr2[i].op);
				drawCircle(ctxb,arr2[i].x,arr2[i].y,1000/arr2[i].op,clrCtrl.colors.back[1]+toHexDouble(arr2[i].op*.1));
				drawCircle(ctxb,arr2[i].x,arr2[i].y,1*NUM.getRND(),clrCtrl.colors.back[2]+toHexDouble(0xff-2*mabs(arr2[i].op-0x88)));
				arr2[i].op*=.95;
				if(arr2[i].op<.01)arr2.splice(i,1);
			}
			let rnd=Math.random()
			if(rnd<.04){
				if(rnd<.01)
					arr2.push({x:NUM.getRND()*backCan.width, y:NUM.getRND()*backCan.height,op:0xff});
				else
					arr[~~(NUM.getRND()*arr.length)]=({x:NUM.getRND()*backCan.width, y:NUM.getRND()*backCan.height});
			}

		break;
	}
}

function keyDown(e){
	// SOUND.play("test");
	console.log(e.key);
	
	switch(e.key){
		case ' ': gameRunning=!gameRunning; break;
		// case 'a': FACE_CONTROL.makeWave(500,500,10);console.log('wave'); break;
		case "Backspace":
		case "Escape":
			CONTROL.clearWord();
		break;
	}

	if(e.key.length==1 && (e.key>='a' && e.key<='z' || e.key>='A' && e.key<='Z'))
		CONTROL.newKey((e.key.charCodeAt(0)<='Z'.charCodeAt(0))?String.fromCharCode(e.key.charCodeAt(0)+32):e.key);
}

function initGame(){
	NUM.init();
	SOUND.init();
	// SOUND.play('background');
}

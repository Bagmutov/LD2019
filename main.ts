import { resize, drawTextBox } from "./tools/tech.js";
import { Button, ButtonGroup, BUT_GLOB, Panel } from "./tools/button.js";
import { PARTICLE_GLOB, ParticleGroup, NUM } from "./particles.js";
import { WORD_CONTROL } from "./wordfaces.js";
import { CONTROL } from "./control.js";

export let fMain = <HTMLCanvasElement> document.getElementById('can'), ctx=fMain.getContext('2d');
resize(fMain);
let gameRunning=true;

window.addEventListener('keydown', keyDown);
initGame();

let butGr = new ButtonGroup();

let but = new Button({par:butGr, msclick:()=>{count++;}});
but.setPos({x:10,y:10,w:200,h:100});
let pan = new Panel(butGr);
let count =0;
pan.setPos({x:10,y:210,w:200,h:100});
pan.drawMe = function(ctx){
	drawTextBox(ctx, this.x,this.y,this.crad,this.w,this.h,count+'_',30,{});
}//

gameStep();
// let ptGr = new ParticleGroup(100,200,10,1000);
WORD_CONTROL.addWord("start");
WORD_CONTROL.addWord("start");
WORD_CONTROL.addWord("start");
WORD_CONTROL.addWord("star");
WORD_CONTROL.setActiveWord("ta");


function gameStep(){
	// console.log(clrPicker.cursors[0].dx);
	setTimeout(gameStep, 10);
	if(!gameRunning)return;
	worldStep();

	drawAll();
}

function worldStep(){
	PARTICLE_GLOB.stepAll();

}

function drawAll(){
	ctx.clearRect(0,0,fMain.width,fMain.height);
	// vecEditor.drawAll(ctx);
	BUT_GLOB.drawAll(ctx);
	PARTICLE_GLOB.drawAll(ctx);
	WORD_CONTROL.drawAll(ctx);
}


function keyDown(e){
	
	
	switch(e.key){
		case ' ': gameRunning=!gameRunning; break;
		// case 'a': WORD_CONTROL.makeWave(500,500,10);console.log('wave'); break;
	}

	if(e.key>='a' && e.key<='z' || e.key>='A' && e.key<='Z')
		CONTROL.newKey((e.key.charCodeAt(0)<='Z'.charCodeAt(0))?String.fromCharCode(e.key.charCodeAt(0)+32):e.key);
}

function initGame(){
	NUM.init();
}
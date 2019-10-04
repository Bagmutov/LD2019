import { resize, drawTextBox } from "./tools/tech.js";
import { Button, ButtonGroup, BUT_GLOB, Panel } from "./tools/button.js";

let fMain = <HTMLCanvasElement> document.getElementById('can'), ctx=fMain.getContext('2d');
resize(fMain);
let gameRunning=true;

window.addEventListener('keydown', keyDown);


let butGr = new ButtonGroup();

let but = new Button({par:butGr, msclick:()=>{count++;}});
but.setPos({x:10,y:10,w:200,h:100});
let pan = new Panel(butGr);
let count =0;
pan.setPos({x:10,y:210,w:200,h:100});
pan.drawMe = function(ctx){
	drawTextBox(ctx, this.x,this.y,this.crad,this.w,this.h,count+'_',30,{});
}

gameStep();


function gameStep(){
	// console.log(clrPicker.cursors[0].dx);
	if(gameRunning)setTimeout(gameStep, 100);

	worldStep();

	drawAll();
}

function drawAll(){
	// vecEditor.drawAll(ctx);
	BUT_GLOB.drawAll(ctx);
}

function worldStep(){

}

function keyDown(e){

	switch(e.key){
		case ' ': gameRunning=!gameRunning; break;
	}
}
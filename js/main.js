import { resize } from "./tools/tech.js";
import { BUT_GLOB } from "./tools/button.js";
import { PARTICLE_GLOB, NUM } from "./particles.js";
import { WORD_CONTROL } from "./wordfaces.js";
import { CONTROL } from "./control.js";
import { ColorPicker } from "./tools/color/colorPickerGUI.js";
import { SOUND } from "./sound.js";
class ClrControl {
    constructor() {
        this.numOfColors = 10;
        this.labels = [];
        this.colors = { text: '#333333', textact: '#333333', back: ['#ffffff', '#222222'] };
    }
    changeColors(clrs) {
        this.colors.back = [clrs[0], clrs[1]];
        this.colors.text = clrs[2];
        this.colors.textact = clrs[3];
    }
}
export let fMain = document.getElementById('can'), ctx = fMain.getContext('2d');
export let backCan = document.getElementById('canback'), ctxb = backCan.getContext('2d');
resize(fMain);
resize(backCan);
let gameRunning = true;
window.addEventListener('keydown', keyDown);
initGame();
// import {Howl, Howler} from 'howler.js';
// const {Howl, Howler} = require('howler');
// var sound = new Howl({
// 	src: ['sound.mp3']
//   });
//   sound.play();
// let butGr = new ButtonGroup();
let clrPicker = new ColorPicker(); //{x:0,y:0,w:500,h:500}
export let clrCtrl = new ClrControl();
clrPicker.addColorUser(clrCtrl);
console.log('start');
clrPicker.initPos(0, 0, 500, 500);
clrPicker.initDraw({ butbk: ['#333333', '#555555', '#888888'], butpic: ['#aabbcc', '#bbaacc', '#bacbac'] });
// let but = new Button({par:butGr, msclick:()=>{count++;}});
// but.setPos({x:10,y:10,w:200,h:100});
// let pan = new Panel(butGr);
// let count =0;
// pan.setPos({x:10,y:210,w:200,h:100});
// pan.drawMe = function(ctx){
// 	drawTextBox(ctx, this.x,this.y,this.crad,this.w,this.h,count+'_',30,{});
// }//
gameStep();
// let ptGr = new ParticleGroup(100,200,10,1000);
WORD_CONTROL.addWord("start");
WORD_CONTROL.addWord("start");
WORD_CONTROL.addWord("start");
WORD_CONTROL.addWord("star");
WORD_CONTROL.setActiveWord("ta");
function gameStep() {
    // console.log(clrPicker.cursors[0].dx);
    setTimeout(gameStep, 10);
    if (!gameRunning)
        return;
    worldStep();
    drawAll();
}
function worldStep() {
    PARTICLE_GLOB.stepAll();
}
function drawAll() {
    ctx.clearRect(0, 0, fMain.width, fMain.height);
    // vecEditor.drawAll(ctx);
    BUT_GLOB.drawAll(ctx);
    PARTICLE_GLOB.drawAll(ctx);
    WORD_CONTROL.drawAll(ctx);
    drawBack();
}
function drawBack() {
    ctxb.fillStyle = clrCtrl.colors.back[0];
    ctxb.fillRect(0, 0, backCan.width, backCan.height);
    ctxb.fillStyle = clrCtrl.colors.back[1];
    for (let i = 0; i < 10; i++)
        ctxb.fillRect(NUM.getRND() * backCan.width, NUM.getRND() * backCan.height, 30, 30);
}
function keyDown(e) {
    // SOUND.play("test");
    switch (e.key) {
        case ' ':
            gameRunning = !gameRunning;
            break;
        // case 'a': WORD_CONTROL.makeWave(500,500,10);console.log('wave'); break;
    }
    if (e.key >= 'a' && e.key <= 'z' || e.key >= 'A' && e.key <= 'Z')
        CONTROL.newKey((e.key.charCodeAt(0) <= 'Z'.charCodeAt(0)) ? String.fromCharCode(e.key.charCodeAt(0) + 32) : e.key);
}
function initGame() {
    NUM.init();
    SOUND.init();
}
//# sourceMappingURL=main.js.map
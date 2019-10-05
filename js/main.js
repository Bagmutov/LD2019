import { resize, drawTextBox } from "./tools/tech.js";
import { Button, ButtonGroup, BUT_GLOB, Panel } from "./tools/button.js";
import { PARTICLE_GLOB, ParticleGroup, NUM } from "./particles.js";
let fMain = document.getElementById('can'), ctx = fMain.getContext('2d');
resize(fMain);
let gameRunning = true;
window.addEventListener('keydown', keyDown);
initGame();
let butGr = new ButtonGroup();
let but = new Button({ par: butGr, msclick: () => { count++; } });
but.setPos({ x: 10, y: 10, w: 200, h: 100 });
let pan = new Panel(butGr);
let count = 0;
pan.setPos({ x: 10, y: 210, w: 200, h: 100 });
pan.drawMe = function (ctx) {
    drawTextBox(ctx, this.x, this.y, this.crad, this.w, this.h, count + '_', 30, {});
};
gameStep();
let ptGr = new ParticleGroup(100, 200, 10);
function gameStep() {
    // console.log(clrPicker.cursors[0].dx);
    if (gameRunning)
        setTimeout(gameStep, 10);
    worldStep();
    drawAll();
}
function drawAll() {
    ctx.clearRect(0, 0, fMain.width, fMain.height);
    // vecEditor.drawAll(ctx);
    BUT_GLOB.drawAll(ctx);
    PARTICLE_GLOB.drawAll(ctx);
}
function worldStep() {
    PARTICLE_GLOB.stepAll();
}
function keyDown(e) {
    switch (e.key) {
        case ' ':
            gameRunning = !gameRunning;
            break;
    }
}
function initGame() {
    NUM.init();
}
//# sourceMappingURL=main.js.map
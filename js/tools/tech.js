function resize(canvas) {
    canvas.width = window.innerWidth - 1;
    canvas.height = window.innerHeight - 5;
}
function isRightMB(e) {
    var isRightMB;
    e = e || window.event;
    if ("which" in e) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
    else if ("button" in e) // IE, Opera 
        isRightMB = e.button == 2;
    return isRightMB;
}
function testTime(f, N, arg) {
    let tt = (new Date()).getTime();
    for (var k = 0; k < N; k++)
        f(arg);
    return ((new Date()).getTime() - tt);
}
export function drawCircle(ctx, x, y, r, clr = null, stroke = 0) {
    if (clr)
        ctx.fillStyle = ctx.strokeStyle = clr;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.28);
    ctx.lineWidth = stroke;
    if (stroke > 0)
        ctx.stroke();
    else
        ctx.fill();
}
;
export function drawLine(ctx, x1, y1, x2, y2, clr = null, lineW = 1) {
    if (clr)
        ctx.strokeStyle = clr;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineW;
    ctx.stroke();
}
;
export function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, clr = null) {
    if (clr)
        ctx.fillStyle = clr;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fill();
}
;
export function drawRoundRect(ctx, x, y, r, w = ctx.canvas.width, h = ctx.canvas.height, clr = '#000000', corn = [true, true, true, true]) {
    var x1 = x + r, x2 = x + w - r, y1 = y + r, y2 = y + h - r;
    ctx.beginPath();
    if (corn[0])
        ctx.arc(x1, y1, r, 3.14, 4.71);
    else
        ctx.lineTo(x, y);
    if (corn[1])
        ctx.arc(x2, y1, r, 4.71, 6.28);
    else
        ctx.lineTo(x + w, y);
    if (corn[2])
        ctx.arc(x2, y2, r, 0, 1.57);
    else
        ctx.lineTo(x + w, y + h);
    if (corn[3])
        ctx.arc(x1, y2, r, 1.57, 3.14);
    else
        ctx.lineTo(x, y + h);
    // if(corn[0])ctx.lineTo(x,y1); else ctx.lineTo(x,y);
    ctx.fillStyle = clr;
    ctx.fill();
}
export function drawTextBox(ctx, x, y, r, w = ctx.canvas.width, h = ctx.canvas.height, text = '', fontSize, { boxclr = '#ffffff', textclr = '#000000', off = { x: 0, y: 0 } }) {
    drawRoundRect(ctx, x, y, r, w, h, boxclr);
    ctx.fillStyle = textclr;
    ctx.font = fontSize + 'px sans-serif'; //-text.length*.05 w*(.53)
    let i = 0;
    if (typeof text == "string")
        ctx.fillText(text, x + r + off.x, y + h / 2 + fontSize * .25 + off.y, w - 2 * r - off.x);
    else
        for (let txt of text)
            ctx.fillText(txt, x + r + off.x, y + r + fontSize * .75 + off.y + fontSize * (i++), w - 2 * r - off.x);
}
//Here all coords should be in percent of figure: in [0..1]. sxy - starting pos, sc - scale
export function drawShape(ctx, w, h, pts, clr = '#000000', sx = 0, sy = 0, sc = 1, rot = 0) {
    let n = pts.length;
    sx *= w;
    sy *= h;
    w = w * sc;
    h = h * sc;
    ctx = ctx;
    ctx.save();
    ctx.beginPath();
    ctx.translate(w / 2 + sx, h / 2 + sy);
    ctx.rotate(rot);
    ctx.translate(-w / 2 - sx, -h / 2 - sy);
    ctx.moveTo(pts[n - 1][0] * w + sx, pts[n - 1][1] * h + sy);
    for (let i = 0; i < n; i++)
        ctx.lineTo(pts[i][0] * w + sx, pts[i][1] * h + sy);
    ctx.fillStyle = clr;
    ctx.fill();
    ctx.restore();
}
export function saveFile(obj, fileName) {
    var a = document.createElement("a");
    let str = (typeof obj == 'string') ? obj : JSON.stringify(obj, null, ' ');
    var file = new Blob([str], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
export function loadJSON(filename, callback) {
    loadFile(filename, function (s) { callback(JSON.parse(s)); });
}
export function loadFile(filename, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
export { resize, isRightMB, testTime };
//# sourceMappingURL=tech.js.map
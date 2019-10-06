import { drawCircle, drawTextBox } from "./tools/tech.js";
import { fMain, clrCtrl } from "./main.js";
import { NUM } from "./particles.js";
import { dist, arrFind, arrDel, arrRemAll } from "./tools/math.js";
import { toHexDouble } from "./tools/color/colorCore.js";

class Flowing{
    x:number=0;
    y:number=0;
    vx:number=0;
    vy:number=0;
    tx:number=0;
    ty:number=0;
    off:{x:number;  y:number; vx:number; vy:number;}={x:0,y:0,vx:0,vy:0};
    maxOff:number=10;
    acc:number=.5;
    attr:number=.003;
    // maxv:number=.5;

    constructor(x=0,y=0){
        this.setPos(x,y);
    }
    setPos(x,y){
        this.x=x;
        this.y=y;
    }
    addV(vx,vy){
        this.vx+=vx;
        this.vy+=vy;
    }
    setTarget(ttx:number, tty:number){
        this.tx=ttx;
        this.ty=tty;
    }
    generateOff(){
        this.off = {x:(NUM.getRND()-.5)*this.maxOff,y:(NUM.getRND()-.5)*this.maxOff,vx:0,vy:0}
    }
    step(){
        this.x+=this.vx;
        this.y+=this.vy;
        this.vx = this.vx*this.acc - (this.x-this.tx-this.off.x)*this.attr;
        this.vy = this.vy*this.acc - (this.y-this.ty-this.off.y)*this.attr;

    }
}

class Letter extends Flowing{
    rad:number=20;
    active:boolean = false;
    op:string="00";
    opv:number=1;
    private _opac:number = 0x00;
    set opac(v:number){this.op=toHexDouble(v); this._opac=v%0xff;}
    get opac(){return this._opac}

    constructor(public letter:string,x=0,y=0){
        super(x,y);
    }


    stepDraw(ctx:CanvasRenderingContext2D){

        this.step();
        if(this.opv!=0){this.opac+=this.opv; if(this.opac>=0xff||this.opac<=0)this.opv=0;}

        ctx.fillStyle=((this.active)?clrCtrl.colors.textact:clrCtrl.colors.text)+this.op;
        ctx.font = this.rad*2+'px sans-serif';
        ctx.fillText(this.letter, this.x, this.y);

    }
    beginRemoval(){
        this.opv=-5;
    }
    
}
class Word extends Flowing{
    letters:Letter[]=[];
    spacing:number=30;
    constructor(public str:string,x=0,y=0){
        super(x,y);
    }
    addLetter(lt:Letter){
        this.letters.push(lt);
        this.placeLetters();
    }
    setPos(x,y){
        super.setPos(x,y);
        if(this.letters)
            this.placeLetters();
    }
    placeLetters(){
        for(let i=0;i< this.letters.length;i++){
            this.letters[i].setTarget(this.x+i*this.spacing,this.y);
        }
    }
    stepDraw(ctx:CanvasRenderingContext2D){

        this.step();

        for(let i=0;i< this.letters.length;i++)
        this.letters[i].stepDraw(ctx);

    }
}

class WORD_CONTROL{
    static letters:Letter[]=[];
    static offTimer={t:10,lind:0};
    static words:Word[]=[];
    static deadWords:{w:Word,time:number}[] = [];
    static strtAng:number =0;
    static actWord:string="";

    static addWord(str:string){
        let word:Word=new Word(str);
        this.words.push(word);
        this.placeWords();
        for(let i=0;i<str.length;i++){
            let lt=new Letter(str[i],word.x+NUM.getRND()*100-50,word.y+NUM.getRND()*100-50);
            this.letters.push(lt);
            word.addLetter(lt);
        }
    }
    static delWord(word:string){
        let ind = arrFind(this.words,(w)=>(w.str==word));
        if(ind==-1)throw new Error('no word');
        let wo = this.words[ind];
        this.deadWords.push({w:wo,time:1000});
        for(let lt of wo.letters)
            lt.beginRemoval();
        this.words.splice(ind,1);
    }
    static placeWords(){
        let ang = 6.28/this.words.length, i=0;
        for(let w of this.words)
            w.setPos(Math.cos(this.strtAng+ang*(i))*fMain.width/4+fMain.width/2, Math.sin(this.strtAng+ang*(i++))*fMain.height/4+fMain.height/2);
    } 

    static drawAll(ctx){
        if(this.letters.length==0)return;
        this.strtAng=(this.strtAng+.0005)%6.28;
        this.placeWords();
        if(this.offTimer.t--<=0){
            this.offTimer.t=1;
            this.letters[this.offTimer.lind].generateOff();
            this.offTimer.lind=(~~(10*NUM.getRND())+this.offTimer.lind)%this.letters.length;
        }
        for(let wrd of this.words)
            wrd.stepDraw(ctx);
        for(let dwrd of this.deadWords){
            dwrd.w.stepDraw(ctx);
            dwrd.time--;
        }
        arrRemAll(this.deadWords,(dw)=>(dw.time<0));
    }
    static makeWave(x,y,force){
        for(let i=0;i<this.letters.length;i++){
            let lt=this.letters[i],dx=lt.x-x, dy=lt.y-y,d=dist(dx,dy)/force;
            lt.addV(dx/d,dy/d);//lt.tx+
        }
    }
    static setActiveWord(aword:string){
        for(let lt of this.letters)
            lt.active=false;
        for(let ch of aword)
            for(let lt of this.letters)
                if(lt.letter==ch)lt.active=true;
        
    }
}

export{Letter, WORD_CONTROL}
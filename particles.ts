import { drawCircle } from "./tools/tech.js";
import { arrDel } from "./tools/math.js";

class PARTICLE_GLOB{
    static groups:ParticleGroup[]=[];
    static allParticles:Particle[]=[];
    static emptyNodes:number[] = [];

    static addGr(gr:ParticleGroup){
        this.groups.push(gr);
    }

    static drawAll(ctx:CanvasRenderingContext2D){
        for(let gr of this.groups)
            gr.groupDraw(ctx);
    }
    static stepAll(){
        for(let gr of this.groups)
            gr.groupStep();
    }

    static addParticle():Particle{
        if(this.emptyNodes.length>0){
            return this.allParticles[this.emptyNodes.pop()];
        } else {
            if(this.allParticles.length>99999)return;
            let newp = {ind:this.allParticles.length,x:0,y:0,vx:0,vy:0,dir:0,r:10,opac:0xff, p1:0,p2:0};
            this.allParticles.push(newp);
            return newp;
        }
    }
    static delParticle(ind:number){
        this.emptyNodes.push(ind);
    }

        static delGr(gr:ParticleGroup){
            arrDel(this.groups,gr);
        }
}

type Particle = {ind:number,x:number, y:number, vx:number, vy:number, dir:number, r:number, opac:number, p1:number,p2:number};

class ParticleGroup{
    myparticles:number[]=[];
    time:number=0;
    perSum:number=0;
    emitter:{x:number,y:number} = {x:0,y:0};
    constructor(x:number,y:number,public period:number, public partN:number=10){
        PARTICLE_GLOB.addGr(this);
        this.emitter.x=x;
        this.emitter.y=y;
    }



    init(p:Particle){
        p.dir=NUM.getRND()*6.28;
        let v=10+10*NUM.getRND();
        p.vx=Math.cos(p.dir)*v;
        p.vy=Math.sin(p.dir)*v;
        p.x=this.emitter.x;
        p.y=this.emitter.y;
    }
    step(p:Particle){
        p.x+=p.vx;
        p.y+=p.vy;
        // console.log('asd '+p.x);
        
    }
    draw(ctx:CanvasRenderingContext2D,p:Particle){
        drawCircle(ctx,p.x,p.y,p.r,'#aa8866');
    }

    groupEmmit(){
        if(this.partN--<=0){this.deleteGroup();return;}
        let p=PARTICLE_GLOB.addParticle();
        this.myparticles.push(p.ind);
        this.init(p);
        // console.log(this.partN);
        
    }
    groupStep(){
        this.time++;
        for(let pi of this.myparticles)
            this.step(PARTICLE_GLOB.allParticles[pi]);
        while(this.perSum<this.time){
            this.perSum+=this.period;
            this.groupEmmit();   
        }
    }
    groupDraw(ctx){
        for(let pi of this.myparticles)
            this.draw(ctx,PARTICLE_GLOB.allParticles[pi]);
    }
    deleteGroup(){
        PARTICLE_GLOB.delGr(this);
    }
}

class NUM{
    static rand:number[]=[];
    private static ind=0;
    static init(){for(let i=0;i<1000;i++)this.rand[i]=Math.random();}
    static getRND(){this.ind=(this.ind+1)%this.rand.length;return this.rand[this.ind]}
}

export{NUM, ParticleGroup,PARTICLE_GLOB}
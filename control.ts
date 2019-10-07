import { FACE_CONTROL } from "./wordfaces.js";
import { arrFind, arrDel } from "./tools/math.js";
import { MAP } from "./content.js";
import { finder2 } from "./finder.js";


class CONTROL{
    static words:string[]=[];
    static currWord:string="";

    static newKey(ch:string){
        
        let neww=this.currWord+ch;
        console.log(neww);

        let parts:string[] = finder2(neww,this.words);
        if(!parts)
            this.clearWord();
        else {
            this.currWord=neww;
            FACE_CONTROL.setActiveWords(parts,this.words);
            let ind = arrFind(MAP, (a)=>(a.word==this.currWord));
            if(ind>=0 && !MAP[ind].used){
                MAP[ind].used=true;
                let mapobj = MAP[ind];
                if(mapobj.clearStage)
                    for(let wo of this.words)
                        this.delWord(wo);
                if(mapobj.creates)
                    for(let crt of mapobj.creates){
                        this.addLvlWord(crt);
                    }
                this.clearWord();   
            }
        }
        // FACE_CONTROL.setActiveWords(this.currWord);
    }
    static clearWord(){
        this.currWord="";
        FACE_CONTROL.setActiveWords([],this.words);
    }

    static delWord(word:string){
        arrDel(this.words,word);
        FACE_CONTROL.delWord(word);
    }

    static addLvlWord(word:string){
        this.words.push(word);
        FACE_CONTROL.addWord(word);

    }
}

export{CONTROL}
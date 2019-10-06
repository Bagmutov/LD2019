import { WORD_CONTROL } from "./wordfaces.js";
import { arrFind, arrDel } from "./tools/math.js";
import { MAP } from "./content.js";


class CONTROL{
    static words:string[]=[];
    static currWord:string="";

    // finder()
    static newKey(ch:string){
        let neww=this.currWord+ch;
        let parts:string[] = partFinder(neww,this.words);
        if(!parts){
            this.currWord = "";
        } else {
            this.currWord=neww;
            let ind = arrFind(MAP, (a)=>(a.word==this.currWord));
            if(ind>=0){
                let mapobj = MAP[ind];
                if(mapobj.clearStage)
                    for(let wo of this.words)
                        this.delWord(wo);
                if(mapobj.creates)
                    for(let crt of mapobj.creates){
                        this.addLvlWord(crt);
                    }
            }
        }
        WORD_CONTROL.setActiveWord(this.currWord);
    }

    static delWord(word:string){
        arrDel(this.words,word);
        WORD_CONTROL.delWord(word);
    }

    static addLvlWord(word:string){
        this.words.push(word);
        WORD_CONTROL.addWord(word);

    }
}

function partFinder(w,ws):string[]{
    return [];
}

export{CONTROL}
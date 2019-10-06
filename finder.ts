import { allWords } from "./words.js";
import { makeCopy } from "./tools/math.js";

console.log('start');

let but = document.getElementById('button1');
let txt:HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('text1');


but.onclick=function(){
    let mywords = txt.value.split(" ");
    findin6000(mywords);
    // console.log(txt);
    
}

export function findin6000(mywords:string[]){
    //let mywords=["start","qum","centaur"];
    let res=[];
    for(let i=0;i<allWords.length;i++){
        let word=allWords[i];
        let arr = finder(word,mywords);
        if(arr)res.push(word);
    }
    let out = document.getElementById("outputText1");

    // //let word=prompt("Word is");
    // //let mywords=[];  
    // let p=0;
    // let pew;
    // while(pew=prompt("Word"+p)) {
    //     mywords[p]=pew;
    //     p++;}
    // mywords.splice(mywords.length,1)

    out.innerHTML = res.toString();
    console.log(res);
}

function finder(word:string,words:string[]):string[]{
    words=makeCopy(words);
    let a=0,b=0,k=0,maxa=0,i=0,j=0;
    let res=[];
    for(let t=0;t<words.length;t++){
        if(word==words[t]) return null;
    }
    while(i<word.length){
        maxa=0;
        for(let w=0;w<words.length;w++){
            for(let x=0;x<words[w].length;x++){
                j=i;
                a=0;
                while(word[j]==words[w][x]&&j<word.length){
                    j++;
                    x++;
                    a++;
                }
                if(a>0) {
                    maxa=a;
                    x=words[w].length;
                }
            }  
            if(maxa>1) {
                res[k]="";
                for(b=i;b<i+maxa;b++) 
                    res[k]+=word[b];
                k++;
                words.splice(w,1);
                w--;
            }
            
        }
        if(maxa>1) i+=maxa;
        else i=word.length+10;
    }

    if(i<=word.length+1) return res;
    return null;
}


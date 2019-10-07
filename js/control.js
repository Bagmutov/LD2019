import { FACE_CONTROL } from "./wordfaces.js";
import { arrFind, arrDel } from "./tools/math.js";
import { MAP } from "./content.js";
import { finder2 } from "./finder.js";
class CONTROL {
    static newKey(ch) {
        let neww = this.currWord + ch;
        console.log(neww);
        let parts = finder2(neww, this.words);
        if (!parts)
            this.clearWord();
        else {
            this.currWord = neww;
            FACE_CONTROL.setActiveWords(parts, this.words);
            let ind = arrFind(MAP, (a) => (a.word == this.currWord));
            if (ind >= 0 && !MAP[ind].used) {
                MAP[ind].used = true;
                let mapobj = MAP[ind];
                if (mapobj.clearStage)
                    for (let wo of this.words)
                        this.delWord(wo);
                if (mapobj.creates)
                    for (let crt of mapobj.creates) {
                        this.addLvlWord(crt);
                    }
                this.clearWord();
            }
        }
        // FACE_CONTROL.setActiveWords(this.currWord);
    }
    static clearWord() {
        this.currWord = "";
        FACE_CONTROL.setActiveWords([], this.words);
    }
    static delWord(word) {
        arrDel(this.words, word);
        FACE_CONTROL.delWord(word);
    }
    static addLvlWord(word) {
        this.words.push(word);
        FACE_CONTROL.addWord(word);
    }
}
CONTROL.words = [];
CONTROL.currWord = "";
export { CONTROL };
//# sourceMappingURL=control.js.map
import { words6k } from "./6000words.js";
import { makeCopy, arrFill } from "./tools/math.js";
import { words370k } from "./370000words.js";
// console.log('start');
// // let arr = finder2("argument",["start","gum","cent"]);
let but = document.getElementById('button1');
let txt = document.getElementById('text1');
let out = document.getElementById("outputText1");
if (txt && but)
    txt.oninput = but.onclick = function (e) {
        if (!e.clientX && txt.value.substr(-1).charCodeAt(0) != 10)
            return;
        if (!e.clientX)
            txt.value = txt.value.substring(0, txt.value.length - 1);
        let mywords = txt.value.split(" ");
        let res = findinList(mywords, words6k);
        let res2 = findinList(mywords, words370k);
        // console.log(txt);
        out.innerHTML = '1) ' + res.toString().replace(/,/g, ", ");
        out.innerHTML += '<br><br>2) ' + res2.toString().replace(/,/g, ", ");
    };
export function findinList(mywords, hugelist) {
    let res = [], letters = mywords.reduce((s1, s2) => (s1 + s2)).split('');
    for (let i = 0; i < hugelist.length; i++) {
        let word = hugelist[i];
        // let arr = finder2(word,mywords);
        if (finder3(word, makeCopy(letters)))
            res.push(word);
    }
    return res;
}
export function finder(wcut, words) {
    words = makeCopy(words);
    let a = 0, b = 0, k = 0, maxa = 0, i = 0, j = 0;
    let res = [];
    for (let t = 0; t < words.length; t++) {
        if (wcut == words[t])
            return null;
    }
    while (i < wcut.length) {
        maxa = 0;
        for (let w = 0; w < words.length; w++) {
            for (let x = 0; x < words[w].length; x++) {
                j = i;
                a = 0;
                while (wcut[j] == words[w][x] && j < wcut.length) {
                    j++;
                    x++;
                    a++;
                }
                if (a > 0) {
                    maxa = a;
                    x = words[w].length;
                }
            }
            if (maxa > 1) {
                res[k] = "";
                for (b = i; b < i + maxa; b++)
                    res[k] += wcut[b];
                k++;
                words.splice(w, 1);
                w--;
            }
        }
        if (maxa > 1)
            i += maxa;
        else
            i = wcut.length + 10;
    }
    if (i <= wcut.length + 1)
        return res;
    return null;
}
export function finder2(wcut, words) {
    // words=makeCopy(words);
    let res = arrFill("", words.length), max, cut = true;
    while (cut && wcut.length > 0) {
        cut = false;
        for (let i = 0; i < words.length; i++)
            if (!res[i]) {
                max = findinWord(wcut, words[i]);
                if (max >= 1) {
                    res[i] = wcut.substr(0, max);
                    wcut = wcut.substr(max);
                    cut = true;
                }
            }
    }
    return wcut.length > 0 ? null : res;
    function findinWord(fdw, inw) {
        let re = 0, j;
        for (let i = 0; i < inw.length - re; i++) {
            j = 0;
            while (j < fdw.length && fdw[j] == inw[i + j])
                j++;
            if (j > re)
                re = j;
        }
        return re;
    }
}
export function finder3(wcut, letters) {
    for (let i = 0; i < wcut.length; i++) {
        let j = letters.indexOf(wcut.charAt(i));
        if (j == -1)
            return false;
        else
            letters.splice(j, 1);
    }
    return true;
}
//# sourceMappingURL=finder.js.map
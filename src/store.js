import { writable } from 'svelte/store';
import { init } from './genetic';

let best_matches = {}
export let store = writable([])
export function textTolist(text){
    let lines = text.trim().split('\n');
    let size = lines[0];
    let best_a = [];
    let best_b = [];
    for(let i=1; i<parseInt(size)+1; i++){
        best_a[i-1] = collect_values(lines[i]);
    }
    let x = 0;
    for(let i=parseInt(size)+1; i<lines.length; i++){
        best_b[x] = collect_values(lines[i]);
        x++;
    }
    best_matches["best_a"] = best_a;
    best_matches["best_b"] = best_b;
    best_matches["size"] = best_a[0].length;
    init(10, 500, best_matches);
}

const collect_values = (line) => {
    if(line === undefined){return;}
    let out = [];
    let line_txt = line.trim().split(" ");
    for(let i=1; i<line_txt.length; i++){
        out[i-1] = (parseInt(line_txt[i].substr(1))-1);
    }
    return out;
}
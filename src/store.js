import { writable } from 'svelte/store';
import { init_ga, run_ga } from './genetic';
import { init_sa, run_sa } from './s_annealing';

let best_matches = {}
export let store = writable([])
export function load_run_ga(text, psize, ngen, mutpb, cxpb){
    load();
    init_ga(psize, ngen, best_matches, mutpb, cxpb);
    run_ga();
}

export function load_run_sa(text, niter, decrease_factor){
    load();
    init_sa(niter, best_matches, decrease_factor);
    run_sa();
}

const load = () => {
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
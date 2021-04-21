import { writable } from 'svelte/store';
import { Genetic } from './genetic';
import { Annealing } from './s_annealing';

export let best_matches = {}
export let store = writable([])
export function load_run_ga(psize=20, ngen=100, mutpb=0.4, cxpb=0.6){
    const ga = new Genetic(psize, ngen, best_matches, mutpb, cxpb)
    return ga.run_ga();
}

export function load_run_sa(niter, decrease_factor){
    const sa = new Annealing(niter, best_matches, decrease_factor);
    return sa.run_sa();
}

export const load = (text) => {
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

export const color_mutations = (i, mutations) => {
    let count = mutations.filter(x => x == i).length;

    if( count === 0){
        return 'bg-gray-100';
    }
    else if (count === 1){
        return 'bg-green-300';
    }
    else{
        return 'bg-green-600';
    }
}


export const color_worse = (accepted_worse) => {

    if(accepted_worse){
        return 'bg-red-600';
    }
    else{
        return 'bg-gray-100';
    }
}
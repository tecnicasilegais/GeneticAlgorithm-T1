//imports
import { writable } from 'svelte/store';
import { generate_random_population, fill_json_cycle, decodify_individual } from './util.js';
import { random, randomInt } from 'mathjs';

export let storep = writable([])
export let store_solution = writable([])

//globals

let dados_b = [];
let dados_a = [];

let ITERATIONS = 50;

let r_size = 0;
let h = undefined;
let roommate = [];
let neighbour_roommate = [];
let temperature = 100.0;
let energy = 0;
let breeze = 0.5;
let acc_worse = false;

//individual heuristic
const heuristic = (individual) => {//min
    let [aptitude_a, aptitude_b] = [0, 0];
    //iterates individual (i = index of A, individual[i] = index of B, values = i+1 and individual[i]+1)
    for(let a=0; a<individual.length; a++){
        let b = individual[a]; //b person (B1, B2 etc.)
        for(let i=0; i<dados_a[a].length; i++){
            if(dados_a[a][i] == b){//B
                aptitude_a += i;
            }
        }
        for(let i=0; i<dados_b[b].length; i++){
            if(dados_b[b][i] == a){//A
                aptitude_b += i;
            }
        }
    }
    return aptitude_a + aptitude_b;
}


export const init = (niter, best_matches, decrease_factor) => {
    //fill globals
    ITERATIONS = niter;
    r_size = best_matches.size;
    breeze = decrease_factor;
    dados_a = best_matches.best_a;
    dados_b = best_matches.best_b;

    let [roommate] = generate_random_population(1, r_size);

}

const simulate = (i) => {

    h = heuristic(roommate);

    storep.update([fill_json_cycle(i, temperature, roommate, h, acc_worse)])
    acc_worse = false;

    if (h === 0){
        store_solution.set({
            'roommates': roommate,
            'h': 0,
            'decodified': decodify_individual(roommate),
        })
        return true;
    }

    [neighbour_roommate] = generate_random_population(1, r_size);
    let neighbour_h = heuristic(neighbour_roommate);

    energy = neighbour_h - h;
    if(energy < 0){
        roommate = [...neighbour_roommate];
        h = neighbour_h;
    }
    else {
        let probability = Math.exp((-energy/temperature));
        let chance = random();

        if(chance < probability){
            acc_worse = true;
            roommate = [...neighbour_roommate];
            h = neighbour_h;
        }
    }
    temperature *= breeze;

}

export const run_sa = () => {
    let end = false;
    for(let i=1; i<=ITERATIONS; i++){
        end = simulate(i);
        if(end === true){break;}
    }
    if(end === false){//todo
        let m = fitness.argmin();
        store_solution.set({
            'individual': population[m],
            'h': fitness[m],
            'decodified': decodify_individual(population[m]),
        })
    }
}
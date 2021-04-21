//imports
import { writable } from 'svelte/store';
import { generate_random_population, fill_json_cycle, decodify_chromosome } from './util.js';
import { random, randomInt } from 'mathjs';

export class Annealing {
    //attrs
    constructor(niter, best_matches, decrease_factor){

        //fill globals
        this.ITERATIONS = niter;
        this.r_size = best_matches.size;
        this.breeze = decrease_factor;
        this.dados_a = best_matches.best_a;
        this.dados_b = best_matches.best_b;
        this.h = undefined;
        this.temperature = 100.0;
        this.energy = 0;
        this.breeze = 0.5;
        this.acc_worse = false;
        this.json_solution = {};

        this.roommate = generate_random_population(1, this.r_size)[0];
        this.steps = [];

    }

//chromosome heuristic
    heuristic(roommates){//min
        let [aptitude_a, aptitude_b] = [0, 0];
        //iterates chromosome (i = index of A, chromosome[i] = index of B, values = i+1 and chromosome[i]+1)
        for(let a=0; a<roommates.length; a++){
            let b = roommates[a]; //b person (B1, B2 etc.)
            for(let i=0; i<this.dados_a[a].length; i++){
                if(this.dados_a[a][i] == b){//B
                    aptitude_a += i;
                    break;
                }
            }
            for(let i=0; i<this.dados_b[b].length; i++){
                if(this.dados_b[b][i] == a){//A
                    aptitude_b += i;
                    break;
                }
            }
        }
        return aptitude_a + aptitude_b;
    }

    generate_neighbour(roommate){
        let nr = [...roommate];

        let [i, j] = randomInt([2], 0, roommate.length);
        [nr[i], nr[j]] = [nr[j], nr[i]];

        return nr;
    }

    simulate(i){

        this.h = this.heuristic(this.roommate);

        this.steps.push(fill_json_cycle(i, this.temperature, this.roommate, this.h.toFixed(6), this.acc_worse));
        this.acc_worse = false;

        if (this.h === 0){
            this.json_solution = {
                'roommates': this.roommate,
                'h': 0,
                'decodified': decodify_chromosome(this.roommate),
            }
            return true;
        }

        let neighbour_roommate = this.generate_neighbour(this.roommate);
        let neighbour_h = this.heuristic(neighbour_roommate);

        this.energy = neighbour_h - this.h;
        if(this.energy < 0){
            this.roommate = [...neighbour_roommate];
            this.h = neighbour_h;
        }
        else {
            let probability = Math.exp((-this.energy/this.temperature));
            let chance = random();

            if(chance < probability){
                this.acc_worse = true;
                this.roommate = [...neighbour_roommate];
                this.h = neighbour_h;
            }
        }
        this.temperature *= this.breeze;
        return false;

    }

    run_sa(){
        let end = false;
        for(let i=1; i<=this.ITERATIONS; i++){
            end = this.simulate(i);
            if(end === true){break;}
        }
        if(end === false){//todo
            this.json_solution = {
                'chromosome': this.roommate,
                'h': this.h.toFixed(6),
                'decodified': decodify_chromosome(this.roommate),
            }

        }
        return [this.steps, this.json_solution];
    }

}
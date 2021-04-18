//imports
import { writable } from 'svelte/store';
import { generate_random_population, fill_json_data } from './util.js';
import { random, randomInt } from 'mathjs';

export let storep = writable([])

//globals
let dados_b = [];
let dados_a = [];
let solution;

let population = [];
let offspring = [];
let fitness = []; //fitness of each individual from the population
let mutations = [];
let convergence = 0;

let GENERATIONS = 50;
let CHROMOSOME = 0;

let MTPB = 1; //chance of mutation 0..1
let CXPB = 1; //chance of crossover

const reset_variables = () => {
    offspring = [];
    fitness = [];
    mutations = [];
}

//checks if this generation contains the solution
const solution_found = () => {
    return (Math.min(...fitness) === 0);
}

//population fitness
const fitness_func = () => {
    for(let i=0; i<population.length; i++){
        fitness[i] = fitness_individual(population[i]);
    }
}

//individual fitness
const fitness_individual = (individual) => {//min
    let aptitude_a, aptitude_b = 0;
    //iterates individual (i = index of A, individual[i] = index of B, values = i+1 and individual[i]+1)
    for(let a=0; a<individual.length; a++){
        let b = individual[a]; //b person (B1, B2 etc.)
        for(let i=0; i<dados_a[a].length; i++){
            if(dados_a[a][i] == b){//B
                aptitude_a = i;
            }
        }
        for(let i=0; i<dados_b[b].length; i++){
            if(dados_b[b][i] == a){//A
                aptitude_b = i;
            }
        }
    }
    return aptitude_a + aptitude_b;
}

/**
 * Mutate by swapping two random positions of individual's genes
 * @param individual
 */
const swapMutation = (individual) => {

    let [i, j] = randomInt(2, 0, CHROMOSOME);

    [individual[i], individual[j]] = [individual[j], individual[i]];

}

const handle_elitism = () => {
    offspring[0] = population[fitness.argmin()]
}

const handle_mutation = () => {
    for(i=0; i<population.length; i++){ //every individual has a chance of mutation
        let chance = random(); //random between 0..1

        if(chance < MTPB){
            index = randomInt(population.length);
            mutations.push(index);
            mutate(population[index]);
        }
    }
}

const cycle_crossover = (parent1, parent2) => {
    let initial = randomInt(CHROMOSOME);
    let curr = initial;
    let cycle = [initial];
    last_p2_element = parent2[initial];
    let [child1, child2] = [[] , []];

    let index=1;
    while(last_p2_element != parent1[initial]){
        curr = parent1.indexOf(last_p2_element);
        cycle[index] = curr;
        index++;
        last_p2_element = parent2[curr];
    }

    for( let i=0; i<CHROMOSOME; i++){
        if(cycle.indexOf(i) != -1){//if its not part of the cycle, enchanges values between parents
            [child1[i], child2[i]] = [parent2[i], parent1[i]];
        }else{
            [child1[i], child2[i]] = [parent1[i], parent2[i]];
        }
    }
    return [child1, child2];
}

const tournament = () => {
    indexes = randomInt(2, 0, CHROMOSOME);

    if(fitness[indexes[0]] < fitness[indexes[1]]) {
        return indexes[0];
    }else{
        return indexes[1];
    }
}

const selection = () => {
    handle_elitism();

    for( let i=0; i<population.length; i+=2){
        tourn1 = tournament();
        tourn2 = tournament();
        parent1 = population[tourn1];
        parent2 = population[tourn2];
        if(random() < CXPB) { //crossover
            [offspring[i], offspring[i+1]] = cycle_crossover(parent1, parent2);
        }else{
            [offspring[i], offspring[i+1]] = [parent1, parent2];
        }
    }
    if(population.length % 2 === 0){
        offspring[population.length-1] = tournament(); //adds a random parent to fill offspring
    }

}

//selection method
const next_generation = (gen) => {
    selection();

    population = [...offspring]; //population copies the offspring

    reset_variables();
    //mutation
    handle_mutation();

    fitness_func();

    storep.set(fill_json_data(gen, population, fitness, mutations, convergence));

    if(solution_found()){
        solution = population[fitness.argmin()];
        return true;
    }

}

export const init = (pop_size = 20, ngen, best_matches, mutpb, cxpb) => {
    //fill globals
    console.log(best_matches.best_a)
    GENERATIONS = ngen;
    CHROMOSOME = best_matches.size;
    dados_a = best_matches.best_a;
    dados_b = best_matches.best_b;
    MTPB = mutpb;
    CXPB = cxpb;

    population = generate_random_population(pop_size, CHROMOSOME);
    fitness_func();

    if(solution_found()){
        solution = population[fitness.argmin()];
        console.log(solution);
    }

    storep.set(fill_json_data(0, population, fitness, mutations, convergence));
    console.log(fill_json_data(0, population, fitness, mutations, convergence));
}

export const run_ga = () => {
    for(let i=1; i<GENERATIONS; i++){
        let end = next_generation(i);
        if(end){break;}
    }
}


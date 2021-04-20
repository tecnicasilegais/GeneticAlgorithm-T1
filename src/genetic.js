//imports
import { writable } from 'svelte/store';
import { generate_random_population, fill_json_data, decodify_individual } from './util.js';
import { random, randomInt } from 'mathjs';

export let storep = writable([])
export let store_solution = writable([])

//globals
let hall_of_fame = {}

let dados_b = [];
let dados_a = [];

let population = [];
let population_size = 0;
let offspring = [];
let fitness = []; //fitness of each chromosome from the population
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

const update_hall_of_fame = (gen) => {
    let [index, fit] = fitness.doubleMin();
    if(fit < hall_of_fame.fitness){
        hall_of_fame.gen = gen;
        hall_of_fame.chromosome = population[index];
        hall_of_fame.fitness = fit;
    }
}

//checks if this generation contains the solution
const solution_found = () => {
    return (Math.min(...fitness) === 0);
}

//population fitness
const fitness_func = () => {
    for(let i=0; i<population.length; i++){
        fitness[i] = fitness_chromosome(population[i]);
    }
}

//chromosome fitness
const fitness_chromosome = (chromosome) => {//min
    let [aptitude_a, aptitude_b] = [0, 0];
    //iterates chromosome (i = index of A, chromosome[i] = index of B, values = i+1 and chromosome[i]+1)
    for(let a=0; a<chromosome.length; a++){
        let b = chromosome[a]; //b person (B1, B2 etc.)
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
    return 2*(aptitude_a + aptitude_b);
}

/**
 * Mutate by swapping two random positions of chromosome's genes
 * @param chromosome
 */
const swap_mutation = (chromosome) => {

    let [i, j] = randomInt([2], 0, CHROMOSOME);
    [chromosome[i], chromosome[j]] = [chromosome[j], chromosome[i]];

}

const handle_elitism = () => {
    offspring[0] = population[fitness.argmin()]
}

const handle_mutation = () => {
    for(let i=0; i<population.length; i++){
        let chance = random(); //random between 0..1

        if(chance < MTPB){
            let index = randomInt(population.length);
            mutations.push(index+1);
            swap_mutation(population[index]);
        }
    }
}

const cycle_crossover = (parent1, parent2) => {
    let initial = randomInt(CHROMOSOME);
    let curr = initial;
    let cycle = [initial];
    let last_p2_element = parent2[initial];
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
    let [i, j] = randomInt([2], 0, population_size);

    if(fitness[i] < fitness[j]) {
        return i;
    }else{
        return j;
    }
}

const selection = () => {
    handle_elitism();

    for( let i=0; i<population.length; i+=2){
        let [tourn1, tourn2] = [tournament(), tournament()];
        let [parent1, parent2] = [population[tourn1], population[tourn2]];

        if(random() < CXPB) { //crossover
            [offspring[i], offspring[i+1]] = cycle_crossover(parent1, parent2);
        }else{
            [offspring[i], offspring[i+1]] = [parent1, parent2];
        }
    }
    if(population.length % 2 === 0){
        offspring[population.length-1] = population[tournament()]; //adds a random parent to fill offspring
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

    update_hall_of_fame(gen);

    storep.update(n => [...n, fill_json_data(gen, population, fitness, mutations, convergence)]);

    if(solution_found()){
        let solution = population[fitness.argmin()];
        store_solution.set({
            'chromosome': solution,
            'fitness': 0,
            'decodified': decodify_chromosome(solution),
            'halloffame': hall_of_fame,
            'decod_hof': decodify_chromosome(hall_of_fame.chromosome)
        })
        console.log({
            'chromosome': solution,
            'fitness': 0,
            'decodified': decodify_chromosome(solution),
            'halloffame': hall_of_fame,
            'decod_hof': decodify_chromosome(hall_of_fame.chromosome)
        })
        return true;
    }

}

export const init = (pop_size = 20, ngen, best_matches, mutpb=0.5, cxpb=0.8) => {
    //fill globals
    population_size = pop_size;
    GENERATIONS = ngen;
    CHROMOSOME = best_matches.size;
    dados_a = best_matches.best_a;
    dados_b = best_matches.best_b;
    MTPB = mutpb;
    CXPB = cxpb;

    population = generate_random_population(pop_size, CHROMOSOME);
    fitness_func();
    let [idx, min] = fitness.doubleMin();
    hall_of_fame = {
        'gen': 0,
        'chromosome': population[idx],
        'fitness': min,
    }

    if(solution_found()){
        let solution = population[fitness.argmin()];
        store_solution.set({
            'chromosome': solution,
            'fitness': 0,
            'decodified': decodify_chromosome(population[solution]),
            'halloffame': hall_of_fame,
            'decod_hof': decodify_chromosome(hall_of_fame.chromosome)
        })
        return true;
    }
    storep.set([fill_json_data(0, population, fitness, mutations, convergence)]);
    //console.log(fill_json_data(0, population, fitness, mutations, convergence));
}

export const run_ga = () => {
    let end = false;
    for(let i=1; i<=GENERATIONS; i++){
        end = next_generation(i);
        if(end === true){break;}
    }
    if(end === false){
        let m = fitness.argmin();
        store_solution.set({
            'chromosome': population[m],
            'fitness': fitness[m],
            'decodified': decodify_chromosome(population[m]),
            'halloffame': hall_of_fame,
            'decod_hof': decodify_chromosome(hall_of_fame.chromosome)
        })
    }
}


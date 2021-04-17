//imports
import { generate_random_population } from './util.js';

//globals
let dados_b = [];
let dados_a = [];

let population = [];
let offspring = [];
let fitness = []; //fitness of each individual from the population

let GENERATIONS = 50;
let CHROMOSOME = 0;

let mut_chance = 1; //chance of mutation 0..1
let mut_max = Math.floor(CHROMOSOME/3); //max of individuals that can be mutated in a single generation
let cros_chance = 1; //chance of crossover


const solution_found = () => {
    if(Math.max(...fitness) === Math.pow(fitness.length, 2));
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
    let pos1 = Math.floor(Math.random() * CHROMOSOME);
    let pos2 = Math.floor(Math.random() * CHROMOSOME);

    let aux = individual[pos1];
    individual[pos1] = individual[pos2];
    individual[pos2] = aux;
}

const handle_mutation = () => {
    for(i=0; i<mut_max; i++){
        let chance = Math.random(); //random between 0..1

        if(chance < mut_chance){
            mutate(population[Math.floor(Math.random() * population.length)]);
        }
    }
}

//selection method
const selection = () => {
    handle_mutation();
    //crossoverfunc()
}

export const init = (pop_size = 20, ngen, best_matches) => {
    //fill globals
    GENERATIONS = ngen;
    CHROMOSOME = best_matches["size"];

    population = generate_random_population(pop_size, CHROMOSOME);
    console.log(population);
}

export const run_ga = () => {

    /*
        console.log("Generation 0:");

        //fitness_func();
        console.log(population);
        console.log(fitness);

        if(solution_found()){
            console.log('Solution found!');
            console.log('printa o individuo');
        }

        for(let i=1; i<ngen; i++){
            //selection();
            //population = [...partial_population];
            //fitness_func();
            console.log('\n\nGeneration', i, ':');
            console.log(population);
            if(solution_found()){
                console.log('Solution found!');
                console.log('printa o individuo');
                break;
            }
        }*/
}


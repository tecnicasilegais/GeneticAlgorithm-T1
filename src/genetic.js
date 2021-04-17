//imports
import { generate_random_population } from './util.js';

//globals
let ind_example = [];

let dados_b = [];
let dados_a = [];

let population = [];
let offspring = [];
let fitness = []; //fitness of each individual from the population

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

//selection method
const selection = () => {
    let mutation_chance = 3;
    let chance = Math.random()*10;

    if(chance < mutation_chance){
       //mutate
    }

    //crossoverfunc()
}

export const initialize = (pop_size = 20, size, ngen, best_matches) => {
    population = [...generate_random_population(pop_size, size)];
    console.log(population);
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




if(typeof(Array.prototype.shuffle) === 'undefined'){
    Array.prototype.shuffle = function(){
        let i = this.length, j, temp;
        if ( i === 0 ) return this;
        while ( --i ) {
            j = Math.floor( Math.random() * ( i + 1 ) );
            temp = this[i];
            this[i] = this[j];
            this[j] = temp;
        }
        return this;
    }
}

let ind_example = [];

let dados_b = [];
let dados_a = [];

let population = [];
let partial_population = [];
let fitness = []; //fitness of each individual from the population


const generate_population = (pop_size) => {
    for(let i=0; i<pop_size; i++){
        population[i] = [...ind_example].shuffle();
    }
    return population;
}

const solution_found = () => {
    if(Math.max(...fitness) === Math.pow(fitness.length, 2));
}

const fitness_func = () => {
    for(let i=0; i<population.length; i++){
        fitness[i] = fitness_individual(population[i]);
    }
}

const fitness_individual = (individual) => {
    let nota_a, nota_b = 0;
    for(let i=0; i<individual.length; i++){
        let idxb = individual[i]-1;
        for(let j=0; j<dados_a[idxb].length; j++){
            if(dados_a[idxb][j] == idxb+1){//B
                nota_a = dados_a[idxb].length - j;
            }
        }
        for(let j=0; j<dados_b[individual[i]].length; j++){
            if(dados_b[individual[i]] == i+1){//A
                nota_b = dados_b[individual[i]].length - j;
            }
        }
    }
    return nota_a + nota_b;
}

const selection = () => {
    let mutation_chance = 3;
    let chance = Math.random()*10;

    if(chance < mutation_chance){
       //mutate
    }

    //crossoverfunc()
}

export const initialize = (pop_size = 20, size, ngen, best_matches) => {
    ind_example = Array.from({length: size}, (e, i) => i);
    generate_population(pop_size)
    console.log(best_matches);
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
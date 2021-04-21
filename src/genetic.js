//imports
import { writable } from 'svelte/store';
import { generate_random_population, fill_json_data, decodify_chromosome, calc_frequence, converged } from './util.js';
import { random, randomInt } from 'mathjs';

export class Genetic {

    constructor(pop_size, ngen, best_matches, mutpb, cxpb) {
        //param attributes

        this.population_size = pop_size;
        this.GENERATIONS = ngen;
        this.CHROMOSOME = best_matches.size;
        this.dados_a = best_matches.best_a;
        this.dados_b = best_matches.best_b;
        this.MTPB = mutpb;
        this.CXPB = cxpb;

        //empty attributes
        this.offspring = [];
        this.fitness = []; //fitness of each chromosome from the population
        this.mutations = [];
        this.convergence = 0.8; //80%
        this.conv_history = [];
        this.max_mut = pop_size/2;

        this.population = generate_random_population(pop_size, this.CHROMOSOME);
        this.fitness_func();

        //initialize hall of fame
        let [idx, min] = this.fitness.doubleMin();
        this.hall_of_fame = {
            'gen': 0,
            'chromosome': this.population[idx],
            'fitness': min,
        }

        this.json_solution = {};
        this.steps = [];

        this.steps.push(fill_json_data(0, this.population, this.fitness, this.mutations));
    }

    reset_variables(){
        this.offspring = [];
        this.fitness = [];
        this.mutations = [];
    }

    handle_convergence(gen){
        if(gen >= 15){
            let conv_percentage = calc_frequence(this.fitness);
            this.conv_history.push(conv_percentage);
            if(this.conv_history.length >= 5){
                this.conv_history = this.conv_history.slice(this.conv_history.length-5);

                return converged(this.conv_history, this.convergence);
            }
        }
        return false;
    }

    update_hall_of_fame(gen){
        let [index, fit] = this.fitness.doubleMin();
        if(fit < this.hall_of_fame.fitness){
            this.hall_of_fame.gen = gen;
            this.hall_of_fame.chromosome = this.population[index];
            this.hall_of_fame.fitness = fit;
        }
    }

//checks if this generation contains the solution
    solution_found(){
        return (Math.min(...this.fitness) === 0);
    }

//population fitness
    fitness_func(){
        for(let i=0; i<this.population.length; i++){
            this.fitness[i] = this.fitness_chromosome(this.population[i]);
        }
    }

//chromosome fitness
    fitness_chromosome(chromosome){//min
        let [aptitude_a, aptitude_b] = [0, 0];
        //iterates chromosome (i = index of A, chromosome[i] = index of B, values = i+1 and chromosome[i]+1)
        for(let a=0; a<chromosome.length; a++){
            let b = chromosome[a]; //b person (B1, B2 etc.)
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
        return 2*(aptitude_a + aptitude_b);
    }

    /**
     * Mutate by swapping two random positions of chromosome's genes
     * @param chromosome
     */
    swap_mutation(chromosome){

        let [i, j] = randomInt([2], 0, this.CHROMOSOME);
        [chromosome[i], chromosome[j]] = [chromosome[j], chromosome[i]];

    }

    handle_elitism(){
        this.offspring[0] = this.population[this.fitness.argmin()];
    }

    handle_mutation(){
        for(let i=0; i<this.max_mut; i++){
            let chance = random(); //random between 0..1

            if(chance < this.MTPB){
                let index = randomInt(this.population.length);
                this.mutations.push(index);
                this.swap_mutation(this.population[index]);
            }
        }
    }

    cycle_crossover(parent1, parent2){
        let initial = randomInt(this.CHROMOSOME);
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

        for( let i=0; i<this.CHROMOSOME; i++){
            if(cycle.indexOf(i) != -1){//if its not part of the cycle, enchanges values between parents
                [child1[i], child2[i]] = [parent2[i], parent1[i]];
            }else{
                [child1[i], child2[i]] = [parent1[i], parent2[i]];
            }
        }
        return [child1, child2];
    }

    tournament(){
        let [i, j] = randomInt([2], 0, this.population_size);

        if(this.fitness[i] < this.fitness[j]) {
            return i;
        }else{
            return j;
        }
    }

    selection(){
        this.handle_elitism();

        for( let i=0; i<this.population.length; i+=2){
            let [tourn1, tourn2] = [this.tournament(), this.tournament()];
            let [parent1, parent2] = [this.population[tourn1], this.population[tourn2]];

            if(random() < this.CXPB) { //crossover
                [this.offspring[i], this.offspring[i+1]] = this.cycle_crossover(parent1, parent2);
            }else{
                [this.offspring[i], this.offspring[i+1]] = [parent1, parent2];
            }
        }
        if(this.population.length % 2 === 0){
            this.offspring[this.population.length-1] = this.population[this.tournament()]; //adds a random parent to fill offspring
        }

    }

//selection method
    next_generation(gen){
        this.selection();

        this.population = [...this.offspring]; //population copies the offspring

        this.reset_variables();
        //mutation
        this.handle_mutation();

        this.fitness_func();

        this.update_hall_of_fame(gen);

        this.steps.push(fill_json_data(gen, this.population, this.fitness, this.mutations));

        if(this.handle_convergence(gen)) {
            return [true,true];
        }

        if(this.solution_found()){
            let solution = this.population[this.fitness.argmin()];
            this.json_solution = {
                'chromosome': solution,
                'fitness': 0,
                'decodified': decodify_chromosome(solution)
            }
            return [true,false];
        }
        return [false,false];
    }


    run_ga(){
        if(this.solution_found()){
            let solution = this.population[this.fitness.argmin()];
            this.json_solution = {
                'chromosome': solution,
                'fitness': 0,
                'decodified': decodify_chromosome(solution),
            }
            return [this.steps, this.json_solution];
        }
        let [end, endByConvergence] = [false,false];
        for(let i=1; i<=this.GENERATIONS; i++){
            [end, endByConvergence] = this.next_generation(i);
            if(end === true){break;}
        }
        if(endByConvergence === true){
            let m = this.fitness.argmin();
            this.json_solution ={
                'chromosome': this.population[m],
                'fitness': this.fitness[m],
                'decodified': decodify_chromosome(this.population[m]),
                'halloffame': this.hall_of_fame,
                'decod_hof': decodify_chromosome(this.hall_of_fame.chromosome),
                'by_convergence': true

            }
        }
        if(end === false){
            let m = this.fitness.argmin();
            this.json_solution = {
                'chromosome': this.population[m],
                'fitness': this.fitness[m],
                'decodified': decodify_chromosome(this.population[m]),
                'halloffame': this.hall_of_fame,
                'decod_hof': decodify_chromosome(this.hall_of_fame.chromosome)
            }
        }
        return [this.steps, this.json_solution];
    }
}


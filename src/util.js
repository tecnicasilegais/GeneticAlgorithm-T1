
export const fill_json_data = (generation, population, fitnesses, mutations, convergence) => {
    return {
        'generation': generation,
        'population': population,
        'fitnesses': fitnesses,
        'best_one': fitnesses.argmin(),
        'mutations': mutations,
        'convergence': convergence
    };
}

export const fill_json_cycle = (cycle, temperature, roommate, h, acc_worse) => {
    return {
        'cycle': cycle,
        'temperature': temperature,
        'roommate': roommate,
        'acc_worse': acc_worse,
        'h': h
    }
}


export const decodify_chromosome = (chromosome) => {
    let di_json = [];
    for(let i=0; i<chromosome.length; i++){
        di_json[i] = "B" + (chromosome[i]+1);
    }
    return di_json;
}

export const calc_frequence = (fitness) => {
    return fitness.maxFrequence();
}

export const converged = (history, conv) => {
    for(let c of history){
        if( c < conv){
            return false;
        }
    }
    return true;
}


/**
 * Generates a random population
 * @param k_population size of population
 * @param k_individual size of individuals
 * @returns {[]}
 */
export const generate_random_population = (k_population, k_individual) => {
    let ind_example = Array.from({length: k_individual}, (e, i) => i);
    let sample = [];
    for(let i=0; i<k_population; i++){
        sample[i] = [...ind_example].shuffle();
    }
    return sample
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

if(typeof(Array.prototype.argmin) === 'undefined'){
    Array.prototype.argmin = function(){
        if (this.length == 0){
            return -1;
        }
        let min = this[0];
        let i_min = 0;

        for(let i=0; i<this.length; i++){
            if(this[i] < min){
                i_min = i;
                min = this[i];
            }
        }
        return i_min;
    }
}

if(typeof(Array.prototype.doubleMin) === 'undefined'){
    Array.prototype.doubleMin = function(){
        if (this.length == 0){
            return -1;
        }
        let min = this[0];
        let i_min = 0;

        for(let i=0; i<this.length; i++){
            if(this[i] < min){
                i_min = i;
                min = this[i];
            }
        }
        return [i_min, min];
    }
}

if(typeof(Array.prototype.maxFrequence) === 'undefined'){
    Array.prototype.maxFrequence = function(){
        if (this.length == 0){
            return -1;
        }
        let  k = {};
        let max = '';
        let i_max = 0;

        for(let el of this){
            if(k[el]) k[el]++; else k[el]=1;
            if(i_max < k[el]){ max=el; i_max = k[el];}
        }
        return i_max/this.length;
    }
}


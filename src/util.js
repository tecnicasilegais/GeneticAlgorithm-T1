
export const fill_json_data = (generation, population, fitnesses, mutations, convergence) => {
    return {
        'generation': generation,
        'population': population,
        'fitnesses': fitnesses,
        'mutations': mutations,
        'convergence': convergence
    };
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
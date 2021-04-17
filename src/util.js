
export const fill_json_data = (generation, population, fitnesses, mutations) => {
    return {
        'generation': generation,
        'population': population,
        'fitnesses': fitnesses,
        'mutations': mutations
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
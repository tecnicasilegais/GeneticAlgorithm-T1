<script>
	import { load_run_ga, color_mutations, best_matches } from './store';
	import { storep, json_solution } from './genetic';
    import { Dialog } from 'svelte-materialify';
	import Pagination from '@fouita/pagination';
    let active2;
    let fill_json_data_array = [];
    storep.subscribe(fill_json_data => {fill_json_data_array = fill_json_data });
 
    function json_data(i) {
		return fill_json_data_array[i]
	}
    let current = 1;
    let per_page=1;
    export let cxpb = 0.8, psize = 20, mutpb = 0.4, ngen = 100;
    function showGA() {
        if(best_matches){
            load_run_ga(psize, ngen, mutpb, cxpb);
            document.getElementById('input_ga').style.display = "none";
        }else{
            alert('Selecione um arquivo')
        }
    }
    function reset_ga(){
        fill_json_data_array = [];
        document.getElementById('input_ga').style.display = "block";
    }

</script>


<main>
    <div class="flex flex-col" >
        <div class="w-100 bg-gradient-to-b mr-3" id="input_ga">
            <div class="flex flex-col">
                <div id="converters-area" class="px-4 py-5">
                    <div class="flex flex-col text-white">

                        <div class="flex items-center justify-between mb-5">
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='popsize' class='form-label'>População</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' min='1' type='number' id='popsize' bind:value={psize}>
                            </div>
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='popsize' class='form-label'>Gerações</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' min='1' type='number' id='gesize' bind:value={ngen}>
                            </div>
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='mutcha' class='form-label'>Chance de mutação</label>
                                <input class='border-2 border-gray-300 py-1 bg-white text-black' step='0.01' min='0' max='1' type='number' id='mutcha' bind:value={mutpb}>
                            </div>
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='crosscha' class='form-label'>Chance de crossover</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' step='0.01' min='0' max='1' type='number' id='crosscha' bind:value={cxpb}>
                            </div>
                        </div>
                        <div class="justify-between mb-5">
                            <div class="flex flex-col text-right items-center w-100 px-2">
                                <button on:click={showGA} class="bg-blue-900 hover:bg-blue-700 self-center border-blue-900 hover:border-blue-700 text-white  font-bold py-2 px-4 rounded">
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id='show' >
            {#if fill_json_data_array.length > 0}
                <div class="flex items-center justify-inline self-center w-5/6 ">
                    <div class="grid grid-cols-2 px-2">
                        <p class='text-lg text-center font-bold m-5'>Geração: {json_data(current-1).generation}</p>
                        <button on:click={() => (active2 = true)} class="bg-blue-900 hover:bg-blue-700 self-center border-blue-900 hover:border-blue-700 text-white  font-bold py-2 px-4 rounded">
                            Melhor
                        </button>
                        <button on:click={reset_ga} class="bg-blue-900 hover:bg-blue-700 self-center border-blue-900 hover:border-blue-700 text-white  font-bold py-2 px-4 rounded">
                            Reset
                        </button>
                    </div>
                </div>
                <table class='rounded-t-lg m-5 w-5/6 mx-auto bg-gray-200 text-gray-800'>
                    <tr class='text-left border-b-2 border-gray-300 ' >
                        <th class='px-4 py-3'>População</th>
                        <th class='p-0' width='110px'>Fitnesses</th>
                    </tr>
                    {#each json_data(current-1).population as pop, i}
                        <tr class='{color_mutations(i, json_data(current-1).mutations)} border-b border-gray-200'>
                            <td class='px-4 py-3'>{pop}</td>
                            <td class='px-4 py-3'>{json_data(current-1).fitnesses[i]}</td>
                        </tr>
                    {/each}
                </table>
                <div class="justify-between mb-5">
                    <div class="flex flex-col text-right items-center w-100 px-2">
	                <Pagination bind:current={current} bind:num_items={fill_json_data_array.length} {per_page} />
                    </div>
                </div>
            {/if}
        </div>
        <Dialog class="pa-4 text-center" bind:active={active2}>
            <!-- <p>Roomates {json_solution.chromosome}</p><br/> -->
            <p>{json_solution.chromosome}</p><br/>
            <p>{json_solution.fitness}</p><br/>
            <p>{json_solution.halloffame.gen}</p><br/>
            <p>{json_solution.halloffame.chromosome}</p><br/>
            <p>{json_solution.halloffame.fitness}</p><br/>
            <p>{json_solution.decod_hof}</p><br/>
            <p>{json_solution.by_convergence? 'Parou por convergencia': ''}</p><br/>
            {#each json_solution.decodified as dec, i}
                <p>A{i+1} -> {dec}</p>
            {/each}
        </Dialog>
    </div>
</main>

<style>
    :global(body) {
		background-color: rgb(33, 41, 56);
        color: white;
	}
</style>
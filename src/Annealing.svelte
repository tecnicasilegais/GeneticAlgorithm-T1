<script>
	import { load_run_sa, color_worse, best_matches} from './store';
	import { storep } from './s_annealing';

    let fill_json_cycle_array = [];
    storep.subscribe(fill_json_cycle => {fill_json_cycle_array = fill_json_cycle });

    export let decrease_factor=0.6, niter=40;
    function showSA() {
        if(best_matches){
            load_run_sa(niter, decrease_factor);
            document.getElementById('input_sa').style.display = "none";
        }else{
            alert('Selecione um arquivo!')
        }
    }
    function reset_sa(){
        fill_json_cycle_array = [];
        document.getElementById('input_sa').style.display = "block";
    }

</script>

<svelte:head>
    <link href='https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css' rel='stylesheet'>
</svelte:head>
<main>
    <div class="flex flex-col" >
        <div class="w-100 bg-gradient-to-b mr-3" id="input_sa">
            <div class="flex flex-col">
                <div id="converters-area" class="px-4 py-5">
                    <div class="flex flex-col text-white">

                        <div class="flex items-center justify-between mb-5">
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='niters' class='form-label'>Iterações</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' min='1' type='number' id='niters' bind:value={niter}>
                            </div>
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='decrease_heat' class='form-label'>Resfriamento</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' step='0.01' min='0.01' max='1' type='number' id='decrease_heat' bind:value={decrease_factor}>
                            </div>
                        </div>
                        <div class="justify-between mb-5">
                            <div class="flex flex-col text-right items-center w-100 px-2">
                                <button on:click={showSA} class="bg-blue-900 hover:bg-blue-700 self-center border-blue-900 hover:border-blue-700 text-white  font-bold py-2 px-4 rounded">
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id='show' >
            {#if fill_json_cycle_array.length > 0}
                <div class="flex items-center justify-inline self-center w-5/6 ">
                    <div class="grid grid-cols-2 px-2">
                        <button on:click={reset_sa} class="bg-blue-900 hover:bg-blue-700 self-center border-blue-900 hover:border-blue-700 text-white  font-bold py-2 px-4 rounded">
                            Reset
                        </button>
                    </div>
                </div>
                <table class='rounded-t-lg m-5 w-5/6 mx-auto bg-gray-200 text-gray-800'>
                    <tr class='text-left border-b-2 border-gray-300 ' >
                        <th class='px-4 py-3'>Ciclo</th>
                        <th class='px-4 py-3'>Temperatura</th>
                        <!--<th class='px-4 py-3'>Individuo</th>-->
                        <th class='p-0' width='110px'>Heurística</th>
                    </tr>
                    {#each fill_json_cycle_array as cycle, i}
                        <tr class='{color_worse(cycle.acc_worse)} border-b border-gray-200'>
                            <td class='px-4 py-3'>{cycle.cycle}</td>
                            <td class='px-4 py-3'>{cycle.temperature}</td>
                            <!--<td class='px-4 py-3'>{cycle.roommate}</td>-->
                            <td class='px-4 py-3'>{cycle.h}</td>
                        </tr>
                    {/each}
                </table>
            {/if}
        </div>
    </div>
</main>

<style>
    :global(body) {
		background-color: rgb(33, 41, 56);
        color: white;
	}
</style>
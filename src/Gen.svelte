<script>
	import { textTolist } from './store';
	import { storep } from './genetic';
	import Pagination from '@fouita/pagination';
    let fill_json_data_array = [];
    storep.subscribe(fill_json_data => {fill_json_data_array = fill_json_data });
 
    function json_data(i) {
		return fill_json_data_array[i]
	}
    let current = 1;
    let per_page=1;
    export let fileContents;
    export let cc,pz,cm,gz;
    function showTable() {
        if(fileContents != null && gz != null){
            textTolist(fileContents, pz, cc, cm, gz);
            document.getElementById('inputs').style.display = "none";
        }else{
            alert('Preencha a geração e selecione um arquivo')
        }
    }
    function reset(){
        fill_json_data_array = [];
        document.getElementById('inputs').style.display = "block";
    }
	window.onload = function () {
        //Check the support for the File API support
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            let fileSelected = document.getElementById('txtfiletoread');
            fileSelected.addEventListener('change', function (e) {
                //Set the extension for the file
                let fileExtension = /text.*/;
                //Get the file object
                let fileTobeRead = fileSelected.files[0];
                //Check of the extension match
                if (fileTobeRead.type.match(fileExtension)) {
                    //Initialize the FileReader object to read the 2file
                    let fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        fileContents = fileReader.result;
                    }
                    fileReader.readAsText(fileTobeRead);
                }
                else {
                    alert('Por favor selecione arquivo texto');
                }

            }, false);
        }
        else {
            alert('Arquivo(s) não suportado(s)');
        }
    }
</script>

<svelte:head>
    <link href='https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css' rel='stylesheet'>
</svelte:head>
<main>
    <div class="flex flex-col" >
        <div class="w-100 bg-gradient-to-b mr-3" id="inputs">
            <div class="flex flex-col">
                <div id="converters-area" class="px-4 py-5">
                    <div class="flex flex-col text-white">

                        <div class="flex items-center justify-between ml-40 mb-5">
                            <div class="flex flex-col text-center w-5/6 px-2">
                                <label for='txtfiletoread' class='form-label'>Selecione um arquivo</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' type='file' id='txtfiletoread' >
                            </div>
                        </div>

                        <div class="flex items-center justify-between mb-5">
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='popsize' class='form-label'>População</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' min='1' type='number' id='popsize' bind:value={pz}>
                            </div>
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='popsize' class='form-label'>Gerações</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' min='1' type='number' id='gesize' bind:value={gz}>
                            </div>
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='mutcha' class='form-label'>Chance de mutação</label>
                                <input class='border-2 border-gray-300 py-1 bg-white text-black' step='0.01' min='0' max='1' type='number' id='mutcha' bind:value={cm}>
                            </div>
                            <div class="flex flex-col text-center w-3/6 px-2">
                                <label for='crosscha' class='form-label'>Chance de crossover</label>
	            	            <input class='border-2 border-gray-300 py-1 bg-white text-black' step='0.01' min='0' max='1' type='number' id='crosscha' bind:value={cc}>  
                            </div>
                        </div>
                        <div class="justify-between mb-5">
                            <div class="flex flex-col text-right items-center w-100 px-2">
                                <button on:click={showTable} class="bg-blue-900 hover:bg-blue-700 self-center border-blue-900 hover:border-blue-700 text-white  font-bold py-2 px-4 rounded">
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
                        <button on:click={reset} class="bg-blue-900 hover:bg-blue-700 self-center border-blue-900 hover:border-blue-700 text-white  font-bold py-2 px-4 rounded">
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
                        <tr class='bg-gray-100 border-b border-gray-200'>
                            <td class='px-4 py-3'>{pop}</td>
                            <td class='px-4 py-3'>{json_data(current-1).fitnesses[i]}</td>
                        </tr>
                    {/each}
                </table>
                <div class="flex space-x-4 m-5 w-5/6 mx-auto">
                    <div class="flex-1">Mutações: {json_data(current-1).mutations}</div>
                </div>
                <div class="justify-between mb-5">
                    <div class="flex flex-col text-right items-center w-100 px-2">
	                <Pagination bind:current={current} bind:num_items={fill_json_data_array.length} {per_page} />
                    </div>
                </div>
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
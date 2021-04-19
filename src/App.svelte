<script>
    import FileInput from './components/FileInput.svelte';
	import { textTolist } from './store';
	import { storep } from './genetic';
	import Pagination from '@fouita/pagination';
    let fjd = [];
    storep.subscribe(fill_json_data => {fjd = fill_json_data });
 
    function fjdshow(i) {
		return fjd[i]
	}
    let current = 1;
    let per_page=1;
    export let fileContents;
    export let cc,pz,cm;

	window.onload = function () {
        //Check the support for the File API support
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var fileSelected = document.getElementById('txtfiletoread');
            fileSelected.addEventListener('change', function (e) {
                //Set the extension for the file
                var fileExtension = /text.*/;
                //Get the file object
                var fileTobeRead = fileSelected.files[0];
                //Check of the extension match
                if (fileTobeRead.type.match(fileExtension)) {
                    //Initialize the FileReader object to read the 2file
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        fileContents = document.getElementById('filecontents');
                        textTolist(fileReader.result);
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
    
    <FileInput />
   
    <div class='m-5 w-5/6 mx-auto'>
	    <label for='popsize' class='form-label'>Tamanho da população</label>
		<input class='border-2 border-gray-300 p-2 w-1/3 bg-dark text-black' min='1' type='number' id='popsize' bind:value={pz}>
	</div>
    <div class='m-5 w-5/6 mx-auto'>
	    <label for='mutcha' class='form-label'>Chance de mutação</label>
		<input class='border-2 border-gray-300 p-2 w-1/3 bg-dark text-black' step='0.01' min='0' max='1' type='number' id='mutcha' bind:value={cm}>
	</div>
    <div class='m-5 w-5/6 mx-auto'>
	    <label for='crosscha' class='form-label'>Chance de crossover</label>
		<input class='border-2 border-gray-300 p-2 w-1/3 bg-dark text-black' step='0.01' min='0' max='1' type='number' id='crosscha' bind:value={cc}>
    </div>
    {#if fjd.length > 0}

        <p class='text-lg text-center font-bold m-5'>Geração: {fjdshow(current-1).generation}</p>
        <table class='rounded-t-lg m-5 w-5/6 mx-auto bg-gray-200 text-gray-800'>
            <tr class='text-left border-b-2 border-gray-300 ' >
                <th class='px-4 py-3'>População</th>
                <th class='p-0' width='110px'>Fitnesses</th>
            </tr>
            {#each fjdshow(current-1).population as pop, i}
                <tr class='bg-gray-100 border-b border-gray-200'>
                    <td class='px-4 py-3'>{pop}</td>
                    <td class='px-4 py-3'>{fjdshow(current-1).fitnesses[i]}</td>
                </tr>
            {/each}
        </table>
        <div class="flex space-x-4 m-5 w-5/6 mx-auto">
            <div class="flex-1">Mutações: {fjdshow(current-1).mutations}</div>
            <div class="flex-2 hidden"> 
                <a href='' class='mx-auto m-inline-block rounded-full text-white 
                  bg-yellow-400 hover:bg-yellow-500 duration-300 
                  text-xs font-bold 
                  mr-1 md:mr-2 mb-2 px-2 md:px-4 py-1 
                  opacity-90 hover:opacity-100'>
                  Convergência: {fjd.convergence}
              </a>
            </div>
        </div>
        <div class="w-5/6 mx-36 lg:ml-96 lg:pl-80">
	        <Pagination bind:current={current} bind:num_items={fjd.length} {per_page} />
        </div>
    {/if}
</main>

<style>
    :global(body) {
		background-color: rgb(33, 41, 56);
        color: white;
	}
   
</style>
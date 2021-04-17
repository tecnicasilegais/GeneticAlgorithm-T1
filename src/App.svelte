<script>
    import FileInput from './components/FileInput.svelte'
	import { textTolist, store } from './store'
	import { init,storep } from './genetic'
	import Pagination from '@fouita/pagination'
    let bm;
    let pp;
    store.subscribe(best_matches => { bm = best_matches });
    storep.subscribe(population => { pp = population });
    let lista = ['abc','de'] //pagar isso aqui apenas para teste
    let current = 0
    let num_items= pp.length == undefined ? 0 : pp.length
    let per_page=1
    export let fileContents
    export let sz

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
                        let aux = {}
						init(10, 500, bm);
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
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
</svelte:head>
<svelte:body class:name={bg-black} />
<main>
    
    <FileInput />
   
    <div class='mb-3'>
	    <label for='size' class='form-label'>Selecione um arquivo de turmas</label>
		<input class='border-2 border-gray-300 p-2 w-1/3 bg-dark'  type='number' id='size' bind:value={sz}>
	</div>
    <div class='max-w-xs rounded overflow-hidden bg-gray-600 shadow-lg my-2'>
        <div class='px-6 py-4'>
          <p class='text-grey-darker text-center text-white'>
            {pp[current-1]}
          </p>
        </div>
      </div>
	<Pagination bind:current={current} bind:num_items={pp.length} {per_page} />
</main>

<style>
    :global(body) {
		background-color: #1d3040;
        color: #919599;
	}
</style>
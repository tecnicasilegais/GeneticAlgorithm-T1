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

<main>
	<link href='https://unpkg.com/tailwindcss@0.3.0/dist/tailwind.min.css' rel='stylesheet'>
    
    <FileInput />
   
    <div class='mb-3'>
		<label for='size' class='form-label'>Selecione um arquivo de turmas</label>
		<input class='form-control' type='number' id='size' bind:value={sz}>
	</div>
    <div class='max-w-xs rounded overflow-hidden shadow-lg my-2'>
        <div class='px-6 py-4'>
          <p class='text-grey-darker text-base'>
            {pp[current-1]}
          </p>
        </div>
      </div>
	<Pagination bind:current={current} bind:num_items={pp.length} {per_page} />
</main>

<style>
</style>
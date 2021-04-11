<script src="https://cdnjs.cloudflare.com/ajax/libs/gpu.js/1.0.2/gpu.min.js" integrity="sha512-cr2nuynSuSV6MGtWlympE0qd1g1TKBuEhv9lcfbW8HrE9UbPPc8zMwcje1fb9w2kzxqRnsizh6c+YbE6Ab7wpg==" crossorigin="anonymous">
    import Bootstrap5 from "./components/Bootstrap5.svelte"
	import {textTolist} from './store'
	let lista = []
	export let fileContents
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
                        lista = textTolist(fileReader.result);
                    }
                    fileReader.readAsText(fileTobeRead);
                }
                else {
                    alert("Por favor selecione arquivo texto");
                }

            }, false);
        }
        else {
            alert("Arquivo(s) não suportado(s)");
        }
    }
</script>

<Bootstrap5 />
<main>
	<div class="mb-3">
		<label for="txtfiletoread" class="form-label">Selecione um arquivo de turmas</label>
		<input class="form-control" type="file" id="txtfiletoread">
	</div>
	<div>Conteúdo do arquivo:</div>
    <div id="filecontents">
    </div>
	<ul class="list-group">
		{#each lista as num }
			<li class="list-group-item">{num}</li>
		{/each}
	</ul>
</main>

<style>
</style>
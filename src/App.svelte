<script>
	import { Tabs, Tab, Window, WindowItem, AppBar, MaterialApp } from 'svelte-materialify';
  	let theme = 'dark';
	  let value = 0;
  	function toggleTheme() {
    	if (theme === 'light') theme = 'dark';
    	else theme = 'light';
  	}
	import Gen from './Gen.svelte';
	import Annealing from './Annealing.svelte';
	import { load } from './store.js';
	const active_btn = 'inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white';
	const inactive_btn = 'inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3';
	let current = 'ga';
	const showAnnealing = () => {
		document.getElementById('genetic').style.display='none';
		document.getElementById('annealing').style.display='';
		current = 'sa';
	}
	const showGenetic = () => {
		document.getElementById('annealing').style.display='none';
		document.getElementById('genetic').style.display='';
		current = 'ga';
	}
	window.onload = function () {
		//Check the support for the File API support
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			let fileSelected = document.getElementById('file_input_ga');
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
						let fileContents = fileReader.result;
						load(fileContents);
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
<MaterialApp {theme}>
	
	<Tabs class="green-text" bind:value fixedTabs>
	<div slot="tabs">
	  <Tab>Genetico</Tab>
	  <Tab>Annealing</Tab>
	</div>
	</Tabs>
	
	<div class="flex items-center justify-between ml-40 mb-5">
		<div class="flex flex-col text-center w-5/6 px-2">
			<label for='file_input_ga' class='form-label'>Selecione um arquivo</label>
			<input class='border-2 border-gray-300 py-1 bg-white text-black' type='file' id='file_input_ga' >
		</div>
	</div>
	<Window {value} class="ma-4">
		<WindowItem>
			<Gen />
		</WindowItem>
		<WindowItem>
			<Annealing />
		</WindowItem>
	</Window>
</MaterialApp>
<style>
	
</style>
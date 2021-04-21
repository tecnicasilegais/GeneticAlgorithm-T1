<script>
	import { Tabs, Tab, Window, WindowItem, Container, MaterialApp, TextField } from 'svelte-materialify';
  	let theme = 'dark';
	  let value = 0;
  	function toggleTheme() {
    	if (theme === 'light') theme = 'dark';
    	else theme = 'light';
  	}
	import Gen from './Gen.svelte';
	import Annealing from './Annealing.svelte';
	import { load } from './store.js';

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
	<Container>
		<Tabs class="deep-purple-text" bind:value fixedTabs>
		<div slot="tabs">
		  <Tab>Genetico</Tab>
		  <Tab>Annealing</Tab>
		</div>
		</Tabs>

		<div class="flex items-center justify-between ml-40 mb-5">
			<div class="flex flex-col text-center w-5/6 px-2">
				<TextField type='file' class="m-5" id='file_input_ga' outlined></TextField>
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
	</Container>
</MaterialApp>
<style>
	:global(body) {
		background-color: rgb(33, 41, 56);
        color: white;
	}
</style>
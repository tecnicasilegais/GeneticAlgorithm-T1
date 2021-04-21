<script>
   import { Modal, Button, Card } from 'svelte-chota';
 	let modal_open = false;
</script>

<main>
	<Button on:click={event => modal_open = true}>Show modal</Button>
	<Modal bind:open={modal_open}>
    	<Card>
        	Hello, I am a simple modal.
    	</Card>
	</Modal>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

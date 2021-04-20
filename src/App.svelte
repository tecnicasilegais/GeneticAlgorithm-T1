<script>
    import Gen from './Gen.svelte';
    import Annealing from './Annealing.svelte';

    const showAnnealing = () => {
        document.getElementById('genetic').style.display='none';
        document.getElementById('annealing').style.display='';
    }
    const showGenetic = () => {
        document.getElementById('annealing').style.display='none';
        document.getElementById('genetic').style.display='';
    }

</script>
<ul class="flex">
    <li class="mr-3">
        <button class="inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white" on:click={showGenetic} >Algoritmo Genetico</button>
    </li>
    <li class="mr-3">
        <button class="inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3" on:click={showAnnealing} >Simulated Annealing</button>
    </li>
</ul>

<div id="annealing" style="display: none">
    <Annealing />
</div>

<div id="genetic">
    <Gen />
</div>

<style>


</style>
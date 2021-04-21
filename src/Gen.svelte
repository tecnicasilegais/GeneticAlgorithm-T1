<script>
	import { load_run_ga, color_mutations, best_matches } from './store';
    import { Dialog,Row,Col,TextField,Button, List, ListItem, Divider, Card, CardActions, Icon } from 'svelte-materialify';
    import { slide } from 'svelte/transition';
	import Pagination from '@fouita/pagination';
    let active2;
    let value_expansion = false;
    let fill_json_data_array = [];
    let json_solution;

    function json_data(i) {
		return fill_json_data_array[i]
	}
    let current = 1;
    let per_page=1;
    export let cxpb = 0.8, psize = 20, mutpb = 0.4, ngen = 100;
    function showGA() {
        if(best_matches){
            [fill_json_data_array, json_solution] = load_run_ga(psize, ngen, mutpb, cxpb);
            document.getElementById('input_ga').style.display = "none";
        }else{
            alert('Selecione um arquivo')
        }
    }
    function reset_ga(){
        fill_json_data_array = [];
        document.getElementById('input_ga').style.display = "block";
    }
    function toggle() {
        value_expansion = !value_expansion;
    }

</script>


<main>
    <div class="w-100" id="input_ga">
        <Row>             
            <Col>
                <TextField type="number"  min='1' bind:value={psize} outlined>População</TextField>
            </Col>
            <Col>
                <TextField min='1' type='number' bind:value={ngen} outlined>Gerações</TextField>
            </Col>
            <Col>
                <TextField step='0.01' min='0' max='1' type='number' id='crosscha' bind:value={mutpb} outlined>Chance de mutação</TextField>
            </Col>
            <Col>
                <TextField type='number' step='0.01' min='0' max='1'  id='crosscha' bind:value={cxpb} outlined>Chance de crossover</TextField>
            </Col>
        </Row>
        <Button class="primary-color" on:click={showGA}>Enviar</Button> 
    </div>
    <div id='show' >
        {#if fill_json_data_array.length > 0}
            <div class='w-50'>
                <Row>
                    <Col>
                        <p class='text-lg text-center'>Geração: {json_data(current-1).generation}</p>
                    </Col>      
                    <Col>
                        <p class='text-lg text-center'><Button class="primary-color" on:click={() => (active2 = true)}>Melhor</Button>
                    </Col>
                    <Col>
                        <p class='text-lg text-center'><Button class="primary-color" on:click={reset_ga}>Reset</Button></p>
                    </Col>
                    <Col>
                    </Col>    
                </Row> 
            </div>
            <table class='rounded-t-lg m-5 w-full mx-auto bg-gray-200 text-gray-800'>
                <tr class='text-left border-b-2 border-gray-300 ' >
                    <th class='px-4 py-3'>População</th>
                    <th class='p-0' width='110px'>Fitnesses</th>
                </tr>
                {#each json_data(current-1).population as pop, i}
                    <tr class='{color_mutations(i, json_data(current-1).mutations)} border-b border-gray-200'>
                        <td class='px-4 py-3'>{pop}</td>
                        <td class='px-4 py-3'>{json_data(current-1).fitnesses[i]}</td>
                    </tr>
                {/each}
            </table>
            <div class="justify-between mb-5">
                <div class="flex flex-col text-right items-center w-100 px-2">
	            <Pagination bind:current={current} bind:num_items={fill_json_data_array.length} {per_page} />
                </div>
            </div>
        {/if}
    </div>
    <Dialog class="pa-4 text-center" bind:active={active2}>
        <!-- <p>Roomates {json_solution.chromosome}</p><br/> -->
        Cromossomo:<List><ListItem>{json_solution.chromosome}</ListItem></List>
        Fitness:<List><ListItem>{json_solution.fitness}</ListItem></List>
        {#if json_solution.halloffame}
        <Card class="w-full">
            <CardActions>
                <Button text class="w-full" on:click={toggle}>Hall of fame</Button>
            </CardActions>
            {#if value_expansion}
                <div transition:slide>
                    <Divider />
                    <Row>
                        <Col> 
                            Geração:<List><ListItem>{json_solution.halloffame.gen}</ListItem></List>
                        </Col>
                    </Row>
                    <Row>
                        <Col> 
                            Cromossomo:<List><ListItem>{json_solution.halloffame.chromosome}</ListItem></List>
                        </Col>
                    </Row>
                    <Row>
                        <Col> 
                            Fitness:<List><ListItem>{json_solution.halloffame.fitness}</ListItem></List>
                        </Col>
                    </Row>
                    <div class="d-flex justify-center">
                        <List dense class="elevation-2" style="width:300px">
                            {#each json_solution.decod_hof as dec, i}
                                {#if json_solution.decod_hof.length <= 10}
                                    <ListItem><p>A{i+1} -> {dec}</p></ListItem>
                                {:else}
                                    {#if i < json_solution.decod_hof.length/2 }
                                    <Row noGutters>
                                        <Col md={4}>
                                            <ListItem><p>A{i+1} -> {dec}</p></ListItem>
                                        </Col>
                                        <Col class="ml-auto" md={4}>
                                            <ListItem><p>A{i+json_solution.decod_hof.length/2+1} -> {json_solution.decod_hof[json_solution.decod_hof.length/2+i]}</p></ListItem> 
                                        </Col>
                                    </Row>
                                    {/if}
                                {/if}
                            {/each}
                        </List>
                    </div>
                </div>
            {/if}
        </Card>
        {/if}
        <p>{json_solution.by_convergence? 'Parou por convergencia': ''}</p><br/>
        <div class="d-flex justify-center">
            <List dense class="elevation-2" style="width:300px">
                {#each json_solution.decodified as dec, i}
                    {#if json_solution.decodified.length <= 10}
                        <ListItem><p>A{i+1} -> {dec}</p></ListItem>
                    {:else}
                        {#if i < json_solution.decodified.length/2 }
                        <Row noGutters>
                            <Col md={4}>
                                <ListItem><p>A{i+1} -> {dec}</p></ListItem>
                            </Col>
                            <Col class="ml-auto" md={4}>
                                <ListItem><p>A{i+json_solution.decodified.length/2+1} -> {json_solution.decodified[json_solution.decodified.length/2+i]}</p></ListItem> 
                            </Col>
                        </Row>
                        {/if}
                    {/if}
                {/each}
            </List>
        </div>
    </Dialog>
</main>

<style>
    :global(body) {
		background-color: rgb(33, 41, 56);
        color: white;
	}
</style>
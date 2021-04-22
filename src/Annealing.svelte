<script>
	import { load_run_sa, color_worse, best_matches} from './store';
    import { Dialog, List, ListItem, Row, Col, TextField, Button} from 'svelte-materialify';
    let active1;
    let fill_json_cycle_array = [];
    let json_solution;

    export let decrease_factor=0.6, niter=40;
    function showSA() {
        if(best_matches){
            [fill_json_cycle_array, json_solution ]= load_run_sa(niter, decrease_factor);
            document.getElementById('input_sa').style.display = "none";
        }else{
            alert('Selecione um arquivo!')
        }
    }
    function reset_sa(){
        fill_json_cycle_array = [];
        document.getElementById('input_sa').style.display = "block";
    }

</script>

<main>
    <div class="w-100" id="input_sa">
        <Row>             
            <Col>
                <TextField type="number"  min='1'  bind:value={niter} outlined>Iterações</TextField>
            </Col>
            <Col>
                <TextField type="number" step='0.01' min='0.01' max='1' bind:value={decrease_factor} outlined>Resfriamento</TextField>
            </Col>
        </Row>            
        <Button class="primary-color" on:click={showSA}>Enviar</Button> 
    </div>
    <div id='show' >
        {#if fill_json_cycle_array.length > 0}
            <div class="w-50">
                <Row>
                    <Col>
                    </Col>      
                    <Col>
                        <Button class="primary-color" on:click={() => (active1 = true)}>Melhor</Button> 
                    </Col>
                    <Col>
                        <Button class="primary-color" on:click={reset_sa}>Reset</Button>    
                    </Col>
                    <Col>
                    </Col>    
                </Row> 
            </div>
            <table class='rounded-t-lg m-5 w-5/6 mx-auto bg-gray-200 text-gray-800'>
                <tr class='text-left border-b-2 border-gray-300 ' >
                    <th class='px-4 py-3'>Ciclo</th>
                    <th class='px-4 py-3'>Temperatura</th>
                    <!--<th class='px-4 py-3'>Individuo</th>-->
                    <th class='p-0' width='110px'>Heurística</th>
                </tr>
                {#each fill_json_cycle_array as cycle, i}
                    <tr class='{color_worse(cycle.acc_worse)} border-b border-gray-200'>
                        <td class='px-4 py-3'>{cycle.cycle}</td>
                        <td class='px-4 py-3'>{cycle.temperature}</td>
                        <!--<td class='px-4 py-3'>{cycle.roommate}</td>-->
                        <td class='px-4 py-3'>{cycle.h}</td>
                    </tr>
                {/each}
            </table>
            <Dialog class="pa-4 text-center" bind:active={active1}>
                <!-- <p>Roomates {json_solution.chromosome}</p><br/> -->
                <div class="text-center">
                    Heurística:<List><ListItem>{json_solution.h}</ListItem></List>
                </div>
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
        {/if}
    </div>
</main>

<style>
    
</style>
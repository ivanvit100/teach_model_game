<!--
 - Игра "Жизнь учителя"
 - Игра представляет собой симулятор жизни учителя
 - Игроку предстоит принимать решения, влияющие на его параметры

 - Параметры: отношения с начальством, отношения с коллегами, 
 - отношения с родителями, отношения с ученикамми, свободное время
 
 - Используются принципы SOLID
 - Классы искать в ./classes.ts
 - Интерфейсы и типы искать в ./types.ts
 - Разработчик: ivanvit100 (ivanvit.ru)
-->

<script lang="ts">
import { onMount } from 'svelte';
import type { Action } from './types';
import { Page, currentSituation } from './classes';

let handleAction: (action: Action) => void; 
let page: Page;

onMount(async () => {
    page = new Page();

    handleAction = async (action: Action): Promise<void> => {
        page.parameters.forEach(param => {
            param.value = Math.min(10, param.value + action.effects[param.id as keyof typeof action.effects]);
        });
    
        if (page.checkEndGame()) return;
        page.UI.displayWarnings();
        page.score++;

        const situation = await page.Situations.getSituation();
        page.UI.updateParametersDisplay(situation);
    }

});

$: situation = $currentSituation;

</script>

<div id="app">
    <header>
        <h1>Teacher Life</h1>
    </header>
    {#if page && page.init}
    <div class="container">
        {#key $currentSituation} 
            <div class="card">
                <div class="situation">
                    { $currentSituation?.description }
                </div>
            </div>
            <div class="actions">
                {#if $currentSituation}
                    {#each $currentSituation.actions as action}
                        <input 
                            type="button" 
                            on:click={ () => handleAction(action) } 
                            disabled={ !page.flag } 
                            value={ action.description } 
                        >
                    {/each}
                {/if}
            </div>
        {/key}
    </div>
    <div class="status">
        <div id="score">{ page.score }</div>
    </div>
    <div class="parameters">
        {#each page.parameters as parameter}
        <div class="parameter">
            <div class="progress-bar">
                <div class="progress" style="background-color: { parameter.color };" id={ parameter.id }></div>
            </div>
            <div class="parameter-label">
                <img src={`icons/${ parameter.id }.png`} alt={ parameter.label } class="icon"> { parameter.label }
            </div>
        </div>
        {/each}
    </div>
    {:else if page}
    <div class="start_container">
        <input
            type="button"
            on:click={ () => page.restart() }
        >
    </div>
    <img src="{ page.lang }" alt="language switch" class="lang link">
    <button class="github link" on:click={ () => location.href="https://github.com/ivanvit100/teach_model_game" }>
        <img src="github.webp" alt="GitHub"> 
    </button>
    <img src="info.webp" alt="info" class="info link">
    {/if}
    <div id="warnings" class="warnings"></div>
</div>
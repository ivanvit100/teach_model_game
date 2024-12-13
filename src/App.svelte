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
        <h1>Teacher Life Game</h1>
    </header>
    {#if page && page.init}
    <div class="parameters">
        {#each page.parameters as parameter}
        <div class="parameter">
            <div class="parameter-label">
                <img src={`icons/${ parameter.id }.png`} alt={ parameter.label } class="icon"> { parameter.label }
            </div>
            <div class="progress-bar">
                <div class="progress" style="background-color: { parameter.color };" id={ parameter.id }></div>
            </div>
        </div>
        {/each}
    </div>
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
    <div class="status">
        <div id="score">Счет: { page.score }</div>
    </div>
    {:else if page}
    <div class="start">
        <input
            type="button"
            on:click={ () => page.restart() }
            value="Начать игру"
        >
    </div>
    {/if}
    <div id="warnings" class="warnings"></div>
    <div class="overall-container">
        <div class="overall-label">Общая оценка</div>
        <div class="overall-bar">
            <div class="overall-progress" id="overall-bar"></div>
        </div>
    </div>
</div>
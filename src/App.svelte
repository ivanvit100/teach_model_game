<script lang="ts">
	import { onMount } from 'svelte';
	import { Situation, Action, FixedEvent } from './types';
	
	let situations: Situation[] = [];
	let fixedEvents: FixedEvent[] = [];
	
	const parameters = [
		{ label: 'Администрация', id: 'administration', value: 10, message: 'Вы уволены!', warn: "Вы на грани увольнения!" },
		{ label: 'Коллеги', id: 'colleagues', value: 10, message: 'Профсоюз добился Вашего увольнения!', warn: "Отношения в коллективе напряженные." },
		{ label: 'Родители', id: 'parents', value: 10, message: 'Родители устроили скандал в школе.', warn: "Родители недовольны Вашей работой." },
		{ label: 'Ученики', id: 'students', value: 10, message: 'Ученики устроили бунт.', warn: "Ученики жалуются на Вас." },
		{ label: 'Свободное время', id: 'freeTime', value: 10, message: 'Вы выгорели.', warn: "Вы перерабатываете." }
	];
	
	let score: number = 0;
	
	function getRandomSituation(): Situation {
		const index = Math.floor(Math.random() * situations.length);
		return situations[index];
	}
	
	function displayCard(situation: Situation | FixedEvent) {
		document.getElementById('situation') !.innerText = `Ситуация: ${situation.description}`;
		const actionsDiv = document.getElementById('actions') !;
		actionsDiv.innerHTML = '';
		situation.actions.forEach((action, index) => {
			const button = document.createElement('button');
			button.innerText = action.description;
			button.onclick = () => handleAction(action);
			actionsDiv.appendChild(button);
		});
		updateParameters();
	}
	
	function updateParameters() {
		parameters.forEach(param => {
			const element = document.getElementById(param.id);
			if (element) element.style.height = param.value * 10 + '%';
		});
		document.getElementById('score') !.innerText = `Счет: ${score}`;
	
		const overall = calculateOverallScore();
		document.getElementById('overall-bar') !.style.width = overall + '%';
	}
	
	function calculateOverallScore(): number {
		const maxScore = 50;
		const currentScore = parameters.reduce((sum, param) => sum + param.value, 0);
		const hyperbolicScore = parameters.reduce((sum, param) => sum + 1 / param.value, 0) * 10;
		const normalizedScore = (currentScore / maxScore) * 100;
		const penalty = Math.max(0, 100 - normalizedScore - hyperbolicScore);
		return Math.min(100, normalizedScore - penalty);
	}
	
	function displayWarnings() {
		const warningsDiv = document.getElementById('warnings') !;
		warningsDiv.innerHTML = '';
		parameters.forEach(param => {
			if (param.value <= 2) {
				const warning = document.createElement('div');
				warning.className = 'warning';
				warning.innerText = param.warn;
				warningsDiv.appendChild(warning);
			}
		});
	}
	
	function displayEndGameMessage(message: string) {
		const warningsDiv = document.getElementById('warnings') !;
		warningsDiv.innerHTML = '';
		const endGameMessage = document.createElement('div');
		endGameMessage.className = 'end-game';
		endGameMessage.innerText = `Игра окончена! ${message}`;
		warningsDiv.appendChild(endGameMessage);
	}
	
	function checkEndGame() {
		const endGameParam = parameters.find(param => param.value <= 0);
		if (endGameParam) {
			displayEndGameMessage(endGameParam.message);
			return true;
		}
		return false;
	}

	function handleAction(action: Action) {
		parameters.forEach(param => {
			param.value = Math.min(10, param.value + action.effects[param.id as keyof typeof action.effects]);
		});
	
		if (checkEndGame()) return;
		displayWarnings();
	
		score++;
		const fixedEvent = fixedEvents.find(event => score % event.interval === 0);
		if (fixedEvent) {
			displayCard(fixedEvent);
		} else {
			const situation = getRandomSituation();
			displayCard(situation);
		}
	}
	
	onMount(async () => {
		const situationsResponse = await fetch('/public/situations.json');
		situations = await situationsResponse.json();
		
		const fixedEventsResponse = await fetch('/public/fixedEvents.json');
		fixedEvents = await fixedEventsResponse.json();

		const situation = getRandomSituation();
		displayCard(situation);
		updateParameters();
	});
	</script>

<div id="app">
    <header>
        <h1>Teacher Life Game</h1>
    </header>
    <div class="parameters">
		{#each parameters as parameter}
			<div class="parameter">
				<div class="parameter-label">
					<img src={`icons/${parameter.id}.png`} alt={parameter.label} class="icon"> {parameter.label}
				</div>
				<div class="progress-bar">
					<div class="progress" id={parameter.id}></div>
				</div>
			</div>
		{/each}
	</div>
    <div class="card">
        <div id="situation" class="situation"></div>
    </div>
    <div class="actions" id="actions"></div>
    <div class="status">
        <div id="score">Счет: 0</div>
    </div>
    <div id="warnings" class="warnings"></div>
    <div class="overall-container">
        <div class="overall-label">Общая оценка</div>
        <div class="overall-bar">
            <div class="overall-progress" id="overall-bar"></div>
        </div>
    </div>
</div>

<style>
</style>

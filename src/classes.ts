/**
 * Имплементация классов клиентской части приложения
 * Используются принципы SOLID
 * Интерфейсы и типы искать в ./types.ts
 * Разработчик: ivanvit100 (ivanvit.ru)
 */

import type { Situation, FixedEvent, Parameter, IUIManager, ISituationManager } from './types';
import { writable } from 'svelte/store';

/** Store для текущей ситуации в игре */
export const currentSituation = writable<Situation | FixedEvent | null>(null);

/**
 * Класс управления пользовательским интерфейсом
 * @class UI
 * @implements {IUIManager}
 */
class UI implements IUIManager {
    protected Page: Page;
    protected Situations: Situations;

    constructor(Page: Page, ST: Situations) {
        this.Page = Page;
        this.Situations = ST;
    }

    /**
     * Обновляет параметры и визуальное отображение
     * @param st - Текущая ситуация или фиксированное событие
     */
    async updateParameters(st: Situation | FixedEvent): Promise<void> {
        currentSituation.set(st);
        this.Situations.situation = st;
        
        // Обновление прогресс-баров параметров
        this.Page.parameters.forEach(param => {
            const element = document.getElementById(param.id);
            if (element) element.style.height = `${param.value * 10}%`;
        });
    
        // Обновление общего прогресс-бара
        const overall = this.Situations.calculateOverallScore();
        const overallBar = document.getElementById('overall-bar');
        if (overallBar) overallBar.style.width = `${overall}%`;
    }

    /**
     * Отображает предупреждения при низких значениях параметров
     */
    displayWarnings(): void {
        const warningsDiv = document.getElementById('warnings');
        if (!warningsDiv) return;
        
        warningsDiv.innerHTML = '';
        this.Page.parameters.forEach(param => {
            if (param.value <= 2) {
                const warning = document.createElement('div');
                warning.className = 'warning';
                warning.innerText = param.warn;
                warningsDiv.appendChild(warning);
            }
        });
    }

    /**
     * Отображает сообщение об окончании игры
     * @param message - Текст сообщения
     */
    displayEndGameMessage(message: string): void {
        const warningsDiv = document.getElementById('warnings');
        if (!warningsDiv) return;
        
        warningsDiv.innerHTML = '';
        const endGameMessage = document.createElement('div');
        endGameMessage.className = 'end-game';
        endGameMessage.innerText = `Игра окончена! ${message}\n\nВаш результат: ${this.Page.score} очков`;
        warningsDiv.appendChild(endGameMessage);
        this.Page.flag = false;
    }

    /**
     * Очищает предупреждения
     */
    clearWarnings(): void {
        const warningsDiv = document.getElementById('warnings');
        if (!warningsDiv) return;
        warningsDiv.innerHTML = '';
    }
}

/**
 * Класс управления ситуациями в игре
 * @class Situations
 * @implements {ISituationManager}
 */
class Situations implements ISituationManager {
    protected Page: Page;
    public situations: Situation[] = [];
    public fixedEvents: FixedEvent[] = [];
    public situation: Situation | FixedEvent;
    public now: number = 0;

    constructor(Page: Page) {
        this.Page = Page;
        this.getSituations();
        this.situation = this.getRandomSituation();
    }

    /**
     * Загружает данные игры из JSON файлов
     */
    async getSituations(): Promise<void> {
        try {
            const [situationsResponse, fixedEventsResponse, parametersResponse] = await Promise.all([
                fetch('/situations.json'),
                fetch('/fixedEvents.json'),
                fetch('/parameters.json')
            ]);

            this.situations = await situationsResponse.json();
            this.fixedEvents = await fixedEventsResponse.json();
            this.Page.parameters = await parametersResponse.json();

            this.Page.start();
        } catch (error) {
            console.error('[Situations] | getSituations(): ', error);
        }
    }

    /**
     * Возвращает случайную ситуацию
     * @returns {Situation} Случайная ситуация
     */
    getRandomSituation(): Situation {
        if (this.situations.length === 0) {
            setTimeout(() => this.getRandomSituation(), 50);
            return { description: 'Loading...', actions: [] };
        }

        const index = Math.floor(Math.random() * this.situations.length);
        if (index === this.now) return this.getRandomSituation();
        
        this.now = index;
        return this.situations[index];
    }

    /**
     * Рассчитывает общий счет игры
     * @returns {number} Процент общего счета
     */
    calculateOverallScore(): number {
        const maxScore = 50;
        const currentScore = this.Page.parameters.reduce((sum, param) => sum + param.value, 0);
        const hyperbolicScore = this.Page.parameters.reduce((sum, param) => sum + 1 / param.value, 0) * 10;
        const normalizedScore = (currentScore / maxScore) * 100;
        const penalty = Math.max(0, 100 - normalizedScore - hyperbolicScore);
        
        return Math.min(100, normalizedScore - penalty);
    }
}

/**
 * Основной класс игры
 * @class Page
 */
export class Page {
    public UI: IUIManager;
    public Situations: ISituationManager;
    public score: number = 0;
    public flag: boolean = true;
    public parameters: Parameter[] = [];
    public init: boolean = false;

    constructor() {
        this.Situations = new Situations(this);
        this.UI = new UI(this, this.Situations as Situations);
    }

    /**
     * Запускает игру
     */
    start(): void {
        const situation = this.Situations.getRandomSituation();
        
        requestAnimationFrame(() => {
            this.UI.updateParameters(situation);
        });
    }
    
    /**
     * Перезапускает игру (реакция на кнопку)
    */
   async restart(): Promise<void> {
        await this.Situations.getSituations();
        this.score = 0;
        this.Situations.now = 0;
        this.flag = true;
        this.init = true;
        this.start();
        this.UI.clearWarnings();
    }

    /**
     * Проверяет условия окончания игры
     * @returns {boolean} true если игра окончена
     */
    checkEndGame(): boolean {
        const endGameParam = this.parameters.find(param => param.value <= 0);
        if (endGameParam) {
            this.UI.updateParameters(this.Situations.situation!);
            this.UI.displayEndGameMessage(endGameParam.message);
            this.init = false;
            return true;
        }
        return false;
    }
}
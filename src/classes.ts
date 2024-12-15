/**
 * Имплементация классов клиентской части приложения
 * Используются принципы SOLID
 * Интерфейсы и типы искать в ./types.ts
 * Разработчик: ivanvit100 (ivanvit.ru)
 */

import type { Situation, FixedEvent, Parameter, IUIManager, ISituationManager, IRequest } from './types';
import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

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
    async updateParametersDisplay(st: Situation | FixedEvent): Promise<void> {
        currentSituation.set(st);
        this.Situations.situation = st;
        
        // Обновление прогресс-баров параметров
        this.Page.parameters.forEach(param => {
            const element = document.getElementById(param.id);
            if (element) element.style.height = `${param.value * 10}%`;
        });
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
 * Класс запросов к серверу
 * @class Request
 * @implements {IRequest}
 */
class Request implements IRequest {
    #page: Page;
    public now: number = 0;

    constructor(page: Page) {
        this.#page = page;
    }

    /**
     * Загружает параметры из JSON файлов посредством запроса к серверу
     * @returns {Promise<void>}
     * @throws {Error} Ошибка при запросе
     */
    async getParameters(): Promise<void> {
        try {
            this.#page.parameters = (await invoke('get_parameters', { day: this.now })) as Parameter[];
            console.log(this.#page.parameters);
            this.#page.start(); 
        } catch (error) {
            console.error('[Request] | getParameters(): ', error);
            throw error;
        }
    }

    /**
     * Получает случайную ситуацию
     * @returns {Promise<Situation>} Случайная ситуация
     * @throws {Error} Ошибка при запросе
     */
    async getRandomSituation(): Promise<Situation> {
        try {
            const situation = (await invoke('generate_question', { day: this.now })) as Situation;
            return situation;
        } catch (error) {
            console.error('[Request] | getRandomSituation(): ', error);
            throw error;
        }
    }

    /**
     * Возвращает язык интерфейса
     * @returns {Promise<string>} Язык интерфейса
     * @throws {Error} Ошибка при запросе
     * @todo Реализовать получение языка
     */
    async getLanguage(): Promise<string> {
        let lang: string = 'ru-RU';
        return `langs/${lang}.webp`;
    }

    /**
     * Устанавливает язык интерфейса
     * @param {string} lang - Язык интерфейса
     * @returns {Promise<void>}
     * @throws {Error} Ошибка при запросе
     * @todo Реализовать установку языка
     */
    async setLanguage(lang: string): Promise<void> {
        console.log(`[Request] | setLanguage(${lang})`);
    }
}

/**
 * Класс управления игровыми ситуациями
 * @class Situations
 * @implements {ISituationManager}
 */
class Situations implements ISituationManager {
    #page: Page;
    public situation: Situation | FixedEvent | null = null;

    constructor(page: Page) {
        this.#page = page;
    }
    
    /**
     * Получает случайную ситуацию посредством обращения к Request
     * @returns {Promise<Situation | FixedEvent>} Ситуация или фиксированное событие
     */
    async getSituation(): Promise<Situation | FixedEvent> {
        this.#page.Request.now++;
        this.situation = await this.#page.Request.getRandomSituation();
        return this.situation!;
    }
    
    /**
     * Перезапускает игру
     * @returns {Promise<void>}
     */
    async restart(): Promise<void> {
        await this.#page.Request.getParameters();
        this.situation = null;
        this.#page.Request.now = 0;
    }
}

/**
 * Основной класс игры
 * @class Page
 */
export class Page {
    public UI!: IUIManager;
    public Request!: IRequest;
    public Situations!: ISituationManager;
    public score: number = 0;
    public flag: boolean = true;
    public parameters: Parameter[] = [];
    public init: boolean = false;
    public lang: string = '/langs/en-US.webp';

    constructor() {
        this.initialize();
    }
    
    /**
     * Инициализация классов
     * @returns {Promise<void>}
     */
    private async initialize(): Promise<void> {
        this.Situations = new Situations(this);
        this.Request = new Request(this);
        this.lang = await this.Request.getLanguage();
        this.UI = new UI(this, this.Situations as Situations);
    }

    /**
     * Запускает игру
     */
    async start(): Promise<void> {
        const situation = this.Situations.getSituation();
        requestAnimationFrame(async () => {
            this.UI.updateParametersDisplay(await situation);
        });
    }
    
    /**
     * Перезапускает игру (реакция на кнопку)
    */
    async restart(): Promise<void> {
        this.score = 0;
        await this.Situations.restart();
        this.flag = true;
        this.init = true;
        await this.start();
        this.UI.clearWarnings();
    }

    /**
     * Проверяет условия окончания игры
     * @returns {boolean} true если игра окончена
     */
    checkEndGame(): boolean {
        const endGameParam = this.parameters.find(param => param.value <= 0);
        if (endGameParam) {
            this.UI.updateParametersDisplay(this.Situations.situation!);
            this.UI.displayEndGameMessage(endGameParam.message);
            this.init = false;
            return true;
        }
        return false;
    }
}
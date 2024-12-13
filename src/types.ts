/**
 * Объявление типов и интерфейсов клиентсокй части приложения
 * Разработчик: ivanvit100 (ivanvit.ru)
 * @module types
 */

import type { Page } from "./classes";

/**
 * Действие, которое может совершить игрок
 * @typedef Action
 */
export type Action = {
    description: string;
    effects: {
        administration: number;
        colleagues: number;
        parents: number;
        students: number;
        freeTime: number;
    };
};

/**
 * Игровая ситуация
 * @typedef Situation
 */
export type Situation = {
    description: string;
    actions: Action[];
};

/**
 * Фиксированное событие, происходящее через определенные интервалы
 * @typedef FixedEvent
 * @extends Situation
 */
export interface FixedEvent extends Situation {
    interval: number;
}

/**
 * Параметр игры
 * @typedef Parameter
 */
export type Parameter = {
    label: string;
    id: string;
    value: number;
    warn: string;
    message: string;
    color: string;
};

/**
 * Интерфейс для управления пользовательским интерфейсом
 * @interface IUIManager
 */
export interface IUIManager {
    /**
     * Обновляет параметры на основе текущей ситуации
     * @param {Situation | FixedEvent} st - Ситуация или фиксированное событие
     * @returns {Promise<void>} Промис, который разрешается после обновления параметров
     */
    updateParametersDisplay(st: Situation | FixedEvent): Promise<void>;

    /**
     * Отображает предупреждения при низких значениях параметров
     */
    displayWarnings(): void;

    /**
     * Отображает сообщение об окончании игры
     * @param {string} message - Текст сообщения
     */
    displayEndGameMessage(message: string): void;

    /**
     * Очищает предупреждения
     */
    clearWarnings(): void;
}

/**
 * Интерфейс для управления запросами
 * @interface IRequest
 */
export interface IRequest {
    now: number;
    /**
     * Загружает ситуации из JSON файлов
     */
    getParameters(): Promise<void>;
    
    /**
     * Возвращает случайную ситуацию
     * @returns {Situation} Случайная ситуация
     */
    getRandomSituation(): Promise<Situation>;
}

/**
 * Интерфейс для управления игровыми ситуациями
 * @interface ISituationManager
 */
export interface ISituationManager {
    situation: Situation | FixedEvent | null;

    /**
     * Вычисляет общий счет игры
     * @returns {number} Процент общего счета
     */
    calculateOverallScore(): number;

    /**
     * Возвращает текущую ситуацию
     * @returns {Situation | FixedEvent} Текущая ситуация или фиксированное событи
     */
    getSituation(): Promise<Situation | FixedEvent>;

    /**
     * Перезапускает игру
     */
    restart(): Promise<void>;
}
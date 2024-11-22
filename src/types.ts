/**
 * Объявление типов и интерфейсов клиентсокй части приложения
 * Разработчик: ivanvit100 (ivanvit.ru)
 * @module types
 */

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
    updateParameters(st: Situation | FixedEvent): Promise<void>;

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
 * Интерфейс для управления игровыми ситуациями
 * @interface ISituationManager
 */
export interface ISituationManager {
    situations: Situation[];
    fixedEvents: FixedEvent[];
    situation: Situation | FixedEvent;
    now: number;

    /**
     * Загружает ситуации из JSON файлов
     */
    getSituations(): Promise<void>;

    /**
     * Возвращает случайную ситуацию
     * @returns {Situation} Случайная ситуация
     */
    getRandomSituation(): Situation;

    /**
     * Вычисляет общий счет игры
     * @returns {number} Процент общего счета
     */
    calculateOverallScore(): number;
}
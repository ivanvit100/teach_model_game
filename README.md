# Симулятор Жизни Учителя
Игра-симулятор, в которой вы играете роль учителя и управляете его повседневной жизнью.

## Описание
В этой игре вам предстоит принимать различные решения, которые влияют на следующие параметры:

- 👨‍💼 Отношения с администрацией
- 👥 Отношения с коллегами
- 👪 Отношения с родителями
- 🎓 Отношения с учениками
- ⌚ Свободное время

Каждое решение имеет свои последствия и влияет на разные аспекты вашей профессиональной жизни.
Данная игра предназначена для подготовки молодых преподавателей к профессиональной деятельности.

## Особенности
- Случайные события и ситуации
- Фиксированные события через определенные промежутки времени
- Цепочки событий с различными исходами
- Система предупреждений при низких показателях
- Подсчет очков и общей оценки эффективности
- Различные концовки в зависимости от ваших решений

## Технологии
- TypeScript
- Svelte
- Tauri

## Установка и запуск
1. Клонировать репозиторий
2. Установить зависимости: `npm install`
3. Запустить в режиме разработки: `npm run tauri dev`
4. Собрать приложение: `npm run tauri build`

## Разработка

Проект написан с использованием принципов `SOLID`. 

### Frontend

- Основной скрипт и вёрстка в [App.svelte](/src/App.svelte)
- Классы в [classes.ts](/src/classes.ts)
- Типы и интерфейсы в [types.ts](/src/types.ts)
- Данные ситуаций в [situations.json](/public/situations.json)
- Фиксированные события (происходящие с определенной периодичностью) в [fixedEvents.json](/public/fixedEvents.json)
- Параметры (администрация, коллеги, родители, ученики, свободное время) в [parameters.json](/public/parameters.json)

### Backend
Coming soon...

## Материалы
Лицензия: [MIT](/LICENSE)

## Авторы
- Frontend: [Иванущенко Виталий Александрович](https://ivanvit.ru)
- Backend: [Миннахметов Алмаз Ильдарович](https://github.com/BlackRavenoo)
- Game design:
- Методическое сопровождение: [Костин Андрей Викторович](https://kpfu.ru/main?p_id=38150)
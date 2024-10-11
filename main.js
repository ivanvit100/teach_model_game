// Список ситуаций
const situations = [
    {
      description: "Администрация просит вас провести дополнительное занятие.",
      actions: [
        {
          description: "Согласиться",
          effects: { administration: 2, colleagues: 0, parents: 0, students: 1, freeTime: -2 }
        },
        {
          description: "Отказать",
          effects: { administration: -2, colleagues: 0, parents: 0, students: -1, freeTime: 1 }
        }
      ]
    },
    {
      description: "Коллега просит помочь с проектом.",
      actions: [
        {
          description: "Помочь",
          effects: { administration: 0, colleagues: 2, parents: 0, students: 0, freeTime: -2 }
        },
        {
          description: "Отказать",
          effects: { administration: 0, colleagues: -2, parents: 0, students: 0, freeTime: 1 }
        }
      ]
    },
    {
      description: "Родители ученика просят провести индивидуальную консультацию.",
      actions: [
        {
          description: "Согласиться",
          effects: { administration: 0, colleagues: 0, parents: 2, students: 1, freeTime: -2 }
        },
        {
          description: "Отказать",
          effects: { administration: 0, colleagues: 0, parents: -2, students: -1, freeTime: 1 }
        }
      ]
    },
    {
      description: "Ученик просит дополнительное занятие.",
      actions: [
        {
          description: "Согласиться",
          effects: { administration: 0, colleagues: 0, parents: 0, students: 2, freeTime: -2 }
        },
        {
          description: "Отказать",
          effects: { administration: 0, colleagues: 0, parents: 0, students: -2, freeTime: 1 }
        }
      ]
    },
    {
      description: "Вам предложили провести внеклассное мероприятие.",
      actions: [
        {
          description: "Согласиться",
          effects: { administration: 1, colleagues: 1, parents: 1, students: 1, freeTime: -3 }
        },
        {
          description: "Отказать",
          effects: { administration: -1, colleagues: -1, parents: -1, students: -1, freeTime: 2 }
        }
      ]
    }
    // Добавьте больше ситуаций по необходимости
  ];
  
  // Фиксированные события
  const fixedEvents = [
    {
      interval: 20,
      description: "Экзамены",
      actions: [
        {
          description: "Подготовить учеников",
          effects: { administration: 1, colleagues: 0, parents: 1, students: 2, freeTime: -3 }
        },
        {
          description: "Не готовить",
          effects: { administration: -2, colleagues: 0, parents: -2, students: -2, freeTime: 1 }
        }
      ]
    },
    {
      interval: 50,
      description: "Повышение квалификации",
      actions: [
        {
          description: "Пройти курсы",
          effects: { administration: 2, colleagues: 1, parents: 0, students: 0, freeTime: -3 }
        },
        {
          description: "Игнорировать",
          effects: { administration: -2, colleagues: -1, parents: 0, students: 0, freeTime: 1 }
        }
      ]
    }
  ];
  
  let parameters = {
    administration: 10,
    colleagues: 10,
    parents: 10,
    students: 10,
    freeTime: 10
  };
  
  let score = 0;
  
  // Функция для выбора случайной ситуации
  function getRandomSituation() {
    const index = Math.floor(Math.random() * situations.length);
    return situations[index];
  }
  
  // Функция для отображения карточки
  function displayCard(situation) {
    document.getElementById('situation').innerText = `Ситуация: ${situation.description}`;
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = '';
    situation.actions.forEach((action, index) => {
      const button = document.createElement('button');
      button.innerText = action.description;
      button.onclick = () => handleAction(action);
      actionsDiv.appendChild(button);
    });
    updateParameters();
  }
  
  // Функция для обновления параметров на экране
  function updateParameters() {
    document.getElementById('administration-bar').style.height = parameters.administration * 10 + '%';
    document.getElementById('colleagues-bar').style.height = parameters.colleagues * 10 + '%';
    document.getElementById('parents-bar').style.height = parameters.parents * 10 + '%';
    document.getElementById('students-bar').style.height = parameters.students * 10 + '%';
    document.getElementById('freeTime-bar').style.height = parameters.freeTime * 10 + '%';
    document.getElementById('score').innerText = `Счет: ${score}`;
  
    const overall = calculateOverallScore();
    document.getElementById('overall-bar').style.width = overall + '%';
  }
  
  // Функция для расчета общей оценки
  function calculateOverallScore() {
    const maxScore = 50;
    const currentScore = parameters.administration + parameters.colleagues + parameters.parents + parameters.students + parameters.freeTime;
    const hyperbolicScore = (1 / parameters.administration + 1 / parameters.colleagues + 1 / parameters.parents + 1 / parameters.students + 1 / parameters.freeTime) * 10;
    const normalizedScore = (currentScore / maxScore) * 100;
    const penalty = Math.max(0, 100 - normalizedScore - hyperbolicScore);
    return Math.min(100, normalizedScore - penalty);
  }
  
  // Функция для отображения предупреждений
  function displayWarnings() {
    const warningsDiv = document.getElementById('warnings');
    warningsDiv.innerHTML = '';
  
    if (parameters.administration <= 2) {
      const warning = document.createElement('div');
      warning.className = 'warning';
      warning.innerText = 'Вы на грани увольнения!';
      warningsDiv.appendChild(warning);
    }
    if (parameters.colleagues <= 2) {
      const warning = document.createElement('div');
      warning.className = 'warning';
      warning.innerText = 'Отношения в коллективе напряженные.';
      warningsDiv.appendChild(warning);
    }
    if (parameters.parents <= 2) {
      const warning = document.createElement('div');
      warning.className = 'warning';
      warning.innerText = 'Родители недовольны Вашей работой.';
      warningsDiv.appendChild(warning);
    }
    if (parameters.students <= 2) {
      const warning = document.createElement('div');
      warning.className = 'warning';
      warning.innerText = 'Ученики жалуются на Вас.';
      warningsDiv.appendChild(warning);
    }
    if (parameters.freeTime <= 2) {
      const warning = document.createElement('div');
      warning.className = 'warning';
      warning.innerText = 'Вы перерабатываете.';
      warningsDiv.appendChild(warning);
    }
  }
  
  // Функция для отображения сообщения об окончании игры
  function displayEndGameMessage(message) {
    const warningsDiv = document.getElementById('warnings');
    warningsDiv.innerHTML = '';
    const endGameMessage = document.createElement('div');
    endGameMessage.className = 'end-game';
    endGameMessage.innerText = `Игра окончена! ${message}`;
    warningsDiv.appendChild(endGameMessage);
  }
  
  // Функция для обработки действия
  function handleAction(action) {
    parameters.administration = Math.min(10, parameters.administration + action.effects.administration);
    parameters.colleagues = Math.min(10, parameters.colleagues + action.effects.colleagues);
    parameters.parents = Math.min(10, parameters.parents + action.effects.parents);
    parameters.students = Math.min(10, parameters.students + action.effects.students);
    parameters.freeTime = Math.min(10, parameters.freeTime + action.effects.freeTime);
  
    if (parameters.administration <= 0) {
      displayEndGameMessage('Вы уволены!');
      return;
    }
    if (parameters.colleagues <= 0) {
      displayEndGameMessage('Профсоюз добился Вашего увольнения!');
      return;
    }
    if (parameters.parents <= 0) {
      displayEndGameMessage('Родители устроили скандал в школе.');
      return;
    }
    if (parameters.students <= 0) {
      displayEndGameMessage('Ученики устроили бунт.');
      return;
    }
    if (parameters.freeTime <= 0) {
      displayEndGameMessage('Вы выгорели.');
      return;
    }
  
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
  
  // Запуск приложения
  document.addEventListener('DOMContentLoaded', () => {
    const situation = getRandomSituation();
    displayCard(situation);
    updateParameters();
    displayWarnings();
  });
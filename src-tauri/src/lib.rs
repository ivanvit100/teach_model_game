use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use tauri::State;
use rand::Rng;

#[derive(Deserialize, Serialize, Clone, Debug)]
struct Effects {
    administration: i8,
    colleagues: i8,
    parents: i8,
    students: i8,
    #[serde(rename = "freeTime")]
    free_time: i8,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct Action {
    description: String,
    effects: Effects
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct Event {
    description: String,
    actions: Vec<Action>
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct FixedEvent {
    interval: usize,
    description: String,
    actions: Vec<Action>
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct Parameter {
    label: String,
    id: String,
    value: i8,
    message: String,
    warn: String,
    color: String
}

struct AppState {
    events: Vec<Event>,
    previous_situation_idx: Mutex<usize>,
    fixed_events: Vec<FixedEvent>,
    parameters: Vec<Parameter>
}

impl AppState {
    pub fn new() -> Self {
        let situations = include_str!("../../data/situations.json");

        let events: Vec<Event> = serde_json::from_str(situations)
            .map_err(|e| e.to_string()).expect("Something went wrong with situations.json");
        
        if events.len() < 3 {
            panic!("The number of events must be more than 2")
        }

        let fixed_events = include_str!("../../data/fixedEvents.json");

        let mut fixed_events: Vec<FixedEvent> = serde_json::from_str(fixed_events)
            .map_err(|e| e.to_string()).expect("Something went wrong with fixedEvents.json");

        fixed_events.sort_by(|a, b| b.interval.cmp(&a.interval));

        let parameters = include_str!("../../data/parameters.json");

        let parameters: Vec<Parameter> = serde_json::from_str(parameters)
            .map_err(|e| e.to_string()).expect("Something went wrong with parameters.json");

        Self {
            events,
            previous_situation_idx: usize::MAX.into(),
            fixed_events,
            parameters
        }        
    }

    pub fn get_event(&self, day: usize) -> Event {
        if day != 0 {
            for fixed_event in &self.fixed_events {
                if day % fixed_event.interval == 0 {
                    return Event {
                        description: fixed_event.description.clone(),
                        actions: fixed_event.actions.clone()
                    };
                }
            }
        }

        let mut rng = rand::thread_rng();
        let mut prev_idx = self.previous_situation_idx.lock().unwrap();

        for _ in 0..10 {
            let new_index = rng.gen_range(0..self.events.len());
            if new_index != *prev_idx {
                *prev_idx = new_index;
                return self.events[new_index].clone()
            }
        }

        self.events[0].clone()
    }

    pub fn get_parameters(&self) -> Vec<Parameter> {
        self.parameters.clone()
    }
}

#[tauri::command]
async fn generate_question<'a>(day: usize, state: State<'_, AppState>) -> Result<Event, String> {
    let event = state.get_event(day);

    Ok(event.clone())
}

#[tauri::command]
async fn get_parameters(state: State<'_, AppState>) -> Result<Vec<Parameter>, String> {
    let parameters = state.get_parameters();

    Ok(parameters)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            generate_question,
            get_parameters
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

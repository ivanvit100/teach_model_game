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

struct AppState {
    events: Vec<Event>,
    previous_situation_idx: Mutex<usize>,
    fixed_events: Vec<FixedEvent>
}

impl AppState {
    pub fn new() -> Self {
        let content = include_str!("../../public/situations.json");

        let events: Vec<Event> = serde_json::from_str(content)
            .map_err(|e| e.to_string()).expect("Something went wrong with situations.json");
        
        if events.len() < 3 {
            panic!("The number of events must be more than 2")
        }

        let fixed_events = include_str!("../../public/fixedEvents.json");

        let mut fixed_events: Vec<FixedEvent> = serde_json::from_str(fixed_events)
            .map_err(|e| e.to_string()).expect("Something went wrong with fixedEvents.json");

        fixed_events.sort_by(|a, b| b.interval.cmp(&a.interval));

        println!("Fixed events: {:?}", fixed_events);

        Self {
            events,
            previous_situation_idx: usize::MAX.into(),
            fixed_events
        }        
    }

    pub fn take_random_event(&self) -> &Event {
        assert!(self.events.len() > 2);

        let mut rng = rand::thread_rng();
        let mut prev_idx = self.previous_situation_idx.lock().unwrap();

        for _ in 0..10 {
            let new_index = rng.gen_range(0..self.events.len());
            if new_index != *prev_idx {
                *prev_idx = new_index;
                return &self.events[new_index]
            }
        }

        &self.events[0]
    }
}

#[tauri::command]
async fn generate_question<'a>(day: usize, state: State<'_, AppState>) -> Result<Event, String> {
    if day != 0 {
        for fixed_event in &state.fixed_events {
            if day % fixed_event.interval == 0 {
                return Ok(Event {
                    description: fixed_event.description.clone(),
                    actions: fixed_event.actions.clone()
                });
            }
        }
    }

    let event = state.take_random_event();

    Ok(event.clone())
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
            generate_question
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

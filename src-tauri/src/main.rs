// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use enigo::*;
use std::{thread, time};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn pasteToAppWithText(text: &str) -> String {
//     pasteToApp();
//     format!("Pasted: {}", text)
// }
#[tauri::command]
fn paste_to_app() -> bool {
    let mut enigo = Enigo::new();
    // Alt-Tab
    enigo.key_down(Key::Alt);
    enigo.key_click(Key::Tab);
    enigo.key_up(Key::Alt);

    let dur = time::Duration::from_millis(500);
    thread::sleep(dur);
    // Ctrl-V
    enigo.key_down(Key::Control);
    enigo.key_click(Key::Layout('v'));
    enigo.key_up(Key::Control);
    true
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![paste_to_app])
        // .invoke_handler(tauri::generate_handler![pasteToAppWithText])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

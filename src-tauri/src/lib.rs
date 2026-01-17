mod crypto;

use std::fs;
use tauri::Manager;

#[tauri::command]
fn decrypt_story(app_handle: tauri::AppHandle, story_id: String) -> Result<String, String> {
    // Get the resource path - in Tauri 2, resources are in the same dir as the exe
    let resource_path = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?
        .join(format!("{}.enc", story_id));

    // Log the path we're trying
    println!("Looking for story at: {}", resource_path.display());

    // Read the encrypted content
    let encrypted_content = fs::read_to_string(&resource_path)
        .map_err(|e| format!("Failed to read story file '{}': {}", resource_path.display(), e))?;

    // Decrypt and return
    crypto::decrypt_story_content(&encrypted_content)
}

#[tauri::command]
fn list_available_stories(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let resource_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    println!("Resource dir: {}", resource_dir.display());

    let mut stories = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&resource_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "enc") {
                if let Some(stem) = path.file_stem() {
                    stories.push(stem.to_string_lossy().to_string());
                }
            }
        }
    }

    println!("Found stories: {:?}", stories);
    Ok(stories)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![decrypt_story, list_available_stories])
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

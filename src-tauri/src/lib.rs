mod crypto;

use tauri::Manager;
use tauri_plugin_fs::FsExt;

#[tauri::command]
fn decrypt_story(app_handle: tauri::AppHandle, story_id: String) -> Result<String, String> {
    let filename = format!("{}.enc", story_id);

    // Use tauri-plugin-fs to read resources — works on both desktop AND Android
    // (Android bundles resources as APK assets, not accessible via std::fs)
    let scope = app_handle.fs_scope();
    let resource_path = app_handle
        .path()
        .resolve(&filename, tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve resource path: {}", e))?;

    // Allow the path in the fs scope
    let _ = scope.allow_file(&resource_path);

    println!("Looking for story at: {}", resource_path.display());

    let encrypted_content = app_handle
        .fs()
        .read_to_string(&resource_path)
        .map_err(|e| format!("Failed to read story file '{}': {}", resource_path.display(), e))?;

    // Decrypt and return
    crypto::decrypt_story_content(&encrypted_content)
}

#[tauri::command]
fn list_available_stories(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    // On Android, read_dir doesn't work on asset URIs.
    // Instead, try to resolve the story ID from the build config directly.
    // The build-game script bundles exactly one story per build, so we try known patterns.

    // First, try reading story-config.json which is bundled during build
    let config_path = app_handle
        .path()
        .resolve("story-config.json", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve config path: {}", e))?;

    let scope = app_handle.fs_scope();
    let _ = scope.allow_file(&config_path);

    if let Ok(config_str) = app_handle.fs().read_to_string(&config_path) {
        if let Ok(config) = serde_json::from_str::<serde_json::Value>(&config_str) {
            if let Some(story_id) = config.get("storyId").and_then(|v| v.as_str()) {
                println!("Found story from config: {}", story_id);
                return Ok(vec![story_id.to_string()]);
            }
        }
    }

    // Fallback: try to find .enc files via resource_dir (works on desktop)
    let resource_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    println!("Resource dir: {}", resource_dir.display());

    let mut stories = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&resource_dir) {
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
        .plugin(tauri_plugin_fs::init())
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

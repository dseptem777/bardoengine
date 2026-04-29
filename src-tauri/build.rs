fn main() {
    // Load .env from the workspace root (one level up from src-tauri/).
    // Silent if missing — keeps CI flexibility (secrets injected via real env vars there).
    dotenvy::from_path("../.env").ok();

    // Re-run this build script whenever .env changes or any of the three secrets change.
    println!("cargo:rerun-if-changed=../.env");
    println!("cargo:rerun-if-env-changed=BARDO_SECRET_A");
    println!("cargo:rerun-if-env-changed=BARDO_SECRET_B");
    println!("cargo:rerun-if-env-changed=BARDO_OBFUSCATION_SEED");

    // Forward the secrets as compile-time env vars for the env!() macros in crypto.rs.
    for var in &["BARDO_SECRET_A", "BARDO_SECRET_B", "BARDO_OBFUSCATION_SEED"] {
        if let Ok(val) = std::env::var(var) {
            println!("cargo:rustc-env={var}={val}");
        }
    }

    tauri_build::build()
}

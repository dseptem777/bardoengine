fn main() {
    // Load .env from the workspace root (one level up from src-tauri/).
    // Silent if missing — keeps CI flexibility (secrets injected via real env vars there).
    dotenvy::from_path("../.env").ok();

    // Re-run this build script whenever .env changes or any of the three secrets change.
    println!("cargo:rerun-if-changed=../.env");
    println!("cargo:rerun-if-env-changed=BARDO_SECRET_A");
    println!("cargo:rerun-if-env-changed=BARDO_SECRET_B");
    println!("cargo:rerun-if-env-changed=BARDO_OBFUSCATION_SEED");

    // Re-embed the frontend whenever ANY file under dist/ changes. Cargo only
    // tracks a directory shallowly with `rerun-if-changed=../dist`, so we walk
    // the tree and emit one directive per file. This is what guarantees the
    // Android .so picks up fresh frontend bundles instead of caching stale
    // ones (which previously shipped broken builds — see commit history).
    fn rerun_for_dir(dir: &std::path::Path) {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    rerun_for_dir(&path);
                } else {
                    println!("cargo:rerun-if-changed={}", path.display());
                }
            }
        }
    }
    println!("cargo:rerun-if-changed=../dist");
    rerun_for_dir(std::path::Path::new("../dist"));

    // Forward the secrets as compile-time env vars for the env!() macros in crypto.rs.
    for var in &["BARDO_SECRET_A", "BARDO_SECRET_B", "BARDO_OBFUSCATION_SEED"] {
        if let Ok(val) = std::env::var(var) {
            println!("cargo:rustc-env={var}={val}");
        }
    }

    tauri_build::build()
}

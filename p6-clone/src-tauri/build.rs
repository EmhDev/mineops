fn main() {
    std::env::set_var("PROTOC", protoc_bin_vendored::protoc_bin_path().unwrap());
    tonic_build::configure()
        .build_server(true)
        .compile(&["proto/cpm.proto"], &["proto"])
        .unwrap();
    tauri_build::build()
}

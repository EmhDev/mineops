// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use p6_clone_lib::grpc::cpm_grpc::cpm_service_server::CpmServiceServer;
use p6_clone_lib::grpc::CpmGrpcServer;
use tonic::transport::Server;

#[tokio::main]
async fn main() {
    // Levantar el servidor gRPC en un hilo de background de tokio
    tokio::spawn(async move {
        let addr = "[::1]:50051".parse().unwrap();
        let grpc_service = CpmGrpcServer::default();

        println!("gRPC Server listening on {}", addr);
        
        Server::builder()
            .add_service(CpmServiceServer::new(grpc_service))
            .serve(addr)
            .await
            .unwrap();
    });

    p6_clone_lib::run()
}

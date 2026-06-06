# Changelog

Todas las versiones notables de este proyecto serán documentadas en este archivo.

## [Unreleased] - 2026-06-06

### Añadido (Fase 1)
- Proyecto base usando Tauri (Frontend en React + TypeScript).
- Estructuras de datos (Models) en Rust para Actividades y Relaciones (`models.rs`).
- Motor de cálculo CPM (Método de la Ruta Crítica) escrito en Rust utilizando la teoría de Grafos (`petgraph`).
- Detección de ciclos/bucles de dependencias.
- Cálculo de *Early Start*, *Early Finish*, *Late Start*, *Late Finish*, *Total Float* y *Free Float*.
- Comando IPC de Tauri `calculate_cpm` expuesto hacia el Frontend.
- Pruebas unitarias básicas para validar el flujo del Forward y Backward pass.

### Arreglado
- Error del compilador de Rust ("Borrow Checker") al calcular las holguras en el *Backward Pass*.

# MineSight: Clon de Primavera P6 (Tauri + Rust + React)

Este repositorio contiene la arquitectura base para un sistema EPPM (Enterprise Project Portfolio Management) de alto rendimiento, diseñado para superar las limitaciones de herramientas legacy como Primavera P6.

## Arquitectura

- **Motor Core (Backend):** Rust (Gestión de memoria, máxima velocidad para cálculos pesados como CPM).
- **Interfaz (Frontend):** React + TypeScript (Vite).
- **Contenedor:** Tauri (Aplicación nativa de bajo consumo).

## Estado Actual: Fase 1 (Motor CPM Base)
El sistema cuenta actualmente con un motor de cálculo escrito en Rust capaz de procesar una red de tareas usando teoría de grafos orientados. Calcula fechas tempranas, fechas tardías y holguras con detección de ciclos.

## Cómo empezar

**Requisitos:**
- Node.js
- Rust (`rustup` / `cargo`)
- Visual Studio C++ Build Tools (En Windows)

**Instrucciones:**
1. Navega a la carpeta principal de la app:
   ```bash
   cd p6-clone
   ```
2. Instala dependencias del frontend:
   ```bash
   npm install
   ```
3. Ejecuta la aplicación de escritorio en modo desarrollo:
   ```bash
   npm run tauri dev
   ```

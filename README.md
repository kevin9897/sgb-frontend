# SGB Frontend – Universidad de Madeira

Interfaz web del Sistema de Gestión Bibliotecaria (React + Vite, HTML, CSS).

Forma parte del proyecto principal: https://github.com/kevin9897/desarrollo_Software_II

## Estructura
```
src/
  main.jsx         punto de entrada React
  App.jsx          rutas
  api.js           llamadas HTTP al backend
  AuthContext.jsx  sesión del usuario
  index.css        estilos globales
  components/      Navbar, Table, Modal, EstadoBadge
  pages/           Login, Dashboard, Recursos, Usuarios, Prestamos, Reservas, Multas
vercel.json        despliegue en Vercel
Dockerfile         build + Nginx (uso local)
```

## Ejecutar
Lo recomendado es levantarlo desde el repositorio principal con `docker compose up --build`.

Solo el frontend:
```bash
npm install
npm run dev        # http://localhost:5173
```
La URL del API se configura con `VITE_API_URL` (ver `.env.example`).

## Despliegue
Vercel → Add New Project → importar este repositorio → framework **Vite** →
variable de entorno `VITE_API_URL=https://<tu-backend>.onrender.com/api/v1`.

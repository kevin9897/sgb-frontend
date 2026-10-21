import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

export const getHealth = () => api.get("/health").then((r) => r.data);
export const getRecursos = (coleccion) =>
  api.get("/recursos", { params: coleccion ? { coleccion } : {} }).then((r) => r.data);
export const darDeBajaRecurso = (codigo, payload) =>
  api.post(`/recursos/${codigo}/baja`, payload).then((r) => r.data);
export const getUsuarios = (rol) =>
  api.get("/usuarios", { params: rol ? { rol } : {} }).then((r) => r.data);
export const getPrestamos = () => api.get("/prestamos").then((r) => r.data);
export const getRenovaciones = () => api.get("/prestamos/renovaciones").then((r) => r.data);
export const crearPrestamo = (payload) => api.post("/prestamos", payload).then((r) => r.data);
export const renovarPrestamo = (payload) => api.post("/prestamos/renovar", payload).then((r) => r.data);
export const devolverPrestamo = (codigo) => api.post(`/prestamos/${codigo}/devolver`).then((r) => r.data);
export const getReservas = () => api.get("/reservas").then((r) => r.data);
export const crearReserva = (payload) => api.post("/reservas", payload).then((r) => r.data);
export const getMultas = () => api.get("/multas").then((r) => r.data);
export const pagarMulta = (id) => api.post(`/multas/${id}/pagar`).then((r) => r.data);

export default api;

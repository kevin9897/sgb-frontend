import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

export const getHealth = () => api.get("/health").then((r) => r.data);
export const ejecutarSeed = () => api.post("/seed").then((r) => r.data);
export const getAuditoria = () => api.get("/auditoria").then((r) => r.data);

export const getRecursos = (coleccion, q, incluir_eliminados = false) =>
  api
    .get("/recursos", {
      params: {
        ...(coleccion ? { coleccion } : {}),
        ...(q ? { q } : {}),
        ...(incluir_eliminados ? { incluir_eliminados: true } : {}),
      },
    })
    .then((r) => r.data);
export const crearRecurso = (payload) => api.post("/recursos", payload).then((r) => r.data);
export const darDeBajaRecurso = (codigo, payload) =>
  api.post(`/recursos/${codigo}/baja`, payload).then((r) => r.data);

export const getUsuarios = (rol, q, incluir_eliminados = false) =>
  api
    .get("/usuarios", {
      params: {
        ...(rol ? { rol } : {}),
        ...(q ? { q } : {}),
        ...(incluir_eliminados ? { incluir_eliminados: true } : {}),
      },
    })
    .then((r) => r.data);
export const crearUsuario = (payload) => api.post("/usuarios", payload).then((r) => r.data);
export const eliminarUsuarioLogico = (identificacion) =>
  api.delete(`/usuarios/${identificacion}`).then((r) => r.data);

export const getPrestamos = () => api.get("/prestamos").then((r) => r.data);
export const getRenovaciones = () => api.get("/prestamos/renovaciones").then((r) => r.data);
export const crearPrestamo = (payload) => api.post("/prestamos", payload).then((r) => r.data);
export const renovarPrestamo = (payload) => api.post("/prestamos/renovar", payload).then((r) => r.data);
export const devolverPrestamo = (codigo) => api.post(`/prestamos/${codigo}/devolver`).then((r) => r.data);

export const getReservas = () => api.get("/reservas").then((r) => r.data);
export const crearReserva = (payload) => api.post("/reservas", payload).then((r) => r.data);

export const getMultas = () => api.get("/multas").then((r) => r.data);
export const calcularMultaAutomatica = (payload) => api.post("/multas/calcular", payload).then((r) => r.data);
export const pagarMulta = (id, metodo_pago = "PSE_SIMULADO") =>
  api.post(`/multas/${id}/pagar`, { metodo_pago }).then((r) => r.data);

export default api;

import axios from "axios";

// En local usa el backend de Docker; en Vercel se define VITE_API_URL apuntando a Render
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

export const getHealth = () => api.get("/health").then((r) => r.data);

export default api;

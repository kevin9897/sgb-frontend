import { useEffect, useState } from "react";
import { getHealth } from "./api";

export default function App() {
  const [estado, setEstado] = useState("verificando...");
  const [ok, setOk] = useState(null);

  useEffect(() => {
    getHealth()
      .then((d) => { setEstado(`API ${d.status} · BD ${d.database}`); setOk(true); })
      .catch(() => { setEstado("No se pudo conectar con la API"); setOk(false); });
  }, []);

  return (
    <main className="container">
      <h1>Sistema de Gestión Bibliotecaria</h1>
      <p className="subtitle">Universidad de Madeira</p>
      <div className={`status ${ok === null ? "" : ok ? "ok" : "error"}`}>{estado}</div>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  crearPrestamo,
  crearReserva,
  darDeBajaRecurso,
  devolverPrestamo,
  getHealth,
  getMultas,
  getPrestamos,
  getRecursos,
  getRenovaciones,
  getReservas,
  getUsuarios,
  pagarMulta,
  renovarPrestamo,
} from "./api";

const COLECCIONES = [
  { id: "", nombre: "Todas las colecciones", plazo: "General", ren: "-" },
  { id: "GENERAL", nombre: "Colección General", plazo: "15 días", ren: "Máx. 5" },
  { id: "RESERVA", nombre: "Colección Reserva", plazo: "5 días", ren: "Sin renovación" },
  { id: "REFERENCIA", nombre: "Colección Referencia", plazo: "3 días", ren: "Máx. 2" },
  { id: "HEMEROTECA", nombre: "Hemeroteca", plazo: "1 día", ren: "Máx. 1" },
  { id: "MAPOTECA", nombre: "Mapoteca", plazo: "1 día (hasta 21:00)", ren: "Sin renovación" },
  { id: "TECNOTECA_LAPTOP", nombre: "Tecnoteca · Laptops", plazo: "7 días", ren: "Máx. 2" },
  { id: "TECNOTECA_TABLETA", nombre: "Tecnoteca · Tabletas", plazo: "7 días", ren: "Máx. 2" },
];

export default function App() {
  const [health, setHealth] = useState(null);
  const [vista, setVista] = useState("catalogo");
  const [coleccion, setColeccion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const [recursos, setRecursos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [renovaciones, setRenovaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [multas, setMultas] = useState([]);
  const [aviso, setAviso] = useState(null);

  const [form, setForm] = useState({
    identificacion_usuario: "10000001",
    codigo_recurso: "GEN-001",
    identificacion_bibliotecario: "30000001",
  });

  const sincronizar = async (col = coleccion) => {
    try {
      const [h, rec, usu, pre, ren, res, mul] = await Promise.all([
        getHealth(),
        getRecursos(col),
        getUsuarios(),
        getPrestamos(),
        getRenovaciones(),
        getReservas(),
        getMultas(),
      ]);
      setHealth(h);
      setRecursos(rec);
      setUsuarios(usu);
      setPrestamos(pre);
      setRenovaciones(ren);
      setReservas(res);
      setMultas(mul);
    } catch (err) {
      setAviso({ tipo: "error", texto: "Sin conexión con el servidor backend: " + err.message });
    }
  };

  useEffect(() => {
    sincronizar(coleccion);
  }, [coleccion]);

  const recursosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return recursos;
    const q = busqueda.toLowerCase();
    return recursos.filter(
      (r) =>
        r.codigo_recurso.toLowerCase().includes(q) ||
        r.titulo.toLowerCase().includes(q) ||
        (r.autores && r.autores.toLowerCase().includes(q)) ||
        (r.isbn_issn && r.isbn_issn.toLowerCase().includes(q))
    );
  }, [recursos, busqueda]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => (!filtroRol || u.rol === filtroRol));
  }, [usuarios, filtroRol]);

  const ejecutarPrestamo = async (e) => {
    e.preventDefault();
    setAviso(null);
    try {
      const p = await crearPrestamo(form);
      setAviso({
        tipo: "ok",
        texto: `Préstamo registrado: ${p.codigo_prestamo} · Recurso ${p.codigo_recurso} asignado a ${p.identificacion_usuario}.`,
      });
      sincronizar();
    } catch (err) {
      setAviso({ tipo: "error", texto: err.response?.data?.detail || err.message });
    }
  };

  const ejecutarReserva = async () => {
    setAviso(null);
    try {
      const r = await crearReserva(form);
      setAviso({
        tipo: "ok",
        texto: `Reserva registrada para ${r.codigo_recurso} (Posición en cola: #${r.orden_cola}).`,
      });
      sincronizar();
    } catch (err) {
      setAviso({ tipo: "error", texto: err.response?.data?.detail || err.message });
    }
  };

  const handleRenovar = async (codigo_prestamo) => {
    setAviso(null);
    try {
      await renovarPrestamo({
        codigo_prestamo,
        identificacion_bibliotecario: form.identificacion_bibliotecario,
      });
      setAviso({ tipo: "ok", texto: `Préstamo ${codigo_prestamo} renovado.` });
      sincronizar();
    } catch (err) {
      setAviso({ tipo: "error", texto: err.response?.data?.detail || err.message });
    }
  };

  const handleDevolver = async (codigo_prestamo) => {
    setAviso(null);
    try {
      await devolverPrestamo(codigo_prestamo);
      setAviso({ tipo: "ok", texto: `Devolución registrada para el préstamo ${codigo_prestamo}.` });
      sincronizar();
    } catch (err) {
      setAviso({ tipo: "error", texto: err.response?.data?.detail || err.message });
    }
  };

  const handleBaja = async (codigo_recurso) => {
    const motivo = window.prompt("Detalle el motivo de baja del recurso:", "Deterioro físico irreparable");
    if (!motivo) return;
    try {
      await darDeBajaRecurso(codigo_recurso, {
        identificacion_bibliotecario: form.identificacion_bibliotecario,
        motivo,
      });
      setAviso({ tipo: "ok", texto: `Recurso ${codigo_recurso} dado de baja.` });
      sincronizar();
    } catch (err) {
      setAviso({ tipo: "error", texto: err.response?.data?.detail || err.message });
    }
  };

  const handlePagarMulta = async (id) => {
    try {
      await pagarMulta(id);
      setAviso({ tipo: "ok", texto: `Pago asentado para la multa #${id}.` });
      sincronizar();
    } catch (err) {
      setAviso({ tipo: "error", texto: err.response?.data?.detail || err.message });
    }
  };

  const seleccionarRecursoParaOperacion = (codigo) => {
    setForm((prev) => ({ ...prev, codigo_recurso: codigo }));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">UM</div>
          <div>
            <div className="brand-title">Universidad de Madeira</div>
            <div className="brand-sub">Sistema Bibliotecario · SGB</div>
          </div>
        </div>

        <div className="nav-section">MÓDULOS OPERATIVOS</div>
        <nav className="side-nav">
          <button className={vista === "catalogo" ? "active" : ""} onClick={() => setVista("catalogo")}>
            <span>Inventario y Colecciones</span>
            <span className="count">{recursos.length}</span>
          </button>
          <button className={vista === "circulacion" ? "active" : ""} onClick={() => setVista("circulacion")}>
            <span>Circulación y Préstamos</span>
            <span className="count">{prestamos.filter((p) => p.activo).length}</span>
          </button>
          <button className={vista === "reservas" ? "active" : ""} onClick={() => setVista("reservas")}>
            <span>Cola de Reservas</span>
            <span className="count">{reservas.length}</span>
          </button>
          <button className={vista === "renovaciones" ? "active" : ""} onClick={() => setVista("renovaciones")}>
            <span>Registro de Renovaciones</span>
            <span className="count">{renovaciones.length}</span>
          </button>
          <button className={vista === "multas" ? "active" : ""} onClick={() => setVista("multas")}>
            <span>Control de Multas</span>
            <span className="count">{multas.length}</span>
          </button>
          <button className={vista === "usuarios" ? "active" : ""} onClick={() => setVista("usuarios")}>
            <span>Padrón de Usuarios</span>
            <span className="count">{usuarios.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sys-row">
            <span>Estado API REST</span>
            <span className={health ? "dot-ok" : "dot-err"}>{health ? "En línea" : "Sin conexión"}</span>
          </div>
          <div className="sys-row">
            <span>Motor PostgreSQL</span>
            <span className="mono">{health ? health.database : "pendiente"}</span>
          </div>
          <div className="sys-row">
            <span>Arquitectura</span>
            <span className="mono">N-Tier (4 capas)</span>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspace-header">
          <div>
            <h1>
              {vista === "catalogo" && "Catálogo General de Recursos Bibliográficos"}
              {vista === "circulacion" && "Gestión de Circulación y Préstamos"}
              {vista === "reservas" && "Cola de Reservas por Orden de Llegada"}
              {vista === "renovaciones" && "Bitácora de Renovaciones"}
              {vista === "multas" && "Liquidación y Control de Multas"}
              {vista === "usuarios" && "Directorio Institucional de Usuarios"}
            </h1>
            <p className="breadcrumb">
              Biblioteca Central · Mostrador de Circulación · Operador activo: Bibliotecario{" "}
              <span className="mono">{form.identificacion_bibliotecario}</span>
            </p>
          </div>

          <div className="summary-strip">
            <div>
              <span className="lbl">EJEMPLARES DISP.</span>
              <strong>{recursos.filter((r) => r.estado === "DISPONIBLE").length}</strong>
            </div>
            <div>
              <span className="lbl">PRÉSTAMOS ACTIVOS</span>
              <strong>{prestamos.filter((p) => p.activo).length}</strong>
            </div>
            <div>
              <span className="lbl">RESERVAS</span>
              <strong>{reservas.length}</strong>
            </div>
            <div>
              <span className="lbl">MULTAS PEND.</span>
              <strong>{multas.filter((m) => !m.pagada).length}</strong>
            </div>
          </div>
        </header>

        <section className="desk-bar">
          <form className="desk-form" onSubmit={ejecutarPrestamo}>
            <div className="desk-title">Mostrador rápido</div>
            <div className="field">
              <label>ID / Código Usuario</label>
              <input
                value={form.identificacion_usuario}
                onChange={(e) => setForm({ ...form, identificacion_usuario: e.target.value })}
                placeholder="Ej. 10000001 o 20260001"
              />
            </div>
            <div className="field">
              <label>Código Recurso</label>
              <input
                value={form.codigo_recurso}
                onChange={(e) => setForm({ ...form, codigo_recurso: e.target.value })}
                placeholder="Ej. GEN-001"
              />
            </div>
            <div className="field">
              <label>ID Bibliotecario</label>
              <input
                value={form.identificacion_bibliotecario}
                onChange={(e) => setForm({ ...form, identificacion_bibliotecario: e.target.value })}
                placeholder="Ej. 30000001"
              />
            </div>
            <div className="desk-actions">
              <button type="submit" className="btn-primary">Asentar Préstamo</button>
              <button type="button" className="btn-outline" onClick={ejecutarReserva}>
                Encolar Reserva
              </button>
            </div>
          </form>
        </section>

        {aviso && (
          <div className={`notice ${aviso.tipo}`}>
            <span>{aviso.texto}</span>
            <button className="notice-close" onClick={() => setAviso(null)}>×</button>
          </div>
        )}

        <main className="panel">
          {vista === "catalogo" && (
            <>
              <div className="panel-toolbar">
                <div className="filter-group">
                  <label>Colección:</label>
                  <select value={coleccion} onChange={(e) => setColeccion(e.target.value)}>
                    {COLECCIONES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.plazo})
                      </option>
                    ))}
                  </select>
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Filtrar por código, título, autor o ISBN/ISSN..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="toolbar-meta">
                  Mostrando <strong>{recursosFiltrados.length}</strong> registros desde PostgreSQL
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Colección</th>
                      <th>Título / Descripción técnica</th>
                      <th>Identificador / Formato</th>
                      <th>Dimensiones / Encuadernación</th>
                      <th>Ejemplares</th>
                      <th>Estado</th>
                      <th className="right">Operaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recursosFiltrados.map((r) => (
                      <tr key={r.id}>
                        <td className="mono">{r.codigo_recurso}</td>
                        <td className="mono-sm">{r.coleccion}</td>
                        <td>
                          <div className="row-main">{r.titulo}</div>
                          <div className="row-sub">
                            {r.autores || r.editorial || r.resumen_descripcion || (r.marca ? `${r.marca} · ${r.modelo}` : "")}
                          </div>
                        </td>
                        <td className="mono-sm">
                          {r.isbn_issn || (r.formato_mapa ? `Formato .${r.formato_mapa}` : r.numero_equipo || "—")}
                        </td>
                        <td className="row-sub">
                          {r.ancho ? `${r.ancho}×${r.alto}×${r.profundidad} ${r.unidad_dimension}` : ""}
                          {r.tipo_encuadernacion ? ` · ${r.tipo_encuadernacion}` : ""}
                          {r.cargador ? `${r.cargador} / ${r.funda}` : ""}
                          {!r.ancho && !r.cargador && "—"}
                        </td>
                        <td className="mono">
                          {r.coleccion === "MAPOTECA" ? "USB Lectura" : r.cantidad_ejemplares}
                        </td>
                        <td>
                          <span className={`status-tag ${r.estado}`}>{r.estado}</span>
                          {r.motivo_baja && <div className="row-sub">Motivo: {r.motivo_baja}</div>}
                        </td>
                        <td className="right">
                          <button
                            className="btn-xs"
                            onClick={() => seleccionarRecursoParaOperacion(r.codigo_recurso)}
                          >
                            Seleccionar
                          </button>{" "}
                          {r.estado !== "DADO_DE_BAJA" && (
                            <button className="btn-xs danger" onClick={() => handleBaja(r.codigo_recurso)}>
                              Baja
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {vista === "circulacion" && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Código Préstamo</th>
                    <th>Usuario</th>
                    <th>Recurso</th>
                    <th>Fecha y Hora Préstamo</th>
                    <th>Vencimiento</th>
                    <th>Bibliotecario</th>
                    <th>Renovaciones</th>
                    <th>Estado</th>
                    <th className="right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamos.length === 0 ? (
                    <tr><td colSpan="9" className="empty">No hay préstamos registrados aún.</td></tr>
                  ) : (
                    prestamos.map((p) => (
                      <tr key={p.id}>
                        <td className="mono">{p.codigo_prestamo}</td>
                        <td className="mono">{p.identificacion_usuario}</td>
                        <td className="mono">{p.codigo_recurso}</td>
                        <td className="mono-sm">{new Date(p.fecha_hora_prestamo).toLocaleString()}</td>
                        <td className="mono-sm">{new Date(p.fecha_devolucion).toLocaleString()}</td>
                        <td className="mono-sm">{p.identificacion_bibliotecario}</td>
                        <td className="mono">{p.renovaciones_realizadas}</td>
                        <td>
                          <span className={`status-tag ${p.activo ? "PRESTADO" : "DISPONIBLE"}`}>
                            {p.activo ? "VIGENTE" : "DEVUELTO"}
                          </span>
                        </td>
                        <td className="right">
                          {p.activo && (
                            <>
                              <button className="btn-xs" onClick={() => handleRenovar(p.codigo_prestamo)}>
                                Renovar
                              </button>{" "}
                              <button className="btn-xs primary" onClick={() => handleDevolver(p.codigo_prestamo)}>
                                Recibir devolución
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {vista === "reservas" && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Posición Cola</th>
                    <th>Código Recurso</th>
                    <th>Identificación Usuario</th>
                    <th>Fecha y Hora Reserva</th>
                    <th>Vigencia para reclamo</th>
                    <th>Bibliotecario</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.length === 0 ? (
                    <tr><td colSpan="6" className="empty">Sin reservas activas en cola (aplicable a Colección General y Tabletas).</td></tr>
                  ) : (
                    reservas.map((r) => (
                      <tr key={r.id}>
                        <td className="mono">#{r.orden_cola}</td>
                        <td className="mono">{r.codigo_recurso}</td>
                        <td className="mono">{r.identificacion_usuario}</td>
                        <td className="mono-sm">{new Date(r.fecha_hora_reserva).toLocaleString()}</td>
                        <td className="mono">{r.dias_restantes_prestamo} días</td>
                        <td className="mono-sm">{r.identificacion_bibliotecario}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {vista === "renovaciones" && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código Préstamo</th>
                    <th>Código Recurso</th>
                    <th>Usuario</th>
                    <th>Bibliotecario que renovó</th>
                    <th>Fecha Renovación</th>
                  </tr>
                </thead>
                <tbody>
                  {renovaciones.length === 0 ? (
                    <tr><td colSpan="6" className="empty">No se han efectuado renovaciones.</td></tr>
                  ) : (
                    renovaciones.map((rn) => (
                      <tr key={rn.id}>
                        <td className="mono">#{rn.id}</td>
                        <td className="mono">{rn.codigo_prestamo}</td>
                        <td className="mono">{rn.codigo_recurso}</td>
                        <td className="mono">{rn.identificacion_usuario}</td>
                        <td className="mono">{rn.identificacion_bibliotecario}</td>
                        <td className="mono-sm">{new Date(rn.fecha_renovacion).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {vista === "multas" && (
            <>
              <div className="panel-toolbar">
                <div className="toolbar-meta">
                  Tarifario oficial: <strong>1er día hábil: $1.000 COP</strong> ·{" "}
                  <strong>2º al 7º día: $2.500 COP</strong> ·{" "}
                  <strong>8º día en adelante: +$100 COP/día adicional</strong>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Código Préstamo</th>
                      <th>Recurso</th>
                      <th>Usuario sancionado</th>
                      <th>Días hábiles de atraso</th>
                      <th>Importe (COP)</th>
                      <th>Estado</th>
                      <th className="right">Recaudo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multas.length === 0 ? (
                      <tr><td colSpan="8" className="empty">No existen multas registradas.</td></tr>
                    ) : (
                      multas.map((m) => (
                        <tr key={m.id}>
                          <td className="mono">#{m.id}</td>
                          <td className="mono">{m.codigo_prestamo}</td>
                          <td className="mono">{m.codigo_recurso}</td>
                          <td className="mono">{m.identificacion_usuario}</td>
                          <td className="mono">{m.dias_multa}</td>
                          <td className="mono">${m.valor_cop.toLocaleString("es-CO")} COP</td>
                          <td>
                            <span className={`status-tag ${m.pagada ? "DISPONIBLE" : "PERDIDO"}`}>
                              {m.pagada ? "PAZ Y SALVO" : "PENDIENTE DE PAGO"}
                            </span>
                          </td>
                          <td className="right">
                            {!m.pagada && (
                              <button className="btn-xs primary" onClick={() => handlePagarMulta(m.id)}>
                                Registrar Pago
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {vista === "usuarios" && (
            <>
              <div className="panel-toolbar">
                <div className="filter-group">
                  <label>Estamento:</label>
                  <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                    <option value="">Todos ({usuarios.length})</option>
                    <option value="ESTUDIANTE">Estudiantes (50)</option>
                    <option value="PROFESOR">Profesores (10)</option>
                    <option value="BIBLIOTECARIO">Bibliotecarios (3)</option>
                  </select>
                </div>
                <div className="toolbar-meta">
                  Mostrando <strong>{usuariosFiltrados.length}</strong> usuarios registrados en la BD
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Identificación</th>
                      <th>Código Estudiantil</th>
                      <th>Apellidos y Nombres</th>
                      <th>Estamento / Rol</th>
                      <th>Correo Institucional</th>
                      <th>Programa Académico / Dependencia</th>
                      <th>Semestre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td className="mono">{u.identificacion}</td>
                        <td className="mono">{u.codigo || "—"}</td>
                        <td className="row-main">{u.apellidos}, {u.nombres}</td>
                        <td><span className="role-tag">{u.rol}</span></td>
                        <td className="mono-sm">{u.correo_institucional}</td>
                        <td>{u.plan}</td>
                        <td className="mono">{u.semestre || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const COLORES = [
  "#3B82F6",
  "#EF4444",
  "#F59E0B",
  "#22C55E",
  "#A855F7",
  "#06B6D4",
];

function Estadisticas() {
  const [datos, setDatos] = useState({
    delitos: [],
    robosPorDia: [],
    usuariosPorMes: [],
    zonas: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await fetch("http://localhost:3000/api/estadisticas");

        if (!respuesta.ok) {
          throw new Error("No se pudieron obtener las estadísticas");
        }

        const resultado = await respuesta.json();
        setDatos({
          delitos: resultado.delitos.map((item) => ({
            ...item,
            cantidad: Number(item.cantidad),
          })),

          robosPorDia: resultado.robosPorDia.map((item) => ({
            ...item,
            cantidad: Number(item.cantidad),
          })),

          usuariosPorMes: resultado.usuariosPorMes.map((item) => ({
            ...item,
            cantidad: Number(item.cantidad),
          })),

          zonas: resultado.zonas.map((item) => ({
            ...item,
            cantidad: Number(item.cantidad),
          })),
        });
      } catch (error) {
        console.error("Error en estadísticas:", error);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setCargando(false);
      }
    };

    obtenerEstadisticas();
  }, []);

  if (cargando) {
    return <p className="p-4 text-muted">Cargando estadísticas...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-400">{error}</p>;
  }

  const grafico = (titulo, contenido) => (
    <div className="rounded-lg border border-line bg-white/5 p-4">
      <h2 className="mb-4 border-b border-line pb-2 text-xs font-bold">
        {titulo}
      </h2>
      {contenido}
    </div>
  );

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-xl font-bold">Estadísticas de seguridad</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {grafico(
          "Delitos más repetidos",
          datos.delitos.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted">
              No hay datos disponibles.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={datos.delitos}
                  dataKey="cantidad"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {datos.delitos.map((item, index) => (
                    <Cell
                      key={item.nombre}
                      fill={COLORES[index % COLORES.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ),
        )}

        {grafico(
          "DElito por día de la semana",
          datos.robosPorDia.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted">
              No hay datos disponibles.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={datos.robosPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="dia" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#EF4444" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ),
        )}

        {grafico(
          "Usuarios registrados en el tiempo",
          datos.usuariosPorMes.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted">
              No hay datos disponibles.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={datos.usuariosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="periodo" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ),
        )}

        {/* DELITOS POR ZONA */}
        {grafico(
          "Zonas con más delitos",
          datos.zonas.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted">
              No hay datos disponibles.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={datos.zonas}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  stroke="#9CA3AF"
                  width={90}
                />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3B82F6" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ),
        )}
      </div>
    </section>
  );
}

export default Estadisticas;

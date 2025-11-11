const express = require('express');
const fs = require('fs');
const path = require('path');
const { leerJSON, escribirJSON } = require('./utils/fileManager');

const app = express();
app.use(express.json()); // Permite leer datos en formato JSON

const PORT = 3000;

// Rutas de archivos JSON
const rutaPacientes = path.join(__dirname, 'data', 'pacientes.json');
const rutaDoctores = path.join(__dirname, 'data', 'doctores.json');
const rutaCitas = path.join(__dirname, 'data', 'citas.json');

// Funciones para leer y escribir archivos
function leerArchivo(ruta) {
  return leerJSON(ruta);
}

function escribirArchivo(ruta, data) {
  escribirJSON(ruta, data);
}

// ------------------- PACIENTES -------------------

// Mostrar todos los pacientes
app.get("/pacientes", (req, res) => {
  res.json(leerArchivo(rutaPacientes));
});

// Buscar paciente por ID
app.get("/pacientes/:id", (req, res) => {
  const pacientes = leerArchivo(rutaPacientes);
  const paciente = pacientes.find(p => p.id === req.params.id);
  if (!paciente) return res.status(404).json({ error: "Paciente no encontrado" });
  res.json(paciente);
});

// Registrar nuevo paciente
app.post("/pacientes", (req, res) => {
  const { nombre, edad, telefono, email } = req.body;
  if (!nombre || !edad || !telefono || !email)
    return res.status(400).json({ error: "Todos los campos son obligatorios" });

  const pacientes = leerArchivo(rutaPacientes);
  if (pacientes.find(p => p.email === email))
    return res.status(400).json({ error: "El email ya está registrado" });

  const nuevo = {
    id: `P${String(pacientes.length + 1).padStart(3, "0")}`,
    nombre, edad, telefono, email,
    fechaRegistro: new Date().toISOString().split("T")[0]
  };

  pacientes.push(nuevo);
  escribirArchivo(rutaPacientes, pacientes);
  res.status(201).json({ mensaje: "Paciente agregado", paciente: nuevo });
});

// Actualizar paciente
app.put("/pacientes/:id", (req, res) => {
  const pacientes = leerArchivo(rutaPacientes);
  const i = pacientes.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Paciente no encontrado" });
  pacientes[i] = { ...pacientes[i], ...req.body };
  escribirArchivo(rutaPacientes, pacientes);
  res.json({ mensaje: "Paciente actualizado", paciente: pacientes[i] });
});

// Ver historial de citas de un paciente
app.get("/pacientes/:id/historial", (req, res) => {
  const citas = leerArchivo(rutaCitas).filter(c => c.pacienteId === req.params.id);
  if (citas.length === 0) return res.status(404).json({ error: "Sin historial" });
  res.json(citas);
});

// ------------------- DOCTORES -------------------

// Mostrar todos los doctores
app.get("/doctores", (req, res) => {
  res.json(leerArchivo(rutaDoctores));
});

// Buscar doctor por ID
app.get("/doctores/:id", (req, res) => {
  const doctores = leerArchivo(rutaDoctores);
  const doctor = doctores.find(d => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ error: "Doctor no encontrado" });
  res.json(doctor);
});

// Registrar nuevo doctor
app.post("/doctores", (req, res) => {
  const { nombre, especialidad, horarioInicio, horarioFin, diasDisponibles } = req.body;
  if (!nombre || !especialidad || !horarioInicio || !horarioFin || !diasDisponibles)
    return res.status(400).json({ error: "Todos los campos son obligatorios" });

  const doctores = leerArchivo(rutaDoctores);
  if (doctores.find(d => d.nombre === nombre && d.especialidad === especialidad))
    return res.status(400).json({ error: "Ya existe un doctor con ese nombre y especialidad" });

  const nuevo = {
    id: `D${String(doctores.length + 1).padStart(3, "0")}`,
    nombre, especialidad, horarioInicio, horarioFin, diasDisponibles
  };

  doctores.push(nuevo);
  escribirArchivo(rutaDoctores, doctores);
  res.status(201).json({ mensaje: "Doctor agregado", doctor: nuevo });
});

// Buscar doctores por especialidad
app.get("/doctores/especialidad/:especialidad", (req, res) => {
  const doctores = leerArchivo(rutaDoctores);
  const filtro = doctores.filter(d =>
    d.especialidad.toLowerCase() === req.params.especialidad.toLowerCase()
  );
  res.json(filtro);
});

// ------------------- CITAS -------------------

// Mostrar todas las citas
app.get("/citas", (req, res) => {
  const citas = leerArchivo(rutaCitas);
  const { fecha, estado } = req.query;
  let filtradas = citas;
  if (fecha) filtradas = filtradas.filter(c => c.fecha === fecha);
  if (estado) filtradas = filtradas.filter(c => c.estado === estado);
  res.json(filtradas);
});

// Buscar cita por ID
app.get("/citas/:id", (req, res) => {
  const cita = leerArchivo(rutaCitas).find(c => c.id === req.params.id);
  if (!cita) return res.status(404).json({ error: "Cita no encontrada" });
  res.json(cita);
});

// Registrar nueva cita
app.post("/citas", (req, res) => {
  const { pacienteId, doctorId, fecha, hora, motivo } = req.body;
  if (!pacienteId || !doctorId || !fecha || !hora || !motivo)
    return res.status(400).json({ error: "Datos incompletos" });

  const pacientes = leerArchivo(rutaPacientes);
  const doctores = leerArchivo(rutaDoctores);
  const citas = leerArchivo(rutaCitas);

  const paciente = pacientes.find(p => p.id === pacienteId);
  const doctor = doctores.find(d => d.id === doctorId);
  if (!paciente) return res.status(400).json({ error: "Paciente no existe" });
  if (!doctor) return res.status(400).json({ error: "Doctor no existe" });

  const diaSemana = new Date(fecha).toLocaleDateString("es-ES", { weekday: "long" });
  const diaFormateado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
  if (!doctor.diasDisponibles.includes(diaFormateado))
    return res.status(400).json({ error: "Doctor no atiende ese día" });

  const [hi, hf] = [doctor.horarioInicio, doctor.horarioFin].map(h => parseInt(h.replace(":", "")));
  const horaNum = parseInt(hora.replace(":", ""));
  if (horaNum < hi || horaNum > hf)
    return res.status(400).json({ error: "Hora fuera del horario del doctor" });

  if (citas.find(c => c.doctorId === doctorId && c.fecha === fecha && c.hora === hora))
    return res.status(400).json({ error: "El doctor ya tiene una cita en ese horario" });

  const nueva = {
    id: `C${String(citas.length + 1).padStart(3, "0")}`,
    pacienteId, doctorId, fecha, hora, motivo, estado: "programada"
  };

  citas.push(nueva);
  escribirArchivo(rutaCitas, citas);
  res.status(201).json({ mensaje: "Cita agendada", cita: nueva });
});

// Cancelar cita
app.put("/citas/:id/cancelar", (req, res) => {
  const citas = leerArchivo(rutaCitas);
  const i = citas.findIndex(c => c.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Cita no encontrada" });
  if (citas[i].estado !== "programada")
    return res.status(400).json({ error: "Solo se pueden cancelar citas programadas" });
  citas[i].estado = "cancelada";
  escribirArchivo(rutaCitas, citas);
  res.json({ mensaje: "Cita cancelada", cita: citas[i] });
});

// Ver citas de un doctor
app.get("/citas/doctor/:doctorId", (req, res) => {
  const citas = leerArchivo(rutaCitas).filter(c => c.doctorId === req.params.doctorId);
  res.json(citas);
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

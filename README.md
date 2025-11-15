# clinica-citas-api





Tecnológico Nacional de México Campus Ensenada


ingeniería en Sistemas computacionales


Desarrollo web l


Laboratorio Apis


Gabriel Alejo Cota Ruiz


Xenia Padilla Madrid


19 de octubre del 2025

Instrucciones de instalación
1.	Clonar el repositorio:
2.	git clone https://github.com/Gcota1694/clinica-citas-api
3.	cd clinica-api
4.	Instalar dependencias:
5.	npm install
6.	Ejecutar el servidor:
7.	node index.js
El servidor se ejecutará por defecto en http://localhost:3000.
8.	Probar los endpoints:
Puedes usar Postman para realizar las peticiones.

Documentación de Endpoints (con ejemplos de request/response)

1. Crear un paciente
Endpoint: POST /pacientes
Ejemplo de request:
{
  "nombre": "Carlos Ortega",
  "edad": 40,
  "telefono": "664-222-9988"
}
Ejemplo de respuesta:
{
  "mensaje": "Paciente creado correctamente",
  "paciente": {
    "id": 1,
    "nombre": "Carlos Ortega",
    "edad": 40,
    "telefono": "664-222-9988"
  }
}

Fragmento del código:
app.post('/pacientes', (req, res) => {
  const nuevo = req.body;
  pacientes.push({ id: pacientes.length + 1, ...nuevo });
  res.json({ mensaje: 'Paciente creado correctamente', paciente: nuevo });
});

2. Crear un doctor
Endpoint: POST /doctores
Ejemplo de request:
{
  "nombre": "Dra. Marisol Reyes",
  "especialidad": "Cardiología"
}
Ejemplo de respuesta:
{
  "mensaje": "Doctor creado correctamente",
  "doctor": {
    "id": 1,
    "nombre": "Dra. Marisol Reyes",
    "especialidad": "Cardiología"
  }
}
Fragmento del código:
app.post('/doctores', (req, res) => {
  const nuevo = req.body;
  doctores.push({ id: doctores.length + 1, ...nuevo });
  res.json({ mensaje: 'Doctor creado correctamente', doctor: nuevo });
});






3. Consultar todos los pacientes
Endpoint: GET /pacientes
Ejemplo de respuesta:
[
  { "id": 1, "nombre": "Carlos Ortega", "edad": 40, "telefono": "664-222-9988" },
  { "id": 2, "nombre": "María Gómez", "edad": 35, "telefono": "664-555-4433" }
]
Fragmento del código:
app.get('/pacientes', (req, res) => {
  res.json(pacientes);
});

4. Actualizar una cita
Endpoint: PUT /citas/:id
Ejemplo de request:
{
  "fecha": "2025-11-12",
  "hora": "10:30",
  "estado": "reprogramada"
}
Ejemplo de respuesta:
{
  "mensaje": "Cita actualizada correctamente",
  "cita": {
    "id": 3,
    "paciente": "Carlos Ortega",
    "doctor": "Dra. Marisol Reyes",
    "fecha": "2025-11-12",
    "hora": "10:30",
    "estado": "reprogramada"
  }
}
Fragmento del código:
app.put('/citas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const datos = req.body;
  const cita = citas.find(c => c.id === id);
  if (cita) {
    Object.assign(cita, datos);
    res.json({ mensaje: 'Cita actualizada correctamente', cita });
  } else {
    res.status(404).json({ mensaje: 'Cita no encontrada' });
  }
});





















Casos de Prueba – API Clínica de Citas

1.	Crear 3 pacientes/POST
 
 
 

2.	Crear 2 doctores/POST
 
 

3.	Agendar 5 citas exitosamente/POST
 
  
  
4.	Intentar agendar una cita en horario no disponible (debe fallar)
 

 
5.	Cancelar una cita/PUT
 
6.	Consultar historial de un paciente
 
7.	Buscar doctores por especialidad

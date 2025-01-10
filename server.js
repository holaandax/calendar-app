const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar a MongoDB Atlas
mongoose.connect('mongodb+srv://holanda:holanda1@calendario.fvbzs.mongodb.net/calendario?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => console.log('Error de conexión: ', err));

// Definir un modelo para los eventos
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true }
});

const Event = mongoose.model('Event', eventSchema);

// API para obtener eventos
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find(); // Obtener eventos desde MongoDB
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los eventos' });
  }
});

// API para agregar eventos
app.post('/api/events', async (req, res) => {
  const { title, start, end } = req.body;
  const newEvent = new Event({ title, start, end });

  try {
    await newEvent.save(); // Guardar el nuevo evento en la base de datos
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar el evento' });
  }
});

// API para eliminar eventos
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
  
    // Asegurarse de que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de evento no válido' });
    }
  
    try {
      const deletedEvent = await Event.findByIdAndDelete(id);
  
      if (!deletedEvent) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
  
      res.status(200).json({ message: 'Evento eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar el evento', error: err });
    }
  });
  

// Ruta para el archivo principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

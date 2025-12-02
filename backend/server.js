require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { runIndexer, setupWatcher } = require('./services/indexer');
const { getImages } = require('./controllers/imageController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servidor de archivos estáticos para imágenes
// IMPORTANTE: Asegurar que IMAGE_SOURCE_DIR esté configurado y sea accesible
const imageDir = process.env.IMAGE_SOURCE_DIR;
if (imageDir) {
  app.use('/images', express.static(imageDir));
} else {
  console.warn('IMAGE_SOURCE_DIR not set. Image serving disabled.');
}

// Rutas
app.get('/api/images', getImages);

app.post('/api/index', async (req, res) => {
  // Disparador manual para indexación (opcional, pero útil para pruebas)
  await runIndexer();
  res.json({ message: 'Indexing triggered' });
});

// Conexión a la Base de Datos
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    // Ejecutar indexador al inicio
    runIndexer();
    // Iniciar watcher para cambios en tiempo real
    setupWatcher();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));

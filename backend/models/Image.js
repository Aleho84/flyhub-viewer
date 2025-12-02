const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
        unique: true, // Prevenir duplicados
    },
    captureDate: {
        type: Date,
        index: true, // Índice para filtrado por fecha
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitud, latitud]
            index: '2dsphere', // Índice geoespacial
        },
    },
    metadata: {
        type: Object, // Almacenar datos EXIF crudos si es necesario
    },
}, { timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);

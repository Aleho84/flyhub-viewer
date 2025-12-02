const Image = require('../models/Image');

exports.getImages = async (req, res) => {
    try {
        const { startDate, endDate, location, page = 1, limit = 20 } = req.query;
        const query = {};

        // Filtro de Fecha
        if (startDate || endDate) {
            query.captureDate = {};
            if (startDate) query.captureDate.$gte = new Date(startDate);
            if (endDate) query.captureDate.$lte = new Date(endDate);
        }

        // Filtro de Ubicación (Búsqueda de texto simple o coordenadas si se proporcionan)
        // Para el MVP, el usuario pidió "entrada simple para ubicación".
        // Si queremos búsqueda geoespacial, necesitamos latitud/longitud.
        // Asumimos que el frontend envía lat,lng si está disponible, o lo omitimos por ahora si es solo texto sin geocodificación.
        // El requerimiento dice "input simple para ubicación (o coordenadas)".
        // Vamos a soportar lat,lng separados por coma.
        if (location) {
            const [lat, lng] = location.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                query.location = {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [lng, lat], // mongo usa [long, lat]
                        },
                        $maxDistance: 5000, // radio de 5km por defecto
                    },
                };
            }
        }

        const images = await Image.find(query)
            .sort({ captureDate: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Image.countDocuments(query);

        res.json({
            images,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

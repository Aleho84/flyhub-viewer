const fs = require('fs');
const path = require('path');
const exifParser = require('exif-parser');
const chokidar = require('chokidar');
const Image = require('../models/Image');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

async function scanDirectory(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(await scanDirectory(filePath));
        } else {
            const ext = path.extname(file).toLowerCase();
            if (IMAGE_EXTENSIONS.includes(ext)) {
                results.push(filePath);
            }
        }
    }
    return results;
}

async function processImage(filePath, sourceDir) {
    try {
        // Verificar extensión antes de procesar (redundancia útil para el watcher)
        const ext = path.extname(filePath).toLowerCase();
        if (!IMAGE_EXTENSIONS.includes(ext)) return;

        // Esperar un poco para asegurar que el archivo se ha escrito completamente
        await new Promise(resolve => setTimeout(resolve, 500));

        const buffer = fs.readFileSync(filePath);
        let tags = {};

        try {
            const parser = exifParser.create(buffer);
            const result = parser.parse();
            tags = result.tags;
        } catch (e) {
            console.warn(`Could not parse EXIF for ${filePath}: ${e.message}`);
        }

        // Extraer fecha
        let captureDate = new Date();
        if (tags.DateTimeOriginal) {
            captureDate = new Date(tags.DateTimeOriginal * 1000); // exif-parser devuelve segundos
        } else if (tags.CreateDate) {
            captureDate = new Date(tags.CreateDate * 1000);
        } else {
            // Alternativa a la hora de creación del archivo
            const stat = fs.statSync(filePath);
            captureDate = stat.birthtime;
        }

        // Extraer ubicación
        let location = null;
        if (tags.GPSLatitude && tags.GPSLongitude) {
            location = {
                type: 'Point',
                coordinates: [tags.GPSLongitude, tags.GPSLatitude], // GeoJSON es [long, lat]
            };
        }

        // Ruta relativa para servir
        const relativePath = path.relative(sourceDir, filePath);

        // Insertar o actualizar (Upsert)
        await Image.findOneAndUpdate(
            { filePath: relativePath },
            {
                filename: path.basename(filePath),
                filePath: relativePath,
                captureDate,
                location,
                metadata: tags,
            },
            { upsert: true, new: true }
        );

        console.log(`[Indexer] Processed: ${relativePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

async function cleanUpDatabase(sourceDir) {
    try {
        const images = await Image.find({});
        let deletedCount = 0;

        for (const img of images) {
            const fullPath = path.join(sourceDir, img.filePath);
            if (!fs.existsSync(fullPath)) {
                await Image.deleteOne({ _id: img._id });
                console.log(`[Cleaner] Purged missing file: ${img.filePath}`);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`[Cleaner] Purged ${deletedCount} images from database.`);
        }
    } catch (error) {
        console.error('Database cleanup failed:', error);
    }
}

async function runIndexer() {
    const sourceDir = process.env.IMAGE_SOURCE_DIR;
    if (!sourceDir) {
        console.error('IMAGE_SOURCE_DIR not set');
        return;
    }

    console.log(`Scanning ${sourceDir}...`);

    try {
        const files = await scanDirectory(sourceDir);
        console.log(`Found ${files.length} images.`);

        for (const file of files) {
            await processImage(file, sourceDir);
        }

        // Limpiar base de datos de archivos eliminados
        await cleanUpDatabase(sourceDir);

        console.log('Initial indexing complete.');
    } catch (error) {
        console.error('Indexing failed:', error);
    }
}

async function removeImage(filePath, sourceDir) {
    try {
        const relativePath = path.relative(sourceDir, filePath);
        await Image.findOneAndDelete({ filePath: relativePath });
        console.log(`[Watcher] Database entry removed for: ${relativePath}`);
    } catch (error) {
        console.error(`Error removing image ${filePath}:`, error);
    }
}

function setupWatcher() {
    const sourceDir = process.env.IMAGE_SOURCE_DIR;
    if (!sourceDir) return;

    console.log(`[Watcher] Starting watcher on ${sourceDir}`);

    // Ignorar iniciales porque runIndexer ya se encarga de ello al arranque
    const watcher = chokidar.watch(sourceDir, {
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    watcher
        .on('add', path => {
            console.log(`[Watcher] New file detected: ${path}`);
            processImage(path, sourceDir);
        })
        .on('unlink', path => {
            console.log(`[Watcher] File deleted: ${path}`);
            removeImage(path, sourceDir);
        })
        .on('error', error => console.error(`[Watcher] Error: ${error}`));
}

module.exports = { runIndexer, setupWatcher };

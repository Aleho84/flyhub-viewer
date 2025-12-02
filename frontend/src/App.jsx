import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import ImageModal from './components/ImageModal';
import MapVisualizer from './components/MapVisualizer';
import { MapIcon } from '@heroicons/react/24/outline';


function App() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    location: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans text-slate-200">
      <Sidebar filters={filters} setFilters={setFilters} />

      <main className="flex-1 flex flex-col h-full">
        {/* Encabezado oscuro estilo GitHub */}
        <header className="bg-[#24292f] text-white p-4 flex justify-between items-center z-10 shrink-0 shadow-sm border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img src="/drone.jpg" alt="FlyHub Logo" className="h-10 w-10 rounded-full object-cover border border-slate-600" />
            <h1 className="text-lg font-semibold tracking-tight">FlyHub Viewer</h1>
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 text-sm font-medium text-slate-200 transition shadow-sm"
          >
            <MapIcon className="h-5 w-5" />
            {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
          </button>
        </header>

        {/* Área de contenido principal */}
        <div className="flex-1 p-4 overflow-hidden bg-slate-900">
          <div className="h-full flex flex-col bg-slate-800 border border-slate-700 rounded-md shadow-sm overflow-hidden">
            <div className="flex-1 flex overflow-hidden relative">
              {/* Vista de mapa */}
              {showMap && (
                <div className="w-1/2 h-full border-r border-slate-700 relative">
                  <MapVisualizer filters={filters} onImageClick={setSelectedImage} />
                </div>
              )}

              {/* Vista de galería */}
              <div className={`${showMap ? 'w-1/2' : 'w-full'} h-full overflow-y-auto bg-slate-900/50`}>
                <Gallery filters={filters} onImageClick={setSelectedImage} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default App;

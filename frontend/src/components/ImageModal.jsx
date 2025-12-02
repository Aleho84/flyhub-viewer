import React from 'react';

const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
                    <h3 className="text-sm font-semibold text-slate-200 truncate pr-4">
                        {image.filename}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition p-1 rounded-md hover:bg-slate-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-4">
                    <img
                        src={`http://localhost:5000/images/${image.filePath}`}
                        alt={image.filename}
                        className="max-w-full max-h-full object-contain shadow-sm rounded-sm"
                    />
                </div>

                <div className="p-4 bg-slate-800 border-t border-slate-700 text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Fecha</p>
                            <p className="text-slate-200">{new Date(image.captureDate).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Ubicación</p>
                            <p className="text-slate-200">
                                {image.location ?
                                    `${image.location.coordinates[1].toFixed(4)}, ${image.location.coordinates[0].toFixed(4)}` :
                                    'N/A'
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Ruta</p>
                            <p className="text-slate-200 truncate" title={image.filePath}>{image.filePath}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">ID</p>
                            <p className="text-slate-200 font-mono text-xs">{image._id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;

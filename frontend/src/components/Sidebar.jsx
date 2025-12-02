import React from 'react';

const Sidebar = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-sm font-semibold text-slate-200">Filtros</h2>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Sección de Rango de Fechas */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Rango de Fechas
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleChange}
                                className="block w-full rounded-md border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-2 text-slate-200 bg-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleChange}
                                className="block w-full rounded-md border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-2 text-slate-200 bg-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección de Ubicación */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Locación
                    </h3>
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            Coordenadas
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={filters.location}
                            onChange={handleChange}
                            placeholder="lat, lng"
                            className="block w-full rounded-md border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-2 text-slate-200 bg-slate-900 placeholder-slate-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Formato: -34.60, -58.38
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800">
                <button
                    onClick={() => setFilters({ startDate: '', endDate: '', location: '' })}
                    className="w-full bg-slate-700 border border-slate-600 text-slate-200 py-1.5 px-3 rounded-md text-sm font-medium hover:bg-slate-600 transition shadow-sm"
                >
                    Borrar Filtros
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Gallery = ({ filters, onImageClick }) => {
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Reiniciar galería cuando cambian los filtros
    useEffect(() => {
        setImages([]);
        setPage(1);
        fetchImages(1, true);
    }, [filters]);

    const fetchImages = async (pageNum, reset = false) => {
        setLoading(true);
        try {
            const params = {
                page: pageNum,
                limit: 20,
                ...filters
            };

            const response = await axios.get('http://localhost:5000/api/images', { params });

            if (reset) {
                setImages(response.data.images);
            } else {
                setImages(prev => [...prev, ...response.data.images]);
            }

            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchImages(nextPage);
    };

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((img) => (
                    <div
                        key={img._id}
                        className="bg-slate-800 border border-slate-700 rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                        onClick={() => onImageClick(img)}
                    >
                        <div className="aspect-square bg-slate-900 overflow-hidden relative">
                            <img
                                src={`http://localhost:5000/images/${img.filePath}`}
                                alt={img.filename}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-3 border-t border-slate-700">
                            <h4 className="text-xs font-semibold text-slate-300 truncate mb-2" title={img.filename}>
                                {img.filename}
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {img.captureDate && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300 border border-slate-600">
                                        {new Date(img.captureDate).toLocaleDateString()}
                                    </span>
                                )}
                                {img.metadata?.Model && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-900/30 text-slate-300 border border-slate-600">
                                        {img.metadata.Model}
                                    </span>
                                )}
                                {img.location && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">
                                        GPS
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {images.length === 0 && !loading && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-400">No images found</h3>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
                </div>
            )}

            {loading && (
                <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {!loading && page < totalPages && (
                <div className="text-center mt-8">
                    <button
                        onClick={loadMore}
                        className="bg-slate-800 border border-slate-600 text-slate-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition shadow-sm"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default Gallery;

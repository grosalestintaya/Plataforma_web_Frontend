import React, { useState, useEffect } from 'react';
import ShowDashboardTitle from '@/components/ui/ShowDashboardTitle';
function Store() {
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar productos
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="store-container">
            <ShowDashboardTitle>Tienda de monedas</ShowDashboardTitle>
            <h1>Próximooo</h1>
            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <h3>{product.name}</h3>
                        <p>${product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Store;
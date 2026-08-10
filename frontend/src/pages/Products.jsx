import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const { addToCart } = useCart();
    const { user } = useAuth();

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const showAdminButtons = isAdmin;

    const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports', 'Other'];

    useEffect(() => {
        fetchProducts();
    }, [search, category, sortBy, order]);

    const fetchProducts = async () => {
        try {
            const params = { search, category, sortBy, order };
            const { data } = await api.get('/products', { params });
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);

        // Create a toast notification instead of alert
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 glass-morphism border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl shadow-lg z-50 animate-slide-up';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-lg">✅</span>
                <span class="font-semibold">${product.name} added to cart!</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 animate-fade-in gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2 gradient-text">Products</h1>
                        <p className="text-slate-600 text-xs sm:text-sm lg:text-lg">Discover amazing items in our collection</p>
                    </div>
                    <div className="flex gap-2">
                        {showAdminButtons && (
                            <Link to="/products/new" className="btn btn-primary shadow-lg hover:shadow-xl text-xs sm:text-sm lg:text-base py-2 px-3 sm:px-4 lg:px-6">
                                <span className="text-xs sm:text-sm lg:text-lg">➕</span>
                                <span className="hidden sm:inline ml-1 sm:ml-2">Add Product</span>
                                <span className="sm:hidden ml-1">Add</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="card-hover mb-4 sm:mb-6 lg:mb-8 animate-slide-up">
                    <div className="p-3 sm:p-4 lg:p-6">
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                            <div className="relative">
                                <span className="absolute left-2 sm:left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm lg:text-base">
                                    🔎
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input pl-8 sm:pl-10 lg:pl-12 appearance-none text-xs sm:text-sm lg:text-base py-2 sm:py-2 lg:py-3"
                                />
                            </div>

                            <div className="relative">
                                <span className="absolute left-2 sm:left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm lg:text-base">
                                    
                                </span>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input pl-8 sm:pl-10 lg:pl-12 appearance-none text-xs sm:text-sm lg:text-base py-2 sm:py-2 lg:py-3">
<option value="">🛍️All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'Electronics' && '📱 '}
                                            {cat === 'Clothing' && '👕 '}
                                            {cat === 'Food' && '🍔 '}
                                            {cat === 'Books' && '📚 '}
                                            {cat === 'Home' && '🏠 '}
                                            {cat === 'Sports' && '⚽ '}
                                            {cat === 'Other' && '📦 '}
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <span className="absolute left-2 sm:left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm lg:text-base">
                                    
                                </span>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input pl-8 sm:pl-10 lg:pl-12 appearance-none text-xs sm:text-sm lg:text-base py-2 sm:py-2 lg:py-3">
                                    <option value="createdAt">🗓️Sort by Date</option>
                                    <option value="name">🔠Sort by Name</option>
                                    <option value="price">💰Sort by Price</option>
                                    <option value="stock">📈Sort by Stock</option>
                                </select>
                            </div>

                            <div className="relative">
                                <span className="absolute left-2 sm:left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm lg:text-base">
                                    
                                </span>
                                <select value={order} onChange={(e) => setOrder(e.target.value)} className="input pl-8 sm:pl-10 lg:pl-12 appearance-none text-xs sm:text-sm lg:text-base py-2 sm:py-2 lg:py-3">
                                    <option value="desc">⬇️Descending</option>
                                    <option value="asc">⬆️Ascending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6 animate-fade-in">
                    {products.map((product, index) => (
                        <div
                            key={product._id}
                            className="card-hover group hover:scale-[1.02] sm:hover:scale-105 transition-all duration-500"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Product Image */}
                            <div className="relative mb-2 sm:mb-3 lg:mb-4 h-24 sm:h-32 lg:h-40 xl:h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg sm:rounded-xl overflow-hidden">
                                {product.imageUrl ? (
                                    <img
                                        src={getImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            console.error('Image failed to load:', product.imageUrl);
                                            e.target.style.display = 'none';
                                        }}
                                        onLoad={() => {
                                            console.log('Image loaded successfully:', product.imageUrl);
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl sm:text-4xl lg:text-6xl opacity-50">
                                            {product.category === 'Electronics' && '📱'}
                                            {product.category === 'Clothing' && '👕'}
                                            {product.category === 'Food' && '🍔'}
                                            {product.category === 'Books' && '📚'}
                                            {product.category === 'Home' && '🏠'}
                                            {product.category === 'Sports' && '⚽'}
                                            {product.category === 'Other' && '📦'}
                                        </span>
                                    </div>
                                )}
                                {product.stock < 10 && (
                                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                                        <span className="badge badge-warning text-[10px] sm:text-xs lg:text-sm">Low Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-2 sm:p-3 lg:p-4">
                                <div className="mb-1 sm:mb-2">
                                    <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500">{product.category}</p>
                                </div>

                                <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-3">
                                    <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-indigo-600">
                                        ₹{product.price}
                                    </span>
                                    <span className="text-[10px] sm:text-xs lg:text-sm text-slate-500">
                                        {product.stock} in stock
                                    </span>
                                </div>

                                <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 mb-2 sm:mb-3 lg:mb-4 line-clamp-1 sm:line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex flex-col gap-1 sm:gap-2">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="btn btn-primary w-full text-[10px] sm:text-xs lg:text-sm py-1.5 sm:py-2 lg:py-3"
                                        disabled={product.stock === 0}
                                    >
                                        <span className="text-xs sm:text-sm lg:text-base">🛒</span>
                                        <span className="hidden sm:inline ml-1">Add to Cart</span>
                                        <span className="sm:hidden ml-1">Cart</span>
                                    </button>
                                    {showAdminButtons && (
                                        <div className="flex gap-1 sm:gap-2">
                                            <Link
                                                to={`/products/edit/${product._id}`}
                                                className="btn btn-outline flex-1 text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-1.5 sm:py-2 lg:py-3"
                                            >
                                                <span className="text-xs sm:text-sm lg:text-base">✏️</span>
                                                <span className="hidden sm:inline ml-1">Edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="btn btn-danger text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-1.5 sm:py-2 lg:py-3"
                                            >
                                                <span className="text-xs sm:text-sm lg:text-base">🗑️</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {products.length === 0 && (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-800 rounded-full mb-6">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-300 mb-2">No products found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
                        <Link to="/products/new" className="btn btn-primary">
                            <span>➕</span>
                            Add Your First Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;

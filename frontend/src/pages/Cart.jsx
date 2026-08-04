import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ErrorMessage from '../components/ErrorMessage';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
    const { user } = useAuth();
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const handleCheckout = async (e) => {
        e.preventDefault();
        setError('');
        if (isAdmin) {
            setError('Admins can manage orders but cannot place customer orders.');
            setLoading(false);
            return;
        }
        setLoading(true);

        const orderData = {
            customerName,
            customerEmail,
            shippingAddress,
            items: cartItems.map(item => ({
                productId: item._id,
                quantity: item.quantity
            }))
        };

        try {
            await api.post('/orders', orderData);
            clearCart();
            alert('Order placed successfully!');
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2 gradient-text">Shopping Cart</h1>
                    <p className="text-slate-400 text-xs sm:text-sm lg:text-lg">Review your items and checkout</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="card text-center py-6 sm:py-8 lg:py-12 animate-fade-in">
                        <p className="text-sm sm:text-base lg:text-xl text-slate-400 mb-2 sm:mb-4">Your cart is empty</p>
                        <button onClick={() => navigate('/products')} className="btn btn-primary text-xs sm:text-sm lg:text-base py-2 sm:py-3">
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-2 sm:space-y-4 animate-fade-in">
                            {cartItems.map((item) => (
                                <div key={item._id} className="card p-3 sm:p-4 lg:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 line-clamp-1">{item.name}</h3>
                                            <p className="text-slate-400 text-[10px] sm:text-sm mb-2">{item.category}</p>
                                            <p className="text-base sm:text-lg lg:text-2xl font-bold text-green-400">₹{item.price}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-700 hover:bg-slate-600 transition-colors text-[10px] sm:text-sm"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 sm:w-12 text-center font-semibold text-xs sm:text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50 text-[10px] sm:text-sm"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm sm:text-base lg:text-xl font-bold mb-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-red-400 hover:text-red-300 text-[10px] sm:text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkout Form */}
                        <div className="animate-fade-in">
                            <div className="card sticky top-20 sm:top-24 p-3 sm:p-4 lg:p-6">
                                <h3 className="text-sm sm:text-base lg:text-xl font-semibold mb-2 sm:mb-4">Order Summary</h3>

                                <div className="border-t border-slate-700 pt-2 sm:pt-4 mb-3 sm:mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400 text-[10px] sm:text-sm">Items ({cartItems.length})</span>
                                        <span className="text-xs sm:text-sm">₹{getTotalPrice().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm sm:text-base lg:text-xl font-bold border-t border-slate-700 pt-2">
                                        <span>Total</span>
                                        <span className="text-green-400">₹{getTotalPrice().toFixed(2)}</span>
                                    </div>
                                </div>

                                <ErrorMessage message={error} />

                                <form onSubmit={handleCheckout} className="space-y-2 sm:space-y-4">
                                    {isAdmin && (
                                        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-[10px] sm:text-xs text-amber-300">
                                            Admin accounts can view and manage orders, but regular users place orders.
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-[10px] sm:text-xs lg:text-sm font-medium text-slate-300 mb-1 sm:mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="John Doe"
                                            className="input text-xs sm:text-sm lg:text-base py-2 sm:py-3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] sm:text-xs lg:text-sm font-medium text-slate-300 mb-1 sm:mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="input text-xs sm:text-sm lg:text-base py-2 sm:py-3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] sm:text-xs lg:text-sm font-medium text-slate-300 mb-1 sm:mb-2">Shipping Address</label>
                                        <textarea
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            placeholder="123 Main St, City, Country"
                                            className="input text-xs sm:text-sm lg:text-base py-2 sm:py-3 min-h-[60px] sm:min-h-[80px]"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full text-xs sm:text-sm lg:text-base py-2 sm:py-3" disabled={loading}>
                                        {loading ? 'Processing...' : 'Place Order'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;

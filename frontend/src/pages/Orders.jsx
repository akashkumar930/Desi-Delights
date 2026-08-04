import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = storedUser.role?.toLowerCase() === 'admin';

    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const { data } = await api.get('/orders', { params });
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2 gradient-text">Orders</h1>
                    <p className="text-slate-400 text-xs sm:text-sm lg:text-lg">
                        {isAdmin ? 'Manage customer orders' : 'Your orders'}
                    </p>
                </div>

                {/* Status Filter */}
                <div className="card mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input max-w-[150px] sm:max-w-xs text-xs sm:text-sm lg:text-base py-2 sm:py-3"
                    >
                        <option value="">All Statuses</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Orders List */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 animate-fade-in">
                    {orders.map((order) => (
                        <div key={order._id} className="card p-3 sm:p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 sm:mb-4 gap-2">
                                <div>
                                    <h3 className="text-sm sm:text-base lg:text-xl font-semibold mb-1">Order #{order._id.slice(-6)}</h3>
                                    <p className="text-slate-400 text-[10px] sm:text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <span className={`badge text-[8px] sm:text-xs lg:text-sm ${order.status === 'delivered' ? 'badge-success' :
                                    order.status === 'cancelled' ? 'badge-error' :
                                        order.status === 'shipped' ? 'badge-info' :
                                            'badge-warning'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
                                <div>
                                    <p className="text-slate-400 text-[10px] sm:text-sm">Customer</p>
                                    <p className="font-medium text-xs sm:text-sm lg:text-base">{order.customerName}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400">{order.customerEmail}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] sm:text-sm">Shipping Address</p>
                                    <p className="text-[10px] sm:text-xs">{order.shippingAddress}</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-700 pt-2 sm:pt-4 mb-2 sm:mb-4">
                                <h4 className="font-semibold text-xs sm:text-sm lg:text-base mb-2 sm:mb-3">Order Items</h4>
                                <div className="space-y-1 sm:space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-[10px] sm:text-sm">
                                            <span className="line-clamp-1">{item.productName} × {item.quantity}</span>
                                            <span className="text-green-400 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-700 pt-2 sm:pt-4 gap-2">
                                <div>
                                    <p className="text-slate-400 text-[10px] sm:text-sm">Total Amount</p>
                                    <p className="text-base sm:text-lg lg:text-2xl font-bold text-green-400">₹{order.totalAmount.toFixed(2)}</p>
                                </div>
                                {isAdmin && (
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                        className="input max-w-[120px] sm:max-w-[200px] text-xs sm:text-sm lg:text-base py-2 sm:py-3"
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-6 sm:py-8 lg:py-12 text-slate-400">
                        <p className="text-sm sm:text-base lg:text-xl">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;

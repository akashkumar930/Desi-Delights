import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import Activity from './pages/Activity';
import Users from './pages/Users';

// Separate inner component so we can access AuthContext for userId
const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <CartProvider userId={user?._id}>
            <Router>
                <div className="min-h-screen">
                    <Navbar />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Admin-only Routes */}
                        <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
                        <Route path="/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
                        <Route path="/products/edit/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
                        <Route path="/activity" element={<AdminRoute><Activity /></AdminRoute>} />
                        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />

                        {/* User + Admin Routes */}
                        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                        <Route path="/checkout" element={<PrivateRoute><Cart /></PrivateRoute>} />

                        {/* User-only routes */}
                        <Route path="/user-only" element={<UserRoute><Products /></UserRoute>} />

                        {/* Redirect */}
                        <Route path="*" element={<Navigate to="/products" />} />
                    </Routes>
                </div>
            </Router>
        </CartProvider>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;

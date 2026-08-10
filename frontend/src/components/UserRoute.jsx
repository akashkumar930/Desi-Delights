import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const UserRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500">
                <div className="text-center">
                    <LoadingSpinner size="large" message="Authenticating..." />
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    if (isAdmin) {
        return <Navigate to="/products" />;
    }

    return children;
};

export default UserRoute;

import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, restrictedRoles = [], redirectTo = '/dashboard' }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // If user is logged in and their role is in the restricted list, redirect them
        if (user && restrictedRoles.includes(user.role)) {
            navigate(redirectTo);
        }
    }, [user, restrictedRoles, redirectTo, navigate]);

    // If user role is restricted, don't render the component while redirecting
    if (user && restrictedRoles.includes(user.role)) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
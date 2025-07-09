import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { checkPermission } from '../lib/accessControl';
import PageNotAccessible from '../PageNotAccessible';

const ProtectedRoute = ({ isAllowed, redirectPath = '/login', children }) => 
{
    const { pathname } = useLocation();

    /* AUTHORIZATION VARIABLES */
    const role = useSelector(state => state.user.role);
    const hasAccess = checkPermission(role, pathname, "read");

    if (!isAllowed) 
    {
        return <Navigate to = {redirectPath} replace = {true} state = {{ path: pathname }} />;
    }

    if (!hasAccess && pathname !== "/") 
    {
        return <PageNotAccessible />;
    }

    return children ? children : <Outlet />;
}

export default ProtectedRoute;
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import routeControl from './routeControl';

const withAuth = (Component) => (allowedRoles) => 
{
  const WrappedWithAuth = (props) => 
  {
    const navigate = useNavigate();
    const location = useLocation();

    /* AUTHORIZATION VARIABLES */
    const isAuthenticated = useSelector(state => state.user.login);
    const role = useSelector(state => state.user.role);

    /* ROUTE VARIABLES */
    const [isValidRoute, setIsValidRoute] = useState(false);

    useEffect(() => 
    {
      const currentPath = location.pathname;

      const isPathValid = () => 
      {
        const roleRoutes = routeControl[role] || {};

        if (Object.values(roleRoutes).includes(currentPath)) 
        {
          return true;
        }

        return Object.values(roleRoutes).some(route =>
          route.includes(":") &&
          new RegExp(`^${route.replace(/:[^/]+/g, "([^/]+)")}$`).test(currentPath)
        );
      };

      if (isAuthenticated && routeControl.login[currentPath]) 
      {
        setIsValidRoute(false);

        const defaultRoute = routeControl[role]?.default;
        navigate(defaultRoute);
      } 
      else if (isAuthenticated && (!allowedRoles.includes(role) || !isPathValid())) 
      {
        setIsValidRoute(false);
      
        const defaultRoute = routeControl[role]?.default;
        navigate(defaultRoute);
      } 
      else if (!isAuthenticated && !routeControl.login[currentPath]) 
      {
        setIsValidRoute(false);

        const loginDefaultRoute = routeControl.login?.default;
        navigate(loginDefaultRoute);
      } 
      else 
      {
        setIsValidRoute(true);
      }

      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [location.pathname, isAuthenticated, role]);

    return isValidRoute ? <Component {...props} /> : null;
  };

  WrappedWithAuth.displayName = `withAuth(${Component.displayName || Component.name || "Component"})`;

  return WrappedWithAuth;
};

export default withAuth;
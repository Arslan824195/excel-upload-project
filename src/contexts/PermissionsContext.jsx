import { createContext } from 'react';
import accessControl from '../lib/accessControl';

const PermissionsContext = createContext();

const PermissionsProvider = ({ role, children }) => 
{
    const permissions = accessControl[role] || { routes: [] };

    return (
        <PermissionsContext.Provider value = {permissions}>
            {children}
        </PermissionsContext.Provider>
    );
}

export { PermissionsContext, PermissionsProvider };
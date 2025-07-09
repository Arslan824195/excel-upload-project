import { useContext } from 'react';
import { PermissionsContext } from '../contexts/PermissionsContext';

const usePermissions = () => 
{
    const context = useContext(PermissionsContext);
    return context || null;
}

export default usePermissions;
import { useMemo } from 'react';
import { rolesMap } from '../constants/roles.constant';

const RoleLabel = ({ role }) => 
{
    const roleLabel = useMemo(() => 
    {
        return rolesMap.get(role);
    }, [role]);
  
    return roleLabel;
}

export default RoleLabel;
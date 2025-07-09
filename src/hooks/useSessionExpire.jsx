import { useContext } from 'react';
import { LogoutModalContext } from '../contexts/LogoutModalContext';

const useSessionExpire = () => 
{
    const { 
        isSessionExpired = false, 
        setIsSessionExpired = () => {}, 
        setShowLogoutModal = () => {} 
    } = useContext(LogoutModalContext);

    const triggerSessionExpire = () => 
    {
        if (!isSessionExpired)
        {
            setIsSessionExpired(true);
            setShowLogoutModal(true);
        }
    }

    return triggerSessionExpire;
}

export default useSessionExpire;
import { useEffect } from 'react';
import { listenBroadcastMessage } from '../utils/broadcastChannel';

const useBroadcastListener = (setShowLogoutModal = () => {}, setIsSessionExpired = () => {}, handleExtendSession = () => {}, handleLogout = () => {}) => 
{
    useEffect(() => 
    {
        const unsubscribe = listenBroadcastMessage("logout-modal-sync", (message) =>
        {
            switch (message.type) 
            {
                case "TRIGGER_LOGOUT_MODAL":
                    setIsSessionExpired(false);
                    setShowLogoutModal(true);
                    break;
                case "EXTEND_SESSION":
                    handleExtendSession();
                    break;
                case "LOGOUT":
                    handleLogout();
                    break;
                case "HIDE_LOGOUT_MODAL":
                    setShowLogoutModal(false);
                    break;
                default:
                    break;
            }
        });

        return () => unsubscribe.unsubscribe();
    }, [setShowLogoutModal, setIsSessionExpired, handleExtendSession, handleLogout]);
}

export default useBroadcastListener;
import { createContext, useContext } from 'react';
import { IdleTimerProvider } from 'react-idle-timer';
import { LogoutModalContext } from './LogoutModalContext';
import { sendBroadcastMessage } from '../utils/broadcastChannel';
import useUser from '../hooks/useUser';
import useBroadcastListener from '../hooks/useBroadcastListener';

const SessionContext = createContext();

const SessionProvider = ({ children }) => 
{
    const user = useUser();
    const { 
        setShowLogoutModal, 
        setIsSessionExpired, 
        handleExtendSession, 
        handleLogout 
    } = useContext(LogoutModalContext);

    const onIdle = () => 
    {
        sendBroadcastMessage("logout-modal-sync", { type: "TRIGGER_LOGOUT_MODAL", countdown: 15 });
        setIsSessionExpired(false);
        setShowLogoutModal(true);
    }

    useBroadcastListener(setShowLogoutModal, setIsSessionExpired, handleExtendSession, handleLogout);

    return (
        <SessionContext.Provider value = {{}}>
            {user?.id ? (
                <IdleTimerProvider
                    timeout = {1000 * 60 * 30}
                    onIdle = {onIdle}
                    debounce = {250}
                >
                    {children}
                </IdleTimerProvider>
            ) : (
                children
            )}
        </SessionContext.Provider>
    );
}

export { SessionContext, SessionProvider };
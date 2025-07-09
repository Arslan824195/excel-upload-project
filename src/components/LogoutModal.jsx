import { useContext, useEffect, useState } from 'react';
import { LogoutModalContext } from '../contexts/LogoutModalContext';
import { listenBroadcastMessage, sendBroadcastMessage } from '../utils/broadcastChannel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const LogoutModal = () => 
{
    const { 
        isLoading, 
        showLogoutModal, 
        isSessionExpired, 
        handleLogout, 
        handleExtendSession 
    } = useContext(LogoutModalContext);

    /* MODAL VARIABLES */
    const [countdown, setCountdown] = useState(15);
    const modalMessage = isSessionExpired
        ? "Your session has timed out. To continue working, please log in again."
        : `Your session is about to expire in ${countdown} seconds. Do you want to extend your session?`;
        
    useEffect(() => 
    {
        if (showLogoutModal) 
        {
            setCountdown(15);

            const timer = setInterval(() => 
            {
                setCountdown((previousCountdown) =>
                {
                    if (previousCountdown === 1) 
                    {
                        clearInterval(timer);
                        handleLogout();
                    }
                    
                    return previousCountdown - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [showLogoutModal]);

    useEffect(() => 
    {
        const { unsubscribe } = listenBroadcastMessage("logout-modal-sync", (message) => 
        {
            if (message.type === "LOGOUT") 
            {
                handleLogout(true);
            } 
            else if (message.type === "COUNTDOWN_SYNC") 
            {
                setCountdown(message.countdown);
            }
        });

        return () => unsubscribe();
        
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    useEffect(() => 
    {
        if (showLogoutModal && countdown > 0) 
        {
            const countdownSync = setInterval(() => 
            {
                sendBroadcastMessage("logout-modal-sync", { type: "COUNTDOWN_SYNC", countdown });
            }, 1000);

            return () => clearInterval(countdownSync);
        }
    }, [showLogoutModal, countdown]);

    return (
        <Dialog open = {showLogoutModal} onClose = {handleLogout}>
            <DialogTitle>
                {isSessionExpired ? "Session Expired" : "Session Timed Out"}
            </DialogTitle>
            <DialogContent dividers>
                <span>{modalMessage}</span>
            </DialogContent>
            <DialogActions className = {`${isSessionExpired ? '' : 'gap-2'}`}>
                {isSessionExpired ? (
                    <Button 
                        color = "primary" 
                        variant = "contained" 
                        size = "small" 
                        onClick = {handleLogout}
                    >
                        Ok
                    </Button>
                ) : (
                    <>
                        <Button 
                            color = "primary" 
                            variant = "contained" 
                            size = "small" 
                            loading = {isLoading}
                            onClick = {() => 
                            {
                                handleExtendSession();
                                setCountdown(15);
                            }}
                        >
                            Extend Session
                        </Button>
                        <Button 
                            color = "primary" 
                            variant = "outlined" 
                            size = "small" 
                            loading = {isLoading}
                            onClick = {handleLogout}
                        >
                            Logout
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default LogoutModal;
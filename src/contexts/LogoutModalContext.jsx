import { createContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { listenBroadcastMessage, sendBroadcastMessage } from '../utils/broadcastChannel';
import { resetUser } from '../store/slices/user';
import { resetAbortController } from '../utils/abortController';
import useUser from '../hooks/useUser';
import Alert from '../components/Alert';
import axios from 'axios';

const LogoutModalContext = createContext();

const LogoutModalProvider = ({ children }) => 
{
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* AUTHENTICATION VARIABLES */
    const currentUser = useUser();

    /* MODAL VARIABLES */
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    let logoutInProgress = false;

    useEffect(() => 
    {
        const { unsubscribe } = listenBroadcastMessage("logout-modal-sync", (message) => 
        {
            if (message.type === "LOGOUT") 
            {
                handleLogout(true);
            }
        });
    
        return () => {
            unsubscribe();
        };

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    const finalizeLogout = () => 
    {
        setIsSessionExpired(false);
        setShowLogoutModal(false);

        dispatch(resetUser());    
        localStorage.setItem("isLoggedIn", "false");
        localStorage.setItem("isLoggedOut", "true");
        localStorage.setItem("logoutInProgress", "false");

        setTimeout(() => 
        {
            navigate("/login");
        }, 100);
    }

    const handleExtendSession = () => 
    {
        sendBroadcastMessage("logout-modal-sync", { type: "EXTEND_SESSION" });
        setShowLogoutModal(false);
    }

    const handleLogout = async () => 
    {
        if (logoutInProgress) return;
        logoutInProgress = true;

        if (localStorage.getItem("logoutInProgress") === "true" ) 
        {
            return;
        }

        localStorage.setItem("logoutInProgress", "true");
        resetAbortController();
        sendBroadcastMessage("logout-modal-sync", { type: "LOGOUT" });


        finalizeLogout(); 
        setIsLoading(true);
        setShowAlert(false);
        setAlertMessage("");
        setAlertType("");

        await axios({
            method: "post",
            url: "/api/LogoutUser",
            data: { user_id: currentUser?.id }
        })
        .then((response) => 
        {
            setIsLoading(false);
            setShowLogoutModal(false);
            const { status } = response;

            if (status === 200) 
            {
                finalizeLogout();
            } 
            else 
            {
                setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                setAlertType("error");
                setShowAlert(true);
            }
        })
        .catch((error) => 
        {
            setIsLoading(false);
            setShowLogoutModal(false);
            const status = error?.response?.status;

            if (status === 403) 
            {
                finalizeLogout();
            } 
            else 
            {
                setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                setAlertType("error");
                setShowAlert(true);
            }
        });

        logoutInProgress = false;
    }

    return (
        <LogoutModalContext.Provider
            value = {{
                isLoading,
                showLogoutModal,
                isSessionExpired,
                setIsLoading,
                setShowLogoutModal,
                setIsSessionExpired,
                handleExtendSession,
                handleLogout
            }}
        >
            <Alert
                show = {showAlert}
                message = {alertMessage}
                type = {alertType}
                setShow = {setShowAlert}
            />
            {children}
        </LogoutModalContext.Provider>
    );
}

export { LogoutModalContext, LogoutModalProvider };
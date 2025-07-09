import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roles } from '../../constants/roles.constant';
import useSessionExpire from '../../hooks/useSessionExpire';
import withAuth from '../../lib/withAuth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Logo from '../../assets/logo.svg';
import axios from 'axios';

const SetNewPassword = ({ currentUser, logOut = () => {} }) => 
{
    /* API VARIABLES */
    const [isLoading, setIsLoading] = useState(false);
    const [alertError, setAlertError] = useState(null);
    const navigate = useNavigate();

    /* SESSION EXPIRY VARIABLES */
    const triggerSessionExpire = useSessionExpire();

    /* PASSWORD VARIABLES */
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleToggleShowPassword = (passwordType) => 
    {
        if (passwordType === "Current Password")
        {
            setShowCurrentPassword(previousShowCurrentPassword => !previousShowCurrentPassword);
        }
        else if (passwordType === "New Password")
        {
            setShowNewPassword(previousShowNewPassword => !previousShowNewPassword);
        }
        else if (passwordType === "Confirm Password")
        {
            setShowConfirmPassword(previousShowConfirmPassword => !previousShowConfirmPassword);
        }
    }

    const handleChange = (event, passwordType) => 
    {
        if (passwordType === "Current Password")
        {
            setCurrentPassword(event.target.value);
        }
        else if (passwordType === "New Password")
        {
            setNewPassword(event.target.value);
        }
        else if (passwordType === "Confirm Password")
        {
            if (typeof event.target.value !== "undefined" && event.target.value !== "") 
            {
                if (newPassword !== event.target.value) 
                {
                    event.target.setCustomValidity("Passwords do not match.");
                } 
                else 
                {
                    event.target.setCustomValidity("");
                }
            
                setConfirmPassword(event.target.value);
            }
        }
    }

    const handleSubmit = async (event) => 
    {
        event.preventDefault();

        setIsLoading(true);
        setAlertError(null);

        await axios({
            method: "post",
            url: "/api/SetNewPassword",
            data: {
                currentPassword: currentPassword,
                newPassword: confirmPassword,
                userID: currentUser?.id
            }
        })
        .then((response) => 
        {
            setIsLoading(false);
            const { status, data } = response;

            if (status === 200) 
            {
                navigate("/");
            } 
            else if (status === 202)
            {
                setAlertError(data?.data);
            }
            else
            {
                setAlertError("An error occurred while processing your request. Please try again later or contact the site administrator.");
            }
        })
        .catch((error) => 
        {
            console.log("Set New Password Api: ", error);
            setIsLoading(false);

            const status = error?.response?.status;

            if (status === 403) 
            {
                triggerSessionExpire();
            } 
            else 
            {
                setAlertError(
                    status === 401
                        ? "Unauthorized access. You do not have the required permissions to perform this action."
                        : status === 429
                        ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                        : "An error occurred while processing your request. Please try again later or contact the site administrator."
                );
            
                if (status === 429) 
                {
                    setTimeout(logOut, 3000);
                }
            }
        });
    }

    return (
        <div className = "login-background">
            <Box className = "login-container">
                <div>
                    <img src = {Logo} alt = "Engro" className = "login-logo" />
                    {alertError && <Alert variant = "danger">{alertError}</Alert>}

                    <h6>Set New Password</h6>
                
                    <div className = "login-form change-password">
                        <form 
                            className = "flex flex-col gap-3"
                            onSubmit = {handleSubmit}
                        >
                            <div className = "form-group password-container">
                                <input
                                    type = {showCurrentPassword ? "text" : "password"}
                                    id = "currentPassword"
                                    name = "currentPassword"
                                    className = "form-control"
                                    placeholder = "Enter Current Password"
                                    onChange = {(event) => handleChange(event, "Current Password")}
                                    required
                                />

                                {showCurrentPassword ? (
                                    <VisibilityOffIcon
                                        className = "show-hide-password" 
                                        title = "Hide Password" 
                                        onClick = {() => handleToggleShowPassword("Current Password")} 
                                    />
                                ) : (
                                    <VisibilityIcon 
                                        className = "show-hide-password" 
                                        title = "Show Password" 
                                        onClick = {() => handleToggleShowPassword("Current Password")} 
                                    />
                                )}
                            </div>

                            <div className = "form-group password-container">
                                <input
                                    type = {showNewPassword ? "text" : "password"}
                                    id = "password"
                                    name = "password"
                                    className = "form-control"
                                    placeholder = "Enter New Password"
                                    onChange = {(event) => handleChange(event, "New Password")}
                                    required
                                />

                                {showNewPassword ? (
                                    <VisibilityOffIcon 
                                        className = "show-hide-password" 
                                        title = "Hide Password" 
                                        onClick = {() => handleToggleShowPassword("New Password")} 
                                    />
                                ) : (
                                    <VisibilityIcon 
                                        className = "show-hide-password" 
                                        title = "Show Password" 
                                        onClick = {() => handleToggleShowPassword("New Password")} 
                                    />
                                )}
                            </div>

                            <div className = "form-group password-container">
                                <input
                                    type = {showConfirmPassword ? "text" : "password"}
                                    id = "confirmPassword"
                                    name = "confirmPassword"
                                    className = "form-control"
                                    placeholder = "Enter Confirm Password"
                                    onChange = {(event) => handleChange(event, "Confirm Password")}
                                    required
                                />

                                {showConfirmPassword ? (
                                    <VisibilityOffIcon 
                                        className = "show-hide-password" 
                                        title = "Hide Password" 
                                        onClick = {() => handleToggleShowPassword("Confirm Password")} 
                                    />
                                ) : (
                                    <VisibilityIcon 
                                        className = "show-hide-password" 
                                        title = "Show Password" 
                                        onClick = {() => handleToggleShowPassword("Confirm Password")} 
                                    />
                                )}
                            </div>

                            <Button
                                type = "submit"
                                variant = "contained"
                                size = "small"
                                loading = {isLoading}
                                className = "login-button"
                            >
                                Save
                            </Button>
                        </form>
                    </div>
                </div>
            </Box>
        </div>
    );
}

const SetNewPasswordWithAuth = withAuth(SetNewPassword)([roles[1]]);
export default SetNewPasswordWithAuth;
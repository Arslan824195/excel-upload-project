import { useState } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { roles } from '../../constants/roles.constant';
import withAuth from '../../lib/withAuth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Logo from '../../assets/logo.svg';
import axios from 'axios';

const ChangePassword = ({ currentUser }) => 
{
    /* API VARIABLES */
    const [isLoading, setIsLoading] = useState(false);
    const [alertError, setAlertError] = useState(null);
    const { state } = useLocation();
    const location = useLocation();
    const navigate = useNavigate();

    /* PASSWORD VARIABLES */
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);

    const validatePassword = (password) => 
    {
        const errors = [];
    
        if (!/[A-Z]/.test(password)) 
        {
            errors.push("Password must contain at least one uppercase letter.");
        }
    
        if (!/[!"#$%&'()+,-./:;<=>?@[\]^_`{|}~]/.test(password)) 
        {
            errors.push("Password must contain at least one special character.");
        }
    
        if (!/[0-9]/.test(password)) 
        {
            errors.push("Password must contain at least one digit.");
        }
    
        if (!/[a-z]/.test(password)) 
        {
            errors.push("Password must contain at least one lowercase letter.");
        }
    
        if (password.length < 8) 
        {
            errors.push("Password must be at least 8 characters long.");
        }
    
        return {
            isValid: errors.length === 0,
            errors
        };
    }
      
    const handleToggleShowPassword = (passwordType) => 
    {
        if (passwordType === "New Password")
        {
            setShowNewPassword(previousShowNewPassword => !previousShowNewPassword);
        }
        else if (passwordType === "Confirm Password")
        {
            setShowConfirmPassword(previousShowConfirmPassword => !previousShowConfirmPassword);
        }
    }
    
    const handlePasswordChange = (event) =>
    {
        const { isValid, errors } = validatePassword(event.target.value);
        
        if (isValid)
        {
            event.target.setCustomValidity("");
        }
        else
        {
            event.target.setCustomValidity(errors.join("\n"));
        }

        setPassword(event.target.value);
    }

    const handleConfirmPasswordChange = (event) => 
    {
        if (typeof event.target.value !== "undefined" && event.target.value !== "") 
        {
            if (password !== event.target.value) 
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

    const handleSubmit = async (event) => 
    {
        event.preventDefault();
            
        setIsLoading(true);
        setAlertError(null);

        await axios({
            method: "post",
            url: "/api/ChangePassword",
            data: { 
                token: location?.pathname?.split("/")[4], 
                password: confirmPassword 
            }
        })
        .then((response) =>
        {
            setIsLoading(false);
            const { status, data } = response;

            if (status === 200)
            {
                navigate("/login", { replace: false });
            }
            else
            {
                setAlertError(data.message);
                setTimeout(() => setAlertError(null), 6000);
            }
        })
        .catch((error) =>
        {
            console.log("Change Password Api: ", error);
            setIsLoading(false);
            setAlertError(
                error?.response?.status === 429
                    ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                    : "An error occurred while processing your request. Please try again later or contact the site administrator."
            );
            setTimeout(() => setAlertError(null), 6000);
        });
    }

    return (
        <>
            {currentUser?.email ? (
                <Navigate to = {state?.path || "/"} replace = {true} />
            ) : (
                <div className = "login-background">
                    <Box className = "login-container">
                        <div>
                            <img src = {Logo} alt = "Engro" className = "login-logo" />   
                            <h6>Change Password</h6>  

                            <div className = "login-form">
                                <form 
                                    className = "flex flex-col gap-3"
                                    onSubmit = {handleSubmit}
                                >
                                    {alertError && <Alert variant = "danger">{alertError}</Alert>}

                                    <div className = "form-group password-container">
                                        <input
                                            type = {showNewPassword ? "text" : "password"}
                                            id = "newPassword"
                                            name = "newPassword"
                                            className = "form-control"
                                            placeholder = "Enter New Password"
                                            onChange = {handlePasswordChange}
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
                                            onChange = {handleConfirmPasswordChange}
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

                                    <div className = "flex align-items-center justify-content-start forgot-password">
                                        <Link to = "/login" className = "login-link">
                                            <i>Back to Login</i>
                                        </Link>
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
            )}
        </>
    );
}

const ChangePasswordWithAuth = withAuth(ChangePassword)([roles[1]]);
export default ChangePasswordWithAuth;
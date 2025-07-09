import { useEffect, useRef, useState } from 'react';
import { abortController } from '../../utils/abortController';
import { roles } from '../../constants/roles.constant';
import useUser from '../../hooks/useUser';
import useSessionExpire from '../../hooks/useSessionExpire';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RoleLabel from '../../components/RoleLabel';
import Button from '@mui/material/Button';
import Alert from '../../components/Alert';
import withAuth from '../../lib/withAuth';
import axios from 'axios';

const EditProfile = ({ logOut = () => {} }) =>  
{
    /* API VARIABLES */
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");

    /* AUTHENTICATION VARIABLES */
    const currentUser = useUser();

    /* SESSION EXPIRY VARIABLES */
    const triggerSessionExpire = useSessionExpire();

    /* FORM VARIABLES */
    const [formData, setFormData] = useState({});
    const formRef = useRef(null);

    /* PASSWORD VARIABLES */
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const confirmPasswordInputRef = useRef(null);

    useEffect(() =>
    {
        const { name = "", email, role } = currentUser || {};
        const fullName = name.split(" ");
        const userData = {
            firstName: fullName[0],
            lastName: fullName?.[1],
            email: email,
            role: role
        }

        setFormData(userData);
    }, [currentUser]);

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

    const fetchGeolocation = () => 
    {
        return new Promise((resolve) => 
        {
            if (navigator.geolocation) 
            {
                navigator.geolocation.getCurrentPosition(
                    (position) => 
                    {
                        resolve({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                    },
                    (error) => 
                    {
                        console.error("Get Geolocation Error: ", error);
                        resolve(null); 
                    }
                );
            } 
            else 
            {
                resolve(null); 
            }
        });
    }

    const handleChange = (event) => 
    {
        const { name, value } = event.target;
        const userData = { ...formData };

        if (typeof value !== "undefined") 
        {
            if (name === "firstName" || name === "lastName") 
            {
                const namePattern = /^[a-zA-Z\s'-]+$/;

                if (!namePattern.test(value)) 
                {
                    event.target.setCustomValidity("Please enter a valid name.");
                } 
                else 
                {
                    event.target.setCustomValidity("");
                }

                userData[name] = value;
            }
            else if (name === "newPassword") 
            {
                const { isValid, errors } = validatePassword(value);
        
                if (isValid)
                {
                    event.target.setCustomValidity("");
            
                    if (userData?.confirmPassword !== value) 
                    {
                        confirmPasswordInputRef?.current?.setCustomValidity("Password and confirm password values do not match!");
                    } 
                    else 
                    {
                        confirmPasswordInputRef?.current?.setCustomValidity("");
                    }
                }
                else
                {
                    event.target.setCustomValidity(errors.join("\n"));
                }
        
                userData[name] = value;
            }
            else if (name === "confirmPassword") 
            {
                if (userData?.newPassword !== value) 
                {
                    event.target.setCustomValidity("Password and confirm password values do not match!");
                } 
                else 
                {
                    event.target.setCustomValidity("");
                }

                userData[name] = value;
            } 
            else 
            {
                userData[name] = value;
            }
        }

        setFormData(userData);
    }

    const handleSubmit = async (event) => 
    {
        event.preventDefault();

        setIsLoading(true);
        setShowAlert(false);
        setAlertMessage("");
        setAlertType("");

        const geolocation = await fetchGeolocation(); 

        await axios({
            method: "post",
            url: "/api/UpdateUser",
            data: {
                user_id: currentUser?.id,
                geolocation: geolocation,
                ...formData
            },
            signal: abortController.signal
        })
        .then((response) => 
        {
            setIsLoading(false);
            const { status, data } = response;

            if (status === 200) 
            {
                formRef?.current?.reset();

                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
                setAlertMessage("Profile updated successfully. Please log out and log in again to apply the changes.");
                setAlertType("success");
                setShowAlert(true);
            } 
            else if (status === 202) 
            {
                setAlertMessage(data?.data);
                setAlertType("error");
                setShowAlert(true);
            }
        })
        .catch((error) => 
        {
            console.log("Edit User Profile Api: ", error);
            setIsLoading(false);

            if (axios.isCancel(error) || error.code === "ERR_CANCELED") 
            {
                return;
            }
            
            const status = error?.response?.status;

            if (status === 403) 
            {
                triggerSessionExpire();
            } 
            else 
            {
                setAlertMessage(
                    status === 401
                        ? "Unauthorized access. You do not have the required permissions to perform this action."
                        : status === 429
                        ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                        : "An error occurred while processing your request. Please try again later or contact the site administrator."
                );
                setAlertType("error");
                setShowAlert(true);
            
                if (status === 429) 
                {
                    setTimeout(logOut, 3000);
                }
            }
        });
    }

    return (
        <div className = "content-container flex flex-col mt-0 user">
            <Alert
                show = {showAlert}
                message = {alertMessage}
                type = {alertType}
                setShow = {setShowAlert}
            />

            <h2 className = "page-heading m-0">
                Edit Profile
            </h2>

            <form
                ref = {formRef} 
                autoComplete = "off" 
                className = "add-user-form" 
                onSubmit = {handleSubmit}
            >
                <div className = "form-group">
                    <label htmlFor = "firstName">First Name</label>

                    <input
                        type = "text"
                        className = "form-control"
                        name = "firstName"
                        placeholder = "Enter First Name"
                        value = {formData?.firstName || ""}
                        onChange = {handleChange}
                        required
                    />
                </div>

                <div className = "form-group">
                    <label htmlFor = "lastName">Last Name</label>

                    <input
                        type = "text"
                        className = "form-control"
                        name = "lastName"
                        placeholder = "Enter Last Name"
                        value = {formData?.lastName || ""}
                        onChange = {handleChange}
                        required
                    />
                </div>

                <div className = "form-group">
                    <label htmlFor = "email">Email Address</label>

                    <input
                        type = "email"
                        className = "form-control"
                        name = "email"
                        value = {formData?.email || ""}
                        disabled
                    />
                </div>

                <div className = "form-group">
                    <label htmlFor = "role">Role</label>

                    <input
                        type = "text"
                        className = "form-control"
                        name = "role"
                        value = {RoleLabel({ role: formData?.role }) || ""}
                        disabled
                    />
                </div>

                <hr />

                <div className = "form-group">
                    <label htmlFor = "currentPassword">Current Password</label>

                    <div className = "password-container">
                        <input
                            type = {showCurrentPassword ? "text" : "password"}
                            id = "currentPassword"
                            name = "currentPassword"
                            className = "form-control"
                            placeholder = "Enter Old Password"
                            onChange = {handleChange}
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
                </div>

                <div className = "form-group">
                    <label htmlFor = "newPassword">New Password</label>

                    <div className = "password-container">
                        <input
                            type = {showNewPassword ? "text" : "password"}
                            id = "newPassword"
                            name = "newPassword"
                            className = "form-control"
                            placeholder = "Enter New Password"
                            onChange = {handleChange}
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
                </div>

                <div className = "form-group">
                    <label htmlFor = "confirmPassword">Confirm Password</label>

                    <div className = "password-container">
                        <input
                            ref = {confirmPasswordInputRef}
                            type = {showConfirmPassword ? "text" : "password"}
                            id = "confirmPassword"
                            name = "confirmPassword"
                            className = "form-control"
                            placeholder = "Enter Confirm Password"
                            onChange = {handleChange}
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
                </div>

                <div className = "button-container">
                    <Button
                        className = "m-auto"
                        variant = "contained"
                        type = "submit"
                        size = "small"
                        loading = {isLoading}
                    >
                        Update User
                    </Button>
                </div>
            </form>
        </div>
    );
}

const EditProfileWithAuth = withAuth(EditProfile)([roles[1]]);
export default EditProfileWithAuth;
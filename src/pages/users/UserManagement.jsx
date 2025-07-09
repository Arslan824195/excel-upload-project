import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { roles } from '../../constants/roles.constant';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { abortController } from '../../utils/abortController';
import useUser from '../../hooks/useUser';
import withAuth from '../../lib/withAuth';
import useSessionExpire from '../../hooks/useSessionExpire';
import MaterialReactDataTable from '../../components/MaterialReactDataTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '../../components/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import axios from 'axios';
import Loader from '../../components/Loader';

const UserManagement = ({ logOut = () => {} }) => 
{
    /* API VARIABLES */
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const { pathname } = useLocation();
    const navigate = useNavigate();

    /* AUTHENTICATION VARIABLES */
    const currentUser = useUser();

    /* SESSION EXPIRY VARIABLES */
    const triggerSessionExpire = useSessionExpire();

    /* DATA VARIABLES */
    const [userData, setUserData] = useState({});
    const [selectedUser, setSelectedUser] = useState({});
    const [toggleDisplayData, setToggleDisplayData] = useState(false);
    const tableRef = useRef();

    /* DATATABLE GLOBAL FILTER VARIABLES */
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    /* FORM VARIABLES */
    const [formData, setFormData] = useState({});
    const formRef = useRef(null);
    const submitButtonRef = useRef(null);

    /* PASSWORD VARIABLES */
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const confirmPasswordInputRef = useRef(null);

    /* MODAL VARIABLES */
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            setIsLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");

            await axios({
                method: "post",
                url: "/api/GetUsers",
                data: {
                    filter_value: globalFilterValue
                },
                signal: abortController.signal
            })
            .then((response) => 
            {
                setIsLoading(false);
                const { status, data } = response;
        
                if (status === 200) 
                {
                    const userData = data?.user_data || {};
                    setUserData(userData);
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
                console.log("Get Users Api: ", error);
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

        fetchData();

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [toggleDisplayData]);

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

    const handleGlobalFilter = async (rowData) =>
    {
        setIsLoading(true);
        setShowAlert(false);
        setAlertMessage("");
        setAlertType("");
        
        await axios({
            method: "post",
            url: "/api/FilterTableData",
            data: { 
                pathname: pathname,
                table_data: rowData,
                filter_value: globalFilterValue
            },
            signal: abortController.signal
        })
        .then((response) => 
        {
            setIsLoading(false);
            const { status, data } = response;
        
            if (status === 200) 
            {
                tableRef?.current?.setFilteredData(data || []);
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
            console.log("Filter Table Data Api: ", error);
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

    const handleAddUser = () =>
    {
        navigate("/user-management/add-user");
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
        const { name, value } = event.target;
        const userData = { ...formData };

        if (typeof value !== "undefined") 
        {
            if (name === "newPassword") 
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

    const handleResetPasswordWrapper = (rowData) =>
    {
        setSelectedUser(rowData);
        setShowResetPasswordModal(true);
    }

    const handleResetPassword = async (event) =>
    {
        event.preventDefault();
        
        setIsLoading(true);
        setShowAlert(false);
        setAlertMessage("");
        setAlertType("");
        
        const { id, Email: email } = selectedUser || {};

        await axios({
            method: "post",
            url: "/api/ResetPassword",
            data: { 
                id: id,
                email: email,
                newPassword: formData?.newPassword
            },
            signal: abortController.signal
        })
        .then((response) => 
        {
            setIsLoading(false);
            const { status, data } = response;
        
            if (status === 200) 
            {
                handleCloseModal();
                setAlertMessage(data?.data);
                setAlertType("success");
                setShowAlert(true);
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
            console.log("Reset Password Api: ", error);
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

    const handleStatusChange = async (id, status) =>
    {
        setIsLoading(true);
        setShowAlert(false);
        setAlertMessage("");
        setAlertType("");
        
        await axios({
            method: "post",
            url: "/api/SetUserStatus",
            data: { 
                id,
                status: status
            },
            signal: abortController.signal
        })
        .then((response) => 
        {
            setIsLoading(false);
            const { status } = response;
        
            if (status === 200) 
            {
                setToggleDisplayData(!toggleDisplayData);
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
            console.log("Set User Status Api: ", error);
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

    const handleCloseModal = () => 
    {
        setShowResetPasswordModal(false);
    }

    return (
        <>
            <h2 className = "page-heading m-0">
                User Management
            </h2>
            <div className = "content-container">
                <Alert
                    show = {showAlert}
                    message = {alertMessage}
                    type = {alertType}
                    setShow = {setShowAlert}
                />

                <Backdrop
                        sx = {{ color: '#fff', position: "absolute", borderRadius:"inherit", zIndex: (theme)=> theme.zIndex.drawer + 1 }}
                        open = {isLoading}
                    >
                    <Loader />
                </Backdrop>

                <div className = "flex align-items-center justify-content-between" style = {{ height: "20px" }}>
                    <div className = "add-button">
                        <Button 
                            variant = "contained" 
                            size = "small" 
                            className = "btn btn-secondary"
                            onClick = {handleAddUser}
                        >
                            Add User
                        </Button>
                    </div>
                </div>

                <LocalizationProvider dateAdapter = {AdapterDayjs}>
                    <MaterialReactDataTable
                        ref = {tableRef}
                        title = "User Management"
                        isWritable = {true}
                        isLoading = {isLoading}
                        showActions = {true}
                        currentUserId = {currentUser?.id}
                        globalFilterValue = {globalFilterValue}
                        tableData = {userData}
                        setIsLoading = {setIsLoading}
                        setShowAlert = {setShowAlert}
                        setAlertMessage = {setAlertMessage}
                        setAlertType = {setAlertType}
                        setGlobalFilterValue = {setGlobalFilterValue}
                        handleGlobalFilter = {handleGlobalFilter}
                        handleResetPassword = {handleResetPasswordWrapper}
                        handleUserStatusChange = {handleStatusChange}
                    />
                </LocalizationProvider>

                <Dialog show = {showResetPasswordModal} onHide = {handleCloseModal}>
                    <DialogTitle>
                        Reset Password for {selectedUser?.Name}
                    </DialogTitle>
                    <DialogContent dividers>
                        <form 
                            ref = {formRef} 
                            autoComplete = "off" 
                            className = "user-form"
                            onSubmit = {handleResetPassword}
                        >
                            <div className = "form-group">
                                <div className = "password-container">
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
                            </div>

                            <div className = "form-group">
                                <div className = "password-container">
                                    <input
                                        ref = {confirmPasswordInputRef}
                                        type = {showConfirmPassword ? "text" : "password"}
                                        id = "confirmPassword"
                                        name = "confirmPassword"
                                        className = "form-control"
                                        placeholder = "Enter Confirm Password"
                                        onChange = {handlePasswordChange}
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

                            <button ref = {submitButtonRef} type = "submit" className = "hidden" />
                        </form>
                    </DialogContent>
                    <DialogActions className = "gap-2">
                        <Button variant = "outlined" size = "small" onClick = {handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant = "contained" size = "small" onClick = {() => submitButtonRef?.current?.click()}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

const UserManagementWithAuth = withAuth(UserManagement)([roles[1]]);
export default UserManagementWithAuth;
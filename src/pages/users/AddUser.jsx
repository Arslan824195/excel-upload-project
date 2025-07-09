import { useEffect, useRef, useState } from 'react';
import { roles } from '../../constants/roles.constant';
import { abortController } from '../../utils/abortController';
import useSessionExpire from '../../hooks/useSessionExpire';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VirtualizedAutocomplete from '../../components/Autocomplete';
import Button from '@mui/material/Button';
import Alert from '../../components/Alert';
import withAuth from '../../lib/withAuth';
import axios from 'axios';

const AddUser = ({ logOut = () => {} }) => 
{
  /* API VARIABLES */
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  /* SESSION EXPIRY VARIABLES */
  const triggerSessionExpire = useSessionExpire();

  /* FORM VARIABLES */
  const [formData, setFormData] = useState({});
  const formRef = useRef(null);

  /* ROLE VARIABLES */
  const [areRolesLoading, setAreRolesLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  /* PASSWORD VARIABLES */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const confirmPasswordInputRef = useRef(null);

  useEffect(() => 
  {
    const fetchData = async () => 
    {
      setAreRolesLoading(true);
      setShowAlert(false);
      setAlertMessage("");
      setAlertType("");

      await axios({
        method: "get",
        url: "/api/LoadUserRoles",
        signal: abortController.signal
      })
      .then((response) => 
      {
        setAreRolesLoading(false);
        const { status, data } = response;

        if (status === 200) 
        {
          const responseData = data?.data || [];
          setRoles(responseData);
        }
        else
        {
          setAlertMessage("An error occurred while retrieving the user roles. Please try again later or contact the site administrator.");
          setAlertType("error");
          setShowAlert(true);
        }
      })
      .catch((error) => 
      {
        console.log("Load Roles Api: ", error);
        setAreRolesLoading(false);

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
  }, []);

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
    if (passwordType === "Password")
    {
      setShowPassword(previousShowPassword => !previousShowPassword);
    }
    else if (passwordType === "Confirm Password")
    {
      setShowConfirmPassword(previousShowConfirmPassword => !previousShowConfirmPassword);
    }
  }

  const handleChange = (event) => 
  {
    const { name, value } = event.target;
    const userData = { ...formData };

    if (typeof value !== "undefined" && value !== "") 
    {
      if (name === "firstName" || name === "lastName") 
      {
        const namePattern = /^[a-zÀ-ÿ][-,a-z. ']+$/gim;

        if (!namePattern.test(value)) 
        {
          event.target.setCustomValidity("Please enter a valid name.");
        } 
        else 
        {
          event.target.setCustomValidity("");
          userData[name] = value;
        }
      } 
      else if (name === "email") 
      {
        const emailPattern = new RegExp(
          /^(('[\w\s-]+')|([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
        );

        if (!emailPattern.test(value)) 
        {
          event.target.setCustomValidity("Please enter a valid email address.");
        } 
        else if (!value.endsWith("@engro.com")) 
        {
          event.target.setCustomValidity("The email address must end with '@engro.com'.");
        }
        else 
        {
          event.target.setCustomValidity("");
          userData[name] = value;
        }
      } 
      else if (name === "password") 
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
        if (userData?.password !== value) 
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

  const handleSelectChange = (newValue) =>
  {
    const userData = { ...formData };

    userData["role"] = newValue;
    setFormData(userData);
  }

  const handleSubmit = async (event) => 
  {
    event.preventDefault();

    setIsLoading(true);
    setShowAlert(false);
    setAlertMessage("");
    setAlertType("");

    await axios({
      method: "post",
      url: "/api/CreateUser",
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase(),
        role: formData.role,
        password: formData.password
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

        setFormData({});
        setAlertMessage("New user created successfully.");
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
      console.log("Add User Api: ", error);
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

      <h4 className = "page-heading m-0">
        Add User
      </h4>

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
            placeholder = "Enter First Name *"
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
            placeholder = "Enter Last Name *"
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
            placeholder = "Enter Email Address *"
            onChange = {handleChange}
            required
          />
        </div>

        <div className = "form-group">
          <label htmlFor = "role">Role</label>

          <div className = "flex w-full align-items-center autocomplete position-relative">
            <VirtualizedAutocomplete
              isLoading = {areRolesLoading}
              isMultiple = {false}
              isObject = {false}
              isRequired = {true}
              isWritable = {true}
              filterOn = "Role"
              options = {roles}
              selectedOptions = {formData?.role || null}
              handleSelectChange = {(filterOn, newValue) => handleSelectChange(newValue)}
            />
          </div>
        </div>

        <div className = "form-group">
          <label htmlFor = "password">Password</label>

          <div className = "password-container">
            <input
              type = {showPassword ? "text" : "password"}
              id = "password"
              name = "password"
              className = "form-control"
              placeholder = "Enter Password *"
              onChange = {handleChange}
              required
            />

            {showPassword ? (
              <VisibilityOffIcon
                className = "show-hide-password"
                title = "Hide Password"
                onClick = {() => handleToggleShowPassword("Password")}
              />
            ) : (
              <VisibilityIcon
                className = "show-hide-password"
                title = "Show Password"
                onClick = {() => handleToggleShowPassword("Password")}
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
              placeholder = "Enter Confirm Password *"
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
            Add User
          </Button>
        </div>
      </form>
    </div>
  );
}

const AddUserWithAuth = withAuth(AddUser)([roles[1]]);
export default AddUserWithAuth;
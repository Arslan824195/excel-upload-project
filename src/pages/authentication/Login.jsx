import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { roles, rolesMap } from '../../constants/roles.constant';
import { setUser } from '../../store/slices/user';
import withAuth from '../../lib/withAuth';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';
import Logo from '../../assets/logo.svg';
import axios from 'axios';

const Login = () => 
{
  /* API VARIABLES */
  const [isLoading, setIsLoading] = useState(false);
  const [alertError, setAlertError] = useState(null)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  /* AUTHORIZATION VARIABLES */
  const [isLoggedOut, setIsLoggedOut] = useState(localStorage.getItem("isLoggedOut"));
  
  /* PASSWORD VARIABLES */
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => 
  {
    const handleNavigationTiming = () =>
    {
      const perfEntries = performance.getEntriesByType("navigation");

      if (perfEntries.length > 0) 
      {
        const navigationEntry = perfEntries[0];

        if (navigationEntry.type === "reload") 
        {
          localStorage.removeItem("isLoggedOut");
          setIsLoggedOut(false);
        }
      }
    };

    window.addEventListener("load", handleNavigationTiming);

    const timeout = setTimeout(() => 
    {
      localStorage.removeItem("isLoggedOut");
      setIsLoggedOut(false);
    }, 3000);

    return () => 
    {
      window.removeEventListener("load", handleNavigationTiming);
      clearTimeout(timeout);
    }
  }, [isLoggedOut]);

  const handleToggleShowPassword = () => 
  {
    setShowPassword(previousShowPassword => !previousShowPassword);
  }

  const handleEmailChange = (event) => 
  {
    if (typeof event.target.value !== "undefined" && event.target.value !== "") 
    {
      const emailPattern = new RegExp(
        /^(('[\w\s-]+')|([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );

      if (!emailPattern.test(event.target.value)) 
      {
        event.target.setCustomValidity("Please enter a valid email address.");
      }
      else 
      {
        event.target.setCustomValidity("");
      }
    }
  }
  
  const handleSubmit = async (event) => 
  {
    event.preventDefault();
  
    setIsLoading(true);
    setAlertError(null);
    setIsLoggedOut(false);
  
    const email = event.target.elements[0].value.toLowerCase();
    const password = event.target.elements[1].value;
  
    await axios({
      method: "post",
      url: "/api/AuthenticateUser",
      data: {
        email,
        password
      }
    })
    .then((response) => 
    {
      setIsLoading(false);
      const { status, data } = response;

      if (status === 200) 
      {
        if (data.login) 
        {
          const { id, name, role, firstLogin } = data || {};

          // Validate role securely
          if (!rolesMap.has(role))
          {
            setAlertError("Invalid Credentials!");
            setTimeout(() => setAlertError(null), 6000);
            
            return;
          }

          dispatch(setUser({ id, name, email, role, login: true }));
          navigate(firstLogin ? "/set-new-password" : "/");
        } 
        else 
        {
          setAlertError(data?.data);
          setTimeout(() => setAlertError(null), 6000);
        }
      } 
      else if (status === 202) 
      {
        setAlertError(data?.data);
        setTimeout(() => setAlertError(null), 6000);
      } 
      else 
      {
        setAlertError("An error occurred while processing your request. Please try again later or contact the site administrator.");
        setTimeout(() => setAlertError(null), 6000);
      }
    })
    .catch((error) => 
    {
      console.log("Login Api: ", error);
      setIsLoading(false);
      setAlertError(
        error?.response?.status === 429
          ? "Login attempts exceeded. Your account is temporarily disabled. Please contact the site administrator."
          : "An error occurred while processing your request. Please try again later or contact the site administrator."
      );
      setTimeout(() => setAlertError(null), 6000);
    });
  }

  return (
    <div className = "login-background">
      <Box className = "login-container">
        <div>
          <img src = {Logo} alt = "Engro" className = "login-logo" />
          <h6>Login</h6>

          <div className = "login-form">
            <form
              className = "flex flex-col gap-3"
              onSubmit = {handleSubmit}
            >
              {isLoggedOut && !alertError && (
                <Alert 
                  severity = "success"
                  className = "!py-0 !text-[13px]"
                >
                  Logged Out Successfully.
                </Alert>
              )}

              {alertError && (
                <Alert 
                  severity = "error"
                  className = "!py-0 !text-[13px]"
                >
                  {alertError}
                </Alert>
              )}
              
              <div className = "form-group">
                <input
                  type = "email"
                  id = "email"
                  name = "email"
                  autoComplete = "new-password"
                  className = "form-control"
                  placeholder = "Enter Email"
                  onChange = {handleEmailChange}
                  required
                />
              </div>

              <div className = "form-group password-container">
                <input
                  type = {showPassword ? "text" : "password"}
                  id = "password"
                  name = "password"
                  className = "form-control"
                  placeholder = "Enter Password"
                  required
                />

                {showPassword ? (
                  <VisibilityOffIcon 
                    className = "show-hide-password" 
                    title = "Hide Password" 
                    onClick = {handleToggleShowPassword} 
                  />
                ) : (
                  <VisibilityIcon 
                    className = "show-hide-password" 
                    title = "Show Password" 
                    onClick = {handleToggleShowPassword} 
                  />
                )}
              </div>

              <div className = "flex align-items-center justify-content-start forgot-password">
                <Link to = "/reset-password" className = "login-link">
                  <i>Forgot Password?</i>
                </Link>
              </div>

              <Button
                type = "submit"
                variant = "contained"
                size = "small"
                loading = {isLoading}
                className = "login-button"
              >
                Enter
              </Button>
            </form>
          </div>
        </div>
      </Box>
    </div>
  );
}

const LoginWithAuth = withAuth(Login)([roles[1]]);
export default LoginWithAuth;
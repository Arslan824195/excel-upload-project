import { useState } from 'react';
import { Link } from 'react-router-dom';
import { roles } from '../../constants/roles.constant';
import withAuth from '../../lib/withAuth';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Logo from '../../assets/logo.svg';
import axios from 'axios';

const ResetPassword = () => 
{
  /* API VARIABLES */
  const [isLoading, setIsLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [alertError, setAlertError] = useState(null)

  /* EMAIL VARIABLES */
  const [email, setEmail] = useState(null);

  const handleChange = (event) => 
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

      setEmail(event.target.value);
    }
  }

  const handleSubmit = async (event) => 
  {
    event.preventDefault();

    setIsLoading(true);
    setAlertSuccess(null);
    setAlertError(null);

    await axios({
      method: "post",
      url: "/api/ForgotPassword",
      data: { email }
    })
    .then((response) => 
    {
      setIsLoading(false);
      const { status, data } = response;

      if (status === 200 || status === 202) 
      {
        setAlertSuccess(data?.data);
        setTimeout(() => setAlertSuccess(null), 6000);
      } 
      else 
      {
        setAlertError("An error occurred while processing your request. Please try again later or contact the site administrator.");
        setTimeout(() => setAlertError(null), 6000);
      }
    })
    .catch((error) => 
    {
      console.log("Forgot Password Api: ", error);
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
    <div className = "login-background">
      <Box className = "login-container">
        <div>
          <img src = {Logo} alt = "Engro" className = "login-logo" />
          <h6>Reset Password</h6>

          <div className = "login-form reset-password">
            <form 
              className = "flex flex-col gap-3"
              onSubmit = {handleSubmit}
            >
              <div className = "sub-title">
                Enter your email to change password.
              </div>

              {alertSuccess && (
                <Alert 
                  severity = "success"
                  className = "!p-0 !text-[13px]"
                >
                  {alertSuccess}
                </Alert>
              )}

              {alertError && (
                <Alert 
                  severity = "danger"
                  className = "!p-0 !text-[13px]"
                >
                  {alertError}
                </Alert>
              )}

              <div className = "form-group">
                <input
                  type = "email"
                  id = "email"
                  name = "email"
                  className = "form-control"
                  placeholder = "Enter Email"
                  onChange = {handleChange}
                  required />
              </div>

              <div className = "flex justify-content-start">
                <Link to = "/login" className = "login-link">
                  <i>Back To Login</i>
                </Link>
              </div>

              <Button
                type = "submit"
                variant = "contained"
                size = "small"
                isLoading = {isLoading}
                className = "login-button"
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </Box>
    </div>
  );
}

const ResetPasswordWithAuth = withAuth(ResetPassword)([roles[1]]);
export default ResetPasswordWithAuth;
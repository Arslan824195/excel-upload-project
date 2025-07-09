import { Fragment, forwardRef } from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const Alert = ({ show = false, message = "", type = "", setShow }) =>
{
  const CustomAlert = forwardRef(function Alert(props, ref) 
  {
    return <MuiAlert elevation = {6} ref = {ref} variant = "filled" {...props} />;
  });

  const handleClose = () => 
  {
    setShow(false);
  }  

  return (
    <Fragment>
      {message && (
        <Snackbar 
          open = {show} 
          autoHideDuration = {6000} 
          anchorOrigin = {{ vertical: 'top', horizontal: 'center' }} 
          onClose = {handleClose}
        >
          <CustomAlert 
            severity = {type} 
            onClose = {handleClose}
            sx = {{ 
              width: '100%',
              fontSize: '14px'
            }} 
          >
            {message}
          </CustomAlert>
        </Snackbar>
      )}
    </Fragment>
  );
}

export default Alert;
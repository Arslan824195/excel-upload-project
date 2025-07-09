import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

const ErrorBoundary = ({ children }) => 
{
  /* AUTHENTICATION VARIABLES */
  const currentUser = useSelector((state) => state.user);

  /* ERROR VARIABLES */
  const [hasError, setHasError] = useState(false);
  const [lastError, setLastError] = useState({ message: "", stack: "" });
  const lastErrorTimestampRef = useRef(0);   // Reference to store the timestamp of the last error logged
  const errorLogDebounceTime = 1000;         // Time window (in ms) to ignore identical errors

  const logErrorToServer = useCallback((errorData) => 
  {
    if (currentUser?.id)
    {
      fetch("/api/LogError", 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser?.id,
          error_message: errorData.error_message || "Unknown error",
          error_stack: errorData.error_stack || "No stack trace"
        })
      })
      .then(response => response.json())
      .catch(error => console.error("Error logging failed:", error));    
    }
  }, [currentUser]);

  const handleError = useCallback((errorMessage, errorStack) => 
  {
    const currentTime = Date.now();

    // Check if the error is new or has occurred within the debounce time window
    if (
      (lastError.message !== errorMessage || lastError.stack !== errorStack) &&
      (currentTime - lastErrorTimestampRef.current > errorLogDebounceTime)
    ) 
    {
      // Update error state and timestamp
      setHasError(true);
      setLastError({ message: errorMessage, stack: errorStack });
      lastErrorTimestampRef.current = currentTime;

      // Log error to server
      logErrorToServer({
        error_message: errorMessage,
        error_stack: errorStack
      });
    }
  }, [lastError, logErrorToServer]);

  useEffect(() => 
  {
    const errorHandler = (event) => 
    {
      const error = event.error || new Error("Unknown Error");
      handleError(error.message || error.toString(), error.stack || "");
    }

    const unhandledRejectionHandler = (event) => 
    {
      const error = event.reason || new Error("Unhandled promise rejection");
      handleError(error.message || error.toString(), error.stack || "");
    }

    // Attach global error and unhandled rejection event listeners
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", unhandledRejectionHandler);

    return () => 
    {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
    };
  }, [handleError]);

  if (hasError) 
  {
    return (
      <div id = "invalid">
        <div className = "invalid">
          <div className = "invalid-code">
            <h1>400</h1>
          </div>
          <h2>Bad Request</h2>
          <p>Please refresh the page or try again later.</p>
          <a href = "/">Go to Homepage</a>
        </div>
      </div>
    );
  }

  return children;
}

export default ErrorBoundary;
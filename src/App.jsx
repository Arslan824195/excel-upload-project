import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { LogoutModalProvider } from './contexts/LogoutModalContext';
import { SessionProvider } from './contexts/SessionContext';
import LogoutModal from './components/LogoutModal';
import RouterLinks from './routes/RouterLinks';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/general.css';

const App = () =>
{
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <UserProvider>
          <LogoutModalProvider>
            <SessionProvider>
              <RouterLinks />
              <LogoutModal />
            </SessionProvider>
          </LogoutModalProvider>
        </UserProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
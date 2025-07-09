import { createContext } from 'react';
import { useSelector } from 'react-redux';

const UserContext = createContext();

const UserProvider = ({ children }) => 
{
    const currentUser = useSelector(state => state.user);

    return (
        <UserContext.Provider value = {currentUser?.email ? currentUser : null}>
            {children}
        </UserContext.Provider>
    );
}

export { UserContext, UserProvider };
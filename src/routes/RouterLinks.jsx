import { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LogoutModalContext } from '../contexts/LogoutModalContext';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { routes } from '../constants/routes.constant';
import useUser from '../hooks/useUser';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from '../navigation/SideBar';
import Login from '../pages/authentication/Login';
import SetNewPassword from '../pages/authentication/SetNewPassword';
import ResetPassword from '../pages/authentication/ResetPassword';
import ChangePassword from '../pages/authentication/ChangePassword';
import UserManagement from '../pages/users/UserManagement';
import AddUser from '../pages/users/AddUser';
import EditProfile from '../pages/profile/EditProfile';
import Dashboard from '../pages/dashboard/Dashboard';
import PageNotAccessible from '../PageNotAccessible';
import PageNotFound from '../PageNotFound';
import TrendAnalysis from '../pages/analysis/TrendAnalysis';
import StoreExecutionDashboard from '../pages/dashboard/StoreExecutionDashboard';
import QA_Validation from '../pages/qaValidation/QA_Validation';
import PhotohubTableView from '../pages/photohub/PhotohubTableView';
import Gallery from '../pages/photohub/Gallery';
import PhotoDetails from '../pages/photohub/PhotoDetails';
import NationalRodChart from '../components/NationalRodChart';
import ExtractChart from '../pages/extractcharts/ExtractChart';
import DonutChart from '../components/DonutChart';
import ExcelTablePage from '../components/ExcelTablePage';
import TablesPage from '../pages/qaValidation/Qavalidation.jsx';
import Tables from '../components/Tables';
import TwoLineChart from '../components/TwoLineChart';

const RouterLinks = () => {
    const { pathname } = useLocation();

    /* AUTHENTICATION VARIABLES */
    const currentUser = useUser();
    const { handleLogout } = useContext(LogoutModalContext);

    const isValidPath = () => {
        return Object.values(routes).some(route => route === pathname);
    }

    return (
        <PermissionsProvider role={currentUser?.role} logOut={handleLogout}>
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/set-new-password"
                    element={
                        <SetNewPassword
                            currentUser={currentUser}
                            logOut={handleLogout}
                        />
                    }
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword currentUser={currentUser} />}
                />

                <Route
                    path="/change-password/user/:id"
                    element={<ChangePassword currentUser={currentUser} />}
                />

                {/* national Rod Chart */}
                <Route
                    path="/extractChart/nationalRodChart"
                    element={
                        <Sidebar
                            currentUser={currentUser}
                            component={<ExtractChart currentUser={currentUser} />}
                            logOut={handleLogout}
                        />
                    }
                />
                {/* Doughnut Chart */}
                <Route
                    path="/extractChart/doughnutChart"
                    element={
                        <Sidebar
                            currentUser={currentUser}
                            component={<ExtractChart />}
                            logOut={handleLogout}
                        />
                    }
                />

                {/* Two Line Chart */}
                <Route
                    path="/extractChart/twolineChart"
                    element={
                        <Sidebar
                            currentUser={currentUser}
                            component={<ExtractChart />}
                            logOut={handleLogout}
                        />
                    }
                />

                {/* Target Arc Chart */}
                <Route
                    path="/extractChart/targetArcChart"
                    element={
                        <Sidebar
                            currentUser={currentUser}
                            component={<ExtractChart />}
                            logOut={handleLogout}
                        />
                    }
                />

                {/* <Route
                    path="/exceltablepage"
                    element={<ExcelTablePage currentUser={currentUser} />}
                /> */}

                {/* Table page */}
                <Route
                    path="/qavalidation/tables"
                    element={
                        <Sidebar
                            currentUser={currentUser}
                            component={<Tables />}
                            logOut={handleLogout}
                        />
                    }
                />

                {/* Table page */}
                <Route
                    path="/qavalidation/twolinechart"
                    element={
                        <Sidebar
                            currentUser={currentUser}
                            component={<TwoLineChart />}
                            logOut={handleLogout}
                        />
                    }
                />


                <Route element={<ProtectedRoute isAllowed={!!currentUser} />}>
                    <Route
                        path="/"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<Dashboard logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<Dashboard logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/photo-hub/gallery"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<Gallery />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/photo-hub/table-view"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<PhotohubTableView />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/photo-hub/photo-details"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<PhotoDetails />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/user-management"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<UserManagement logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />


                    <Route
                        path="/user-management/add-user"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<AddUser logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/trend-analysis"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<TrendAnalysis logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/store-execution-dashboard"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<StoreExecutionDashboard logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/qa-validation"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<QA_Validation logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="/account/edit-profile"
                        element={
                            <Sidebar
                                currentUser={currentUser}
                                component={<EditProfile logOut={handleLogout} />}
                                logOut={handleLogout}
                            />
                        }
                    />
                </Route>

                <Route
                    path="*"
                    element={currentUser
                        ? pathname !== "/" && isValidPath()
                            ? <PageNotAccessible />
                            : <PageNotFound />
                        : <Navigate to="/login" replace={true} />
                    }
                />
            </Routes>
        </PermissionsProvider>
    );
}

export default RouterLinks;
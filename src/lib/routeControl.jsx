import { roles } from '../constants/roles.constant';
import { routes } from '../constants/routes.constant';

const routeControl = {
    login: {
        default: routes.login,
        [routes.login]: routes.login,
        [routes.resetPassword]: routes.resetPassword,
        [routes.changePassword]: routes.changePassword
    },
    [roles[1]]: {
        default: routes.dashboard,
        [routes.photoHubGallery]: routes.photoHubGallery,
        [routes.photoHubTableView]: routes.photoHubTableView,
        [routes.photoDetails]: routes.photoDetails,
        [routes.setNewPassword]: routes.setNewPassword,
        [routes.userManagement]: routes.userManagement,
        [routes.trendAnalysis]: routes.trendAnalysis,
        [routes.storeExecutionDashboard]: routes.storeExecutionDashboard,
        [routes.qaValidation]: routes.qaValidation,
        [routes.addUser]: routes.addUser,
        [routes.editProfile]: routes.editProfile,
        [routes.pageNotFound]: routes.pageNotFound
    }
};

export default routeControl;

export const getDefaultPage = (role) => 
{
    const roleAccess = routeControl[role];
    return roleAccess?.default || null;
};
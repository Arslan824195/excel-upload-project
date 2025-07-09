import { roles } from '../constants/roles.constant';
import { routes } from '../constants/routes.constant';

const accessControl = {
    [roles[1]]: {
        routes: {
            [routes.setNewPassword]: ["read", "write"],
            [routes.dashboard]: ["read", "write"],
            [routes.photoHubGallery]: ["read", "write"],
            [routes.photoHubTableView]: ["read", "write"],
            [routes.photoDetails]: ["read", "write"],
            [routes.userManagement]: ["read", "write"],
            [routes.trendAnalysis]: ["read", "write"],
            [routes.storeExecutionDashboard]: ["read", "write"],
            [routes.qaValidation]: ["read", "write"],
            [routes.addUser]: ["read", "write"],
            [routes.editProfile]: ["read", "write"]
        },
        features: {
            documents: [],
            approvableDocuments: {
                PFI: [],
                SI: [],
                CI: [],
                SA: [],
                PL: [],
                BE: [],
                COO: []
            },
            businessUnits: []
        }
    }
};

export default accessControl;

export const checkPermission = (role, route, action) => 
{
    const roleAccess = accessControl[role];

    // Return false if role is not defined
    if (!roleAccess) 
    {
        return false;
    }

    // Handle dynamic "/reports/report-documents/:trancheId/:fileType"
    if (route.startsWith("/reports/report-documents")) 
    {
        const pattern = routes.reportDocuments.replace(/:[^/]+/g, "([^/]+)"); // Convert :param to regex
        const regex = new RegExp(`^${pattern}$`);

        if (regex.test(route)) 
        {
            return roleAccess.routes[routes.reportDocuments]?.includes(action) || false;
        }
    }
    
    // Return false if route is not defined for the role
    if (!roleAccess.routes[route])
    {
        return false;
    }

    // Return false if action is not allowed on the route
    if (!roleAccess.routes[route].includes(action)) 
    {
        return false;
    }

    return true;
};

const getRoutePermissions = (roleAccess, route) => 
{
    const permissions = roleAccess.routes?.[route] || [];

    return {
        isReadable: permissions.includes("read"),
        isWritable: permissions.includes("write")
    };
};

const getFeaturePermissions = (roleAccess, feature) => 
{
    if (feature === "approvableDocuments") 
    {
        const approvableDocuments = roleAccess.features?.approvableDocuments || {};
    
        return Object.entries(approvableDocuments).reduce((accumulator, [document, permissions]) => 
        {
            accumulator[document] = {
                isReadable: permissions.includes("read"),
                isWritable: permissions.includes("write")
            };

            return accumulator;
        }, {});
    } 
    else if (feature === "businessUnits") 
    {
        return roleAccess.features?.businessUnits || [];
    } 
    else if (feature === "documents") 
    {
        const documents = roleAccess.features?.documents || [];
    
        return {
            isReadable: documents.includes("read"),
            isWritable: documents.includes("write")
        };
    }

    return null;
};

export const getPermissions = (role, route = null, feature = null) => 
{
    const roleAccess = accessControl[role];

    // Return default permissions (none) if the role is undefined
    if (!roleAccess) 
    {
        return { isReadable: false, isWritable: false };
    }

    if (route) 
    {
        // Get permissions for the route
        return getRoutePermissions(roleAccess, route);
    } 
    else if (feature) 
    {
        // Get permissions for the feature
        return getFeaturePermissions(roleAccess, feature);
    }

    // Default return if neither route nor feature is provided
    return { isReadable: false, isWritable: false };
};
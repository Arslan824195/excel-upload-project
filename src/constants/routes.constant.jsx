import { ROLE_SECRET_KEY_1 } from '../config/env';

export const routes = {
  login: "/login",
  dashboard: "/",
  photoHubGallery: "/photo-hub/gallery",
  photoHubTableView: "/photo-hub/table-view",
  photoDetails: "/photo-hub/photo-details",
  setNewPassword: "/set-new-password",
  resetPassword: "/reset-password",
  changePassword: "/change-password/user/:id",
  userManagement: "/user-management",
  trendAnalysis: "/trend-analysis",
  storeExecutionDashboard: "/store-execution-dashboard",
  qaValidation: "/qa-validation",
  addUser: "/user-management/add-user",
  editProfile: "/account/edit-profile",
  pageNotFound: "*",
  nationalRod: "/nationalRod",
  extractChart: "/extractChart/nationalRodChart",
  doughnutChart: "/extractChart/doughnutChart",
  excelTablePage: "/exceltablepage",
  qavalidation: "/qavalidation/tables",
  twolineChart: "/qavalidation/twolinechart",
};

export const allowedRoutesByRole = {
  [ROLE_SECRET_KEY_1]: [
    routes.dashboard,
    routes.photoHubGallery,
    routes.photoHubTableView,
    routes.photoDetails,
    routes.userManagement,
    routes.trendAnalysis,
    routes.storeExecutionDashboard,
    routes.qaValidation,
    routes.addUser,
    routes.editProfile,
    routes.nationalRod,
    routes.extractChart,
    routes.doughnutChart,
    routes.twolineChart,
    routes.excelTablePage,
    routes.qavalidation,
  ]
};

export const getRoutesByRole = (role) => allowedRoutesByRole[role] ?? [];
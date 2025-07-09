import { useState, useEffect, useMemo, useContext } from 'react';
import { Sidebar } from 'react-pro-sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { allowedRoutesByRole } from '../constants/routes.constant';
import MenuList from '../components/MenuList';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import IconButton from '@mui/material/IconButton';
import Logo from '../assets/logo.svg';
import { LogoutModalContext } from '../contexts/LogoutModalContext';

const SideBar = ({ currentUser, component }) => {

  const { handleLogout } = useContext(LogoutModalContext);
  const [matches, setMatches] = useState(window.matchMedia("(max-width: 992px)").matches);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  /* AUTHORIZATION VARIABLES */
  const getAllowedRoutes = (role) => allowedRoutesByRole[role] || allowedRoutesByRole.default;
  const allowedRoutes = useMemo(() => getAllowedRoutes(currentUser?.role), [currentUser?.role]);

  /* MOBILE VIEW VARIABLES */
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(pathname);

  /* MENU VARIABLES */
  const menuConfig = useMemo(() => {
    return [
      {
        key: "dashboard",
        label: "Dashboard",
        path: "/",
        icon: <DashboardIcon sx={{ fontSize: collapsed ? '20px' : '17px' }} />
      },
      {
        key: "photohub",
        label: "Photo Hub",
        icon: <AccountCircleIcon sx={{ fontSize: collapsed ? '20px' : '17px' }} />,
        subMenu: [
          { path: "/photo-hub/gallery", label: "Photo Gallery" },
          { path: "/photo-hub/table-view", label: "Photo Table" },
          { path: "/photo-hub/table-view/:id", label: "Photo Table" }
        ]
      },

      {
        key: "extractChart",
        label: "Extract Chart",
        icon: <AccountCircleIcon sx={{ fontSize: collapsed ? '20px' : '17px' }} />,
        subMenu: [
          { path: "/extractChart/nationalRodChart", label: "National Rod Chart", },
          { path: "/extractChart/doughnutChart", label: "Doughnut Chart" },
          { path: "/extractChart/twolineChart", label: "Two Line Chart" },
          { path: "/extractChart/targetArcChart", label: "Target Arc Chart" },
        ]
      },
      // {
      //   key: "excelTablePage",
      //   label: "ExcelTablePage",
      //   path: "/exceltablepage",
      // },
      {
        key: "qavalidation",
        label: "QA Validation",
        icon: <AccountCircleIcon sx={{ fontSize: collapsed ? '20px' : '17px' }} />,
        subMenu: [
          { path: "/qavalidation/tables", label: "Tables" },
          { path: "/qavalidation/twolinechart", label: "BarChart" },
        ]
      },
      // {
      //   key: "trend-analysis",
      //   label: "Trend Analysis",
      //   path: "/trend-analysis",
      //   icon: <TrendingUpIcon sx = {{ fontSize: collapsed ? '20px' : '17px' }} />
      // }, 
      // {
      //   key: "store-execution-dashboard",
      //   label: "Store Execution Dashboard",
      //   path: "/store-execution-dashboard",
      //   icon: <StorefrontIcon sx = {{ fontSize: collapsed ? '20px' : '17px' }} />
      // },
      // {
      //   key: "qa-validation",
      //   label: "QA Validation",
      //   path: "/qa-validation",
      //   icon: <TrendingUpIcon sx = {{ fontSize: collapsed ? '20px' : '17px' }} />
      // }, 
      // {
      //   key: "user-management",
      //   label: "User Management",
      //   path: "/user-management",
      //   icon: <ManageAccountsIcon sx = {{ fontSize: collapsed ? '20px' : '17px' }} />
      // },
      {
        key: "account",
        label: "My Profile",
        icon: <AccountCircleIcon sx={{ fontSize: collapsed ? '20px' : '17px' }} />,
        subMenu: [{ path: "/account/edit-profile", label: "Edit Profile" }]
      }
    ];
  }, [collapsed]);

  /* SUB-MENU VARIABLES */
  const initialSubMenuState = {
    account: pathname.includes("account"),
    photohub: pathname.includes("photohub"),
    extractChart: pathname.includes("extractChart"),
    qavalidation: pathname.includes("qavalidation")
  };
  const [subMenuState, setSubMenuState] = useState(initialSubMenuState);

  useEffect(() => {
    window
      .matchMedia("(max-width: 992px)")
      .addEventListener("change", (e) => setMatches(e.matches));
  }, []);

  useEffect(() => {
    setCollapsed(pathname === "/");
  }, [pathname]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSubMenuState((previousSubMenuState) => ({
        account: previousSubMenuState.account && selectedMenuItem.includes("account"),
        photohub: previousSubMenuState.photohub && selectedMenuItem.includes("photohub"),
        extractChart: previousSubMenuState.extractChart && selectedMenuItem.includes("extractChart"),
        qavalidation: previousSubMenuState.qavalidation && selectedMenuItem.includes("qavalidation"),
      }));
    }, 10000);

    return () => clearTimeout(timeout);
  }, [selectedMenuItem, subMenuState]);

  const handleMenuClick = (menuItem, state = {}, isNotSubMenu = false) => {
    setSelectedMenuItem(menuItem);
    navigate(menuItem, { state });

    if (isNotSubMenu) {
      setSubMenuState({
        account: false,
        photohub: false,
        extractChart: false
      });
    }
  }

  const handleSubMenuClick = (menu) => {
    setSubMenuState((previousSubMenuState) => ({
      account: menu === "account" ? !previousSubMenuState.account : false,
      photohub: menu === "photohub" ? !previousSubMenuState.photohub : false,
      extractChart: menu === "extractChart" ? !previousSubMenuState.extractChart : false,
      qavalidation: menu === "qavalidation" ? !previousSubMenuState.qavalidation : false
    }));
  }

  const logoutTrigger = () => {
    handleLogout();
  }

  return (
    <div className="flex w-screen">
      <Sidebar collapsed={matches || collapsed}>
        <div className={`flex w-full gap-2 justify-between items-center px-3 mt-2 ${(matches || collapsed) && "flex-col-reverse"}`}>
          <div className="logo-section">
            <img
              src={Logo}
              alt="Unilever"
              className="logo"
              onClick={() => navigate("/")}
            />
          </div>

          {!matches && (
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              {(collapsed) ? (
                <MenuIcon className="header-icon" />
              ) : (
                <MenuOpenIcon className="header-icon" />
              )}
            </IconButton>
          )}
        </div>

        <div className="menu-list-container">
          <MenuList
            currentUser={currentUser}
            collapsed={matches || collapsed}
            menuConfig={menuConfig}
            allowedRoutes={allowedRoutes}
            pathname={pathname}
            subMenuState={subMenuState}
            handleMenuClick={handleMenuClick}
            handleSubMenuClick={handleSubMenuClick}
            handleLogout={logoutTrigger}
          />
        </div>
      </Sidebar>

      <div className={`content-section ${collapsed ? "collapsed" : ""}`}>
        <div className="content_inner">
          {component ? component : ""}
        </div>
      </div>
    </div>
  );
}

export default SideBar;
import { useLocation } from 'react-router-dom';
import { Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import RoleLabel from '../components/RoleLabel';
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

const MenuList = ({ currentUser = null, collapsed = false, menuConfig = [], allowedRoutes = [], pathname = null, subMenuState = {}, handleMenuClick = () => {}, handleSubMenuClick = () => {}, handleLogout = () => {} }) => 
{
    const { state } = useLocation();

    const filterSubMenu = (subMenu) => 
        subMenu?.reduce((filteredSubMenu, item) => 
        {
            if (item.subMenu) 
            {
                const nestedFilteredSubMenu = filterSubMenu(item.subMenu);

                if (nestedFilteredSubMenu.length > 0 || allowedRoutes.includes(item.path)) 
                {
                    filteredSubMenu.push({ ...item, subMenu: nestedFilteredSubMenu });
                }
            } 
            else if (allowedRoutes.includes(item.path)) 
            {
                filteredSubMenu.push(item);
            }

            return filteredSubMenu;
    }, []) || [];
    
    return (
        <Menu className = "mt-3">
            <div className = "menu-list">
                {menuConfig.map((menu) => 
                {
                    const isSubMenuOpen = subMenuState[menu.key] ||
                        (menu.key === "account" && pathname.includes("account"));
                    const filteredSubMenu = filterSubMenu(menu.subMenu);

                    return (
                        <div key = {menu.key}>
                            {menu.key === "account" && (
                                <Divider 
                                    sx = {{ 
                                        borderColor: 'white',
                                        borderBottomWidth: 'thick',
                                        marginTop: '0.5em'
                                    }}
                                />
                            )}

                            {filteredSubMenu.length > 0 && menu.subMenu ? (
                                <SubMenu
                                    key = {menu.key}
                                    icon = {menu.icon}
                                    label = {menu.label}
                                    open = {isSubMenuOpen}
                                    onOpenChange = {() => handleSubMenuClick(menu.key)}
                                >
                                    {filteredSubMenu.map((item) =>
                                    {
                                        const isNestedSubMenuOpen = subMenuState[item.key];

                                        return (
                                            item.subMenu ? (
                                                <SubMenu
                                                    key = {item.key}
                                                    label = {item.label}
                                                    open = {isNestedSubMenuOpen}
                                                    onOpenChange = {() => handleSubMenuClick(item.key)}
                                                >
                                                    {item.subMenu.map((nestedItem) => (
                                                        <MenuItem
                                                            key = {nestedItem.path}
                                                            active = {pathname === nestedItem.path}
                                                            onClick = {() =>
                                                                handleMenuClick(nestedItem.path, {
                                                                    selectedBusinessUnit: nestedItem.businessUnit
                                                                })
                                                            }
                                                        >
                                                            {nestedItem.label}
                                                        </MenuItem>
                                                    ))}
                                                </SubMenu>
                                            ) : (
                                                <MenuItem
                                                    key = {item.path}
                                                    active = {pathname === item.path || (pathname === "/kyc/edit-kyc" && state?.previousPage === item.label)}
                                                    onClick = {() =>
                                                        handleMenuClick(item.path, {
                                                            selectedBusinessUnit: item.businessUnit
                                                        })
                                                    }
                                                >
                                                    {item.label}
                                                </MenuItem>
                                            )
                                        );
                                    })}
                                </SubMenu>
                            ) : (
                                allowedRoutes.includes(menu.path) && (
                                    <MenuItem
                                        key = {menu.key}
                                        icon = {menu.icon}
                                        active = {pathname === menu.path || (pathname === "/" && menu.path === "/") || (pathname === "/user-management/add-user" && menu.path === "/user-management")}
                                        className = "single-dropdown"
                                        onClick = {() => handleMenuClick(menu.path, {}, true)}
                                    >
                                        {menu.label}
                                    </MenuItem>
                                )
                            )}
                        </div>
                    );
                })}
            </div>

            <div className = "absolute footer w-full">
                <div className = "profile-container mb-1">
                    <Avatar
                        size = "small"
                        sx = {{
                            backgroundColor: 'white',
                            color: '#5C6DD7'
                        }}    
                    >
                        {currentUser?.name?.charAt(0)}
                    </Avatar>

                    {!collapsed && (
                        <div className = "user-details">
                            <Tooltip 
                                arrow
                                title = {currentUser?.name}
                                slotProps = {{
                                    popper: {
                                        modifiers: [
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, -10]
                                                }
                                            }
                                        ]
                                    }
                                }}
                            >
                                <span>{currentUser?.name}</span>
                            </Tooltip>

                            <Tooltip 
                                arrow
                                title = {<RoleLabel role = {currentUser?.role} />} 
                                slotProps = {{
                                    popper: {
                                        modifiers: [
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, -10]
                                                }
                                            }
                                        ]
                                    }
                                }}
                            >
                                <small><RoleLabel role = {currentUser?.role} /></small>
                            </Tooltip>
                        </div>
                    )}
                </div>

                <hr className = "m-0" />
            
                <Button
                    startIcon = {<LogoutIcon sx = {{ color: 'white' }} />}
                    size = "small"
                    variant = "outlined"
                    className = "logout-button"
                    onClick = {handleLogout}
                >
                    Logout
                </Button>
            </div>
        </Menu>
    );
}

export default MenuList;
import { useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Grid } from '@mui/material';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import Link from "next/link";
import { IconChevronDown, IconHelp } from "@tabler/icons-react";
import AppLinks from "./AppLinks";
import QuickLinks from "./QuickLinks";
import { useAuth } from '@/contexts/AuthContext';
import { getMenuItemsByRole } from '../../horizontal/navbar/Menudata';

const AppDD = () => {
  const { user } = useAuth();
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  // Get menu items based on user role
  const menuItems = getMenuItemsByRole(user?.role);
  
  // Find the management menu item (Tour Management or My Tours)
  const managementMenu = menuItems.find(item => 
    item.title === 'Tour Management' || item.title === 'My Tours'
  );

  return (<>
    {/* Tours Button - Available to all roles */}
    <Button
      color="inherit"
      sx={{ color: (theme) => theme.palette.text.secondary }}
      variant="text"
      href="/tours"
      component={Link}
    >
      Tours
    </Button>
    
    {/* User Management Button - Only for Admin */}
    {user?.role === 'admin' && (
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/admin/users"
        component={Link}
      >
        User Management
      </Button>
    )}
    
    {/* Bookings Button - Only for Admin */}
    {user?.role === 'admin' && (
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/admin/bookings"
        component={Link}
      >
        Bookings
      </Button>
    )}

    {/* Tour Management - For Admin and Mod */}
    {managementMenu && (user?.role === 'admin' || user?.role === 'mod') && (
      <Box>
        <Button
          aria-label="tour management menu"
          color="inherit"
          variant="text"
          aria-controls="tour-menu"
          aria-haspopup="true"
          sx={{
            bgcolor: anchorEl2 ? "primary.light" : "",
            color: anchorEl2
              ? "primary.main"
              : (theme) => theme.palette.text.secondary,
          }}
          onClick={handleClick2}
          endIcon={
            <IconChevronDown
              size="15"
              style={{ marginLeft: "-5px", marginTop: "2px" }}
            />
          }
        >
          {managementMenu.title}
        </Button>
        <Menu
          id="tour-menu"
          anchorEl={anchorEl2}
          keepMounted
          open={Boolean(anchorEl2)}
          onClose={handleClose2}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
        >
          <Box p={2}>
            {managementMenu.children?.map((child) => (
              <Link key={child.id} href={child.href} style={{ textDecoration: 'none' }}>
                <Button fullWidth sx={{ justifyContent: 'flex-start', mb: 1 }}>
                  {child.title}
                </Button>
              </Link>
            ))}
          </Box>
        </Menu>
      </Box>
    )}
  </>);
};

export default AppDD;

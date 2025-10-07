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

  return (<>
    {/* Spa Dashboard - Available to all roles */}
    <Button
      color="inherit"
      sx={{ color: (theme) => theme.palette.text.secondary }}
      variant="text"
      href="/spa/dashboard"
      component={Link}
    >
      Dashboard
    </Button>

    {/* Customers - For Admin and Mod */}
    {(user?.role === 'admin' || user?.role === 'mod') && (
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/spa/customers"
        component={Link}
      >
        Customers
      </Button>
    )}

    {/* Services - For Admin and Mod */}
    {(user?.role === 'admin' || user?.role === 'mod') && (
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/spa/services"
        component={Link}
      >
        Services
      </Button>
    )}

    {/* Promotions - For Admin and Mod */}
    {(user?.role === 'admin' || user?.role === 'mod') && (
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/spa/promotions"
        component={Link}
      >
        Promotions
      </Button>
    )}

    {/* Service Packages - For Admin and Mod */}
    {(user?.role === 'admin' || user?.role === 'mod') && (
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/spa/service-promotions"
        component={Link}
      >
        Packages
      </Button>
    )}

    {/* Usage - For Admin and Mod */}
    {(user?.role === 'admin' || user?.role === 'mod') && (
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/spa/usage"
        component={Link}
      >
        Usage
      </Button>
    )}
  </>);
};

export default AppDD;

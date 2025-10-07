import { IconLayoutDashboard, IconUsers, IconSpa, IconGift, IconPackage, IconClipboardCheck } from "@tabler/icons-react";
import { uniqueId } from "lodash";

// Function to get menu items based on user role
export const getMenuItemsByRole = (userRole) => {
  const spaItems = [
    {
      id: uniqueId(),
      title: "Spa Dashboard",
      icon: IconLayoutDashboard,
      href: "/spa/dashboard",
      roles: ['admin', 'mod', 'customer'],
    },
    {
      id: uniqueId(),
      title: "Customers",
      icon: IconUsers,
      href: "/spa/customers",
      roles: ['admin', 'mod'],
    },
    {
      id: uniqueId(),
      title: "Services",
      icon: IconSpa,
      href: "/spa/services",
      roles: ['admin', 'mod'],
    },
    {
      id: uniqueId(),
      title: "Promotions",
      icon: IconGift,
      href: "/spa/promotions",
      roles: ['admin', 'mod'],
    },
    {
      id: uniqueId(),
      title: "Service Packages",
      icon: IconPackage,
      href: "/spa/service-promotions",
      roles: ['admin', 'mod'],
    },
    {
      id: uniqueId(),
      title: "Record Usage",
      icon: IconClipboardCheck,
      href: "/spa/usage",
      roles: ['admin', 'mod'],
    },
  ];

  // Filter based on role
  if (userRole === 'customer') {
    return spaItems.filter(item => item.roles.includes('customer'));
  }

  return spaItems;
};

// Default export for backwards compatibility
const Menuitems = [
  {
    id: uniqueId(),
    title: "Spa Dashboard",
    icon: IconLayoutDashboard,
    href: "/spa/dashboard",
  },
  {
    id: uniqueId(),
    title: "Customers",
    icon: IconUsers,
    href: "/spa/customers",
  },
  {
    id: uniqueId(),
    title: "Services",
    icon: IconSpa,
    href: "/spa/services",
  },
  {
    id: uniqueId(),
    title: "Promotions",
    icon: IconGift,
    href: "/spa/promotions",
  },
  {
    id: uniqueId(),
    title: "Service Packages",
    icon: IconPackage,
    href: "/spa/service-promotions",
  },
  {
    id: uniqueId(),
    title: "Record Usage",
    icon: IconClipboardCheck,
    href: "/spa/usage",
  },
];

export default Menuitems;

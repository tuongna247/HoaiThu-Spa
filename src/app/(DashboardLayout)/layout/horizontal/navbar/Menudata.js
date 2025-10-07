import { IconPoint, IconAperture, IconBoxMultiple, IconMapPin, IconSettings, IconList, IconPlus, IconClipboardList, IconUsers } from "@tabler/icons-react";
import { uniqueId } from "lodash";

// Function to get menu items based on user role
export const getMenuItemsByRole = (userRole) => {
  const baseItems = [
    {
      id: uniqueId(),
      title: "Tours",
      icon: IconMapPin,
      href: "/admin/tours",
      roles: ['admin', 'mod'], // Admin and moderators can manage tours
    },
  ];

  // Admin gets everything
  if (userRole === 'admin') {
    return [
      ...baseItems,
      {
        id: uniqueId(),
        title: "Bookings",
        icon: IconClipboardList,
        href: "/admin/bookings",
        roles: ['admin'],
      },
      {
        id: uniqueId(),
        title: "User Management",
        icon: IconUsers,
        href: "/admin/users",
        roles: ['admin'],
      },
      {
        id: uniqueId(),
        title: "Tour Management",
        icon: IconSettings,
        href: "/admin/tours",
        roles: ['admin', 'mod'],
        children: [
          {
            id: uniqueId(),
            title: "All Tours",
            icon: IconList,
            href: "/admin/tours",
            roles: ['admin', 'mod'],
          },
          {
            id: uniqueId(),
            title: "Add New Tour",
            icon: IconPlus,
            href: "/admin/tours/new",
            roles: ['admin', 'mod'],
          },
        ],
      },
    ];
  }

  // Moderator gets tour management but no bookings
  if (userRole === 'mod') {
    return [
      ...baseItems,
      {
        id: uniqueId(),
        title: "My Tours",
        icon: IconSettings,
        href: "/admin/tours",
        roles: ['mod'],
        children: [
          {
            id: uniqueId(),
            title: "My Tours",
            icon: IconList,
            href: "/admin/tours",
            roles: ['mod'],
          },
          {
            id: uniqueId(),
            title: "Add New Tour",
            icon: IconPlus,
            href: "/admin/tours/new",
            roles: ['mod'],
          },
        ],
      },
    ];
  }

  // Customer only gets tours
  return baseItems;
};

// Default export for backwards compatibility
const Menuitems = [
  {
    id: uniqueId(),
    title: "Tours",
    icon: IconMapPin,
    href: "/admin/tours",
  },
  {
    id: uniqueId(),
    title: "Bookings",
    icon: IconClipboardList,
    href: "/admin/bookings",
  },
  {
    id: uniqueId(),
    title: "User Management",
    icon: IconUsers,
    href: "/admin/users",
  },
  {
    id: uniqueId(),
    title: "Tour Management",
    icon: IconSettings,
    href: "/admin/tours",
    children: [
      {
        id: uniqueId(),
        title: "All Tours",
        icon: IconList,
        href: "/admin/tours",
      },
      {
        id: uniqueId(),
        title: "Add New Tour",
        icon: IconPlus,
        href: "/admin/tours/new",
      },
    ],
  },
];

export default Menuitems;

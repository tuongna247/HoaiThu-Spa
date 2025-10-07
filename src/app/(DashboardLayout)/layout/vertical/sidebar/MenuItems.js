import { uniqueId } from 'lodash';

import {
  IconAward,
  IconBoxMultiple,
  IconPoint,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconAperture,
  IconUsers,
  IconGift,
  IconSpa,
  IconLayoutDashboard,
  IconPackage,
  IconClipboardCheck,
} from '@tabler/icons-react';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconAperture,
    href: '/',
    chip: 'New',
    chipColor: 'secondary',
  },
  {
    id: uniqueId(),
    title: 'Sample ',
    icon: IconAperture,
    href: '/sample-page',
  },

  {
    navlabel: true,
    subheader: 'Spa Management',
  },
  {
    id: uniqueId(),
    title: 'Spa Dashboard',
    icon: IconLayoutDashboard,
    href: '/spa/dashboard',
    chip: 'New',
    chipColor: 'success',
  },
  {
    id: uniqueId(),
    title: 'Customers',
    icon: IconUsers,
    href: '/spa/customers',
  },
  {
    id: uniqueId(),
    title: 'Services',
    icon: IconSpa,
    href: '/spa/services',
  },
  {
    id: uniqueId(),
    title: 'Promotions',
    icon: IconGift,
    href: '/spa/promotions',
  },
  {
    id: uniqueId(),
    title: 'Service Packages',
    icon: IconPackage,
    href: '/spa/service-promotions',
  },
  {
    id: uniqueId(),
    title: 'Record Usage',
    icon: IconClipboardCheck,
    href: '/spa/usage',
  },

  {
    navlabel: true,
    subheader: 'Other',
  },
  {
    id: uniqueId(),
    title: 'Menu Level',
    icon: IconBoxMultiple,
    href: '/menulevel/',
    children: [
      {
        id: uniqueId(),
        title: 'Level 1',
        icon: IconPoint,
        href: '/l1',
      },
      {
        id: uniqueId(),
        title: 'Level 1.1',
        icon: IconPoint,
        href: '/l1.1',
        children: [
          {
            id: uniqueId(),
            title: 'Level 2',
            icon: IconPoint,
            href: '/l2',
          },
          {
            id: uniqueId(),
            title: 'Level 2.1',
            icon: IconPoint,
            href: '/l2.1',
            children: [
              {
                id: uniqueId(),
                title: 'Level 3',
                icon: IconPoint,
                href: '/l3',
              },
              {
                id: uniqueId(),
                title: 'Level 3.1',
                icon: IconPoint,
                href: '/l3.1',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Disabled',
    icon: IconBan,
    href: '',
    disabled: true,
  },
  {
    id: uniqueId(),
    title: 'SubCaption',
    subtitle: 'This is the sutitle',
    icon: IconStar,
    href: '',
  },

  {
    id: uniqueId(),
    title: 'Chip',
    icon: IconAward,
    href: '',
    chip: '9',
    chipColor: 'primary',
  },
  {
    id: uniqueId(),
    title: 'Outlined',
    icon: IconMoodSmile,
    href: '',
    chip: 'outline',
    variant: 'outlined',
    chipColor: 'primary',
  },
  {
    id: uniqueId(),
    title: 'External Link',
    external: true,
    icon: IconStar,
    href: 'https://google.com',
  },
];

export default Menuitems;

export const stats = [
  { label: 'Total Revenue',  value: '$24,580', change: 12.8, accent: 'primary' as const, icon: 'DollarSign' },
  { label: 'Total Orders',   value: '1,429',   change: 8.2,  accent: 'cyan'    as const, icon: 'ShoppingBag' },
  { label: 'Customers',      value: '3,842',   change: 5.1,  accent: 'purple'  as const, icon: 'Users' },
  { label: 'Pending Orders', value: '47',      change: -3.4, accent: 'warning' as const, icon: 'Clock' },
];

export const recentOrders = [
  { id: '#ORD-2034', customer: 'Nguyen Van A', total: '$1,240.00', status: 'Paid',      date: '12 Nov 2024' },
  { id: '#ORD-2033', customer: 'Tran Thi B',   total: '$890.00',   status: 'Shipping',  date: '12 Nov 2024' },
  { id: '#ORD-2032', customer: 'Le Van C',     total: '$2,100.00', status: 'Pending',   date: '11 Nov 2024' },
  { id: '#ORD-2031', customer: 'Pham Thi D',   total: '$430.00',   status: 'Cancelled', date: '11 Nov 2024' },
  { id: '#ORD-2030', customer: 'Hoang Van E',  total: '$3,200.00', status: 'Delivered', date: '10 Nov 2024' },
];

export const topProducts = [
  { name: 'Wireless Headphones Pro', sold: 234, revenue: '$23,400' },
  { name: 'Smart Watch Series X',    sold: 198, revenue: '$19,800' },
  { name: 'Gaming Mouse RGB',        sold: 156, revenue: '$7,800'  },
  { name: 'Mechanical Keyboard',     sold: 143, revenue: '$14,300' },
];
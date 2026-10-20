
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route protection
import ProtectedRoute from './ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage';

// Customer pages
import CustomersPage from '../pages/customers/CustomersPage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';

// Category pages
import CategoriesPage from '../pages/categories/CategoriesPage';

export const router = createBrowserRouter([
  // ==========================================
  // AUTH ROUTES - Public
  // ==========================================
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // ==========================================
  // ADMIN ROUTES - Protected
  // ==========================================
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          // Redirect root -> Dashboard
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },

          // Dashboard
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },

          // Customers
          {
            path: 'customers',
            element: <CustomersPage />,
          },
          {
            path: 'customers/:id',
            element: <CustomerDetailPage />,
          },

          // Categories
          {
            path: 'categories',
            element: <CategoriesPage />,
          },

          // TODO: Thêm route khi các trang được tạo:
          // products
          // orders
          // brands
          // coupons
          // reviews
          // inventory
          // settings

          // Admin 404 - URL không tồn tại trong khu vực quản trị
          {
            path: '*',
            element: (
              <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
                <p className="text-6xl font-bold text-accent-primary">
                  404
                </p>

                <h1 className="mt-4 text-xl font-semibold text-text-primary">
                  Không tìm thấy trang
                </h1>

                <p className="mt-2 text-sm text-text-secondary">
                  Trang bạn đang tìm kiếm chưa tồn tại hoặc đường dẫn không chính xác.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                  className="mt-6 rounded-btn bg-accent-primary px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app"
                >
                  Về Dashboard
                </button>
              </div>
            ),
          },
        ],
      },
    ],
  },

  // ==========================================
  // GLOBAL FALLBACK
  // ==========================================
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

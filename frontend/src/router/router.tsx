import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';

// Pages
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductPage } from '@/pages/ProductPage';
import { BundlesPage } from '@/pages/BundlesPage';
import { BundleDetailPage } from '@/pages/BundleDetailPage';
import { CartPage } from '@/pages/CartPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OrderHistoryPage } from '@/pages/OrderHistoryPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { DeliveryPage } from '@/pages/DeliveryPage';
import { InstallmentPage } from '@/pages/InstallmentPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminVerify2FAPage } from '@/pages/AdminVerify2FAPage';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminRoute } from '@/components/AdminRoute';

// Admin pages
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ProductsPage } from '@/pages/admin/ProductsPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { OrdersPage } from '@/pages/admin/OrdersPage';
import { CustomersPage } from '@/pages/admin/CustomersPage';
import { WarehousePage } from '@/pages/admin/WarehousePage';
import { BundlesAdminPage } from '@/pages/admin/BundlesAdminPage';
import { RecommendationsAdminPage } from '@/pages/admin/RecommendationsAdminPage';
import { CampaignsAdminPage } from '@/pages/admin/CampaignsAdminPage';
import { ReviewsAdminPage } from '@/pages/admin/ReviewsAdminPage';
import { AIAssistantAdminPage } from '@/pages/admin/AIAssistantAdminPage';
import { EmployeesPage } from '@/pages/admin/EmployeesPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Home
      {
        index: true,
        element: <HomePage />,
      },

      // Catalog & Products
      {
        path: 'catalog',
        element: <CatalogPage />,
      },
      {
        path: 'catalog/:slug',
        element: <CategoryPage />,
      },
      {
        path: 'product/:slug',
        element: <ProductPage />,
      },

      // Bundles
      {
        path: 'bundles',
        element: <BundlesPage />,
      },
      {
        path: 'bundles/:slug',
        element: <BundleDetailPage />,
      },

      // Shopping
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },

      // Auth - moved outside RootLayout

      // Profile (Future: Add auth protection)
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'profile/orders',
        element: <OrderHistoryPage />,
      },

      // Info Pages
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'delivery',
        element: <DeliveryPage />,
      },
      {
        path: 'installment',
        element: <InstallmentPage />,
      },

      // 404 - catch all
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  // Auth routes (outside RootLayout - standalone pages)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  // Admin routes (outside RootLayout)
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/verify-2fa',
    element: <AdminVerify2FAPage />,
  },
  // Protected admin routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'warehouse',
        element: <WarehousePage />,
      },
      {
        path: 'bundles',
        element: <BundlesAdminPage />,
      },
      {
        path: 'recommendations',
        element: <RecommendationsAdminPage />,
      },
      {
        path: 'campaigns',
        element: <CampaignsAdminPage />,
      },
      {
        path: 'reviews',
        element: <ReviewsAdminPage />,
      },
      {
        path: 'ai-assistant',
        element: <AIAssistantAdminPage />,
      },
      {
        path: 'employees',
        element: <EmployeesPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

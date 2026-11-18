import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';

// Route components are split so the storefront only downloads the active page.
const HomePage = lazy(() => import('@/pages/HomePage/HomePage').then((module) => ({ default: module.HomePage })));
const CatalogPage = lazy(() => import('@/pages/CatalogPage/CatalogPage').then((module) => ({ default: module.CatalogPage })));
const CategoryPage = lazy(() => import('@/pages/CategoryPage/CategoryPage').then((module) => ({ default: module.CategoryPage })));
const ProductPage = lazy(() => import('@/pages/ProductPage/ProductPage').then((module) => ({ default: module.ProductPage })));
const BundlesPage = lazy(() => import('@/pages/BundlesPage/BundlesPage').then((module) => ({ default: module.BundlesPage })));
const BundleDetailPage = lazy(() => import('@/pages/BundleDetailPage/BundleDetailPage').then((module) => ({ default: module.BundleDetailPage })));
const CartPage = lazy(() => import('@/pages/CartPage/CartPage').then((module) => ({ default: module.CartPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage/FavoritesPage').then((module) => ({ default: module.FavoritesPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const GoogleCallbackPage = lazy(() => import('@/pages/GoogleCallbackPage').then((module) => ({ default: module.GoogleCallbackPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage/OrderHistoryPage').then((module) => ({ default: module.OrderHistoryPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage/AboutPage').then((module) => ({ default: module.AboutPage })));
const ContactsPage = lazy(() => import('@/pages/ContactsPage/ContactsPage').then((module) => ({ default: module.ContactsPage })));
const DeliveryPage = lazy(() => import('@/pages/DeliveryPage/DeliveryPage').then((module) => ({ default: module.DeliveryPage })));
const InstallmentPage = lazy(() => import('@/pages/InstallmentPage/InstallmentPage').then((module) => ({ default: module.InstallmentPage })));
const TermsPage = lazy(() => import('@/pages/LegalPages/TermsPage').then((module) => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import('@/pages/LegalPages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const AdminVerify2FAPage = lazy(() => import('@/pages/AdminVerify2FAPage').then((module) => ({ default: module.AdminVerify2FAPage })));
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminRoute } from '@/components/AdminRoute';
import { AuthRoute } from '@/components/AuthRoute/AuthRoute';
import { PaymentResultPage } from '@/pages/PaymentResultPage';

const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage/ProductsPage').then((module) => ({ default: module.ProductsPage })));
const ProductCreatePage = lazy(() => import('@/pages/admin/ProductsPage/ProductCreatePage').then((module) => ({ default: module.ProductCreatePage })));
const ProductEditPage = lazy(() => import('@/pages/admin/ProductsPage/ProductEditPage').then((module) => ({ default: module.ProductEditPage })));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage/CategoriesPage').then((module) => ({ default: module.CategoriesPage })));
const CategoryCreatePage = lazy(() => import('@/pages/admin/CategoriesPage/CategoryCreatePage').then((module) => ({ default: module.CategoryCreatePage })));
const CategoryEditPage = lazy(() => import('@/pages/admin/CategoriesPage/CategoryEditPage').then((module) => ({ default: module.CategoryEditPage })));
const OrdersPage = lazy(() => import('@/pages/admin/OrdersPage/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const CustomersPage = lazy(() => import('@/pages/admin/CustomersPage/CustomersPage').then((module) => ({ default: module.CustomersPage })));
const WarehousePage = lazy(() => import('@/pages/admin/WarehousePage/WarehousePage').then((module) => ({ default: module.WarehousePage })));
const BundlesAdminPage = lazy(() => import('@/pages/admin/BundlesAdminPage/BundlesAdminPage').then((module) => ({ default: module.BundlesAdminPage })));
const RecommendationsAdminPage = lazy(() => import('@/pages/admin/RecommendationsAdminPage/RecommendationsAdminPage').then((module) => ({ default: module.RecommendationsAdminPage })));
const CampaignsAdminPage = lazy(() => import('@/pages/admin/CampaignsAdminPage/CampaignsAdminPage').then((module) => ({ default: module.CampaignsAdminPage })));
const ReviewsAdminPage = lazy(() => import('@/pages/admin/ReviewsAdminPage/ReviewsAdminPage').then((module) => ({ default: module.ReviewsAdminPage })));
const AIAssistantAdminPage = lazy(() => import('@/pages/admin/AIAssistantAdminPage/AIAssistantAdminPage').then((module) => ({ default: module.AIAssistantAdminPage })));
const EmployeesPage = lazy(() => import('@/pages/admin/EmployeesPage/EmployeesPage').then((module) => ({ default: module.EmployeesPage })));
const AnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage/SettingsPage').then((module) => ({ default: module.SettingsPage })));

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
        path: 'catalog/school-supplies',
        element: <Navigate to="/catalog/backpacks" replace />,
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
        element: <AuthRoute redirectToLoginOnMobile><CheckoutPage /></AuthRoute>,
      },

      // Customer authentication pages share the storefront shell.
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'auth/google/callback', element: <GoogleCallbackPage /> },

      // Auth - moved outside RootLayout

      // Profile (Future: Add auth protection)
      {
        path: 'profile',
        element: <AuthRoute><ProfilePage /></AuthRoute>,
      },
      {
        path: 'profile/orders',
        element: <AuthRoute><OrderHistoryPage /></AuthRoute>,
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
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },

      // 404 - catch all
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/payment/success',
    element: <PaymentResultPage variant="success" />,
  },
  {
    path: '/payment/failed',
    element: <PaymentResultPage variant="failed" />,
  },
  // Admin routes (outside RootLayout)
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
        path: 'products/create',
        element: <ProductCreatePage />,
      },
      {
        path: 'products/:id/edit',
        element: <ProductEditPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'categories/create',
        element: <CategoryCreatePage />,
      },
      {
        path: 'categories/:id/edit',
        element: <CategoryEditPage />,
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

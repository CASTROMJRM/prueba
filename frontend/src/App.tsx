import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CatalogePage from "./pages/CatalogePage";
import SuscripcionesPage from "./pages/SuscripcionesPage";
import AboutPage from "./pages/AboutPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AboutePage from "./pages/AboutePage";
import NotFoundPage from "./pages/NotFoundPage";
import Error500Page from "./pages/Page500";
import Error400Page from "./pages/400";
// Admin
import AdminLayout from "./components/layout/admin/AdminLayout/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminSiteSettingsPage from "./pages/admin/AdminSiteSettingsPage";
import AdminSuscripcionesPage from "./pages/admin/AdminSuscripcionesPage";

// Client Portal
import ClientPortalLayout from "./components/layout/client/ClientPortalLayout/ClientPortalLayout";
import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ClientSubscriptionPage from "./pages/client/ClientSubscriptionPage";
import ClientPaymentsPage from "./pages/client/ClientPaymentsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/catalogue" element={<CatalogePage />} />
        <Route path="/suscripciones" element={<SuscripcionesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/AboutPage" element={<AboutPage />} />
        <Route path="/AboutePage" element={<AboutePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/500" element={<Error500Page />} />
        <Route path="/400" element={<Error400Page />} />

        {/*Admin Dashboard (sin navbar público) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="suscripciones" element={<AdminSuscripcionesPage />} />
          <Route path="settings" element={<AdminSiteSettingsPage />} />
        </Route>

        {/* Client Portal */}
        <Route path="/cliente" element={<ClientPortalLayout />}>
          <Route index element={<ClientDashboardPage />} />
          <Route path="perfil" element={<ClientProfilePage />} />
          <Route path="suscripcion" element={<ClientSubscriptionPage />} />
          <Route path="pagos" element={<ClientPaymentsPage />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

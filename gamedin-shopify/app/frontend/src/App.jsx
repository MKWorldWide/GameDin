import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  AppProvider,
  Frame,
  Loading,
  Toast,
} from "@shopify/polaris";
import { useNavigationStructure } from "./hooks/useNavigationStructure";
import { useToast } from "./hooks/useToast";

// Import pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";

// Import translations
import translations from "@shopify/polaris/locales/en.json";

/**
 * Main App component
 * 
 * This is the root component of the GameDin Shopify app.
 * It sets up the app structure, navigation, and routing.
 */
const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const { navigationMarkup, mobileNavigationActive, toggleMobileNavigationActive } = useNavigationStructure();

  // Loading markup
  const loadingMarkup = isLoading ? <Loading /> : null;

  // Toast markup
  const toastMarkup = toast ? (
    <Toast
      content={toast.content}
      error={toast.error}
      onDismiss={hideToast}
      duration={toast.duration}
    />
  ) : null;

  return (
    <BrowserRouter>
      <AppProvider i18n={translations}>
        <Frame
          navigation={navigationMarkup}
          showMobileNavigation={mobileNavigationActive}
          onNavigationDismiss={toggleMobileNavigationActive}
          skipToContentTarget="#main"
          topBar={null} // We're not using a top bar in this app
        >
          {loadingMarkup}
          {toastMarkup}
          <div id="main">
            <Routes>
              <Route path="/" element={<Dashboard showToast={showToast} />} />
              <Route path="/products" element={<Products showToast={showToast} />} />
              <Route path="/products/:id" element={<ProductDetails showToast={showToast} />} />
              <Route path="/customers" element={<Customers showToast={showToast} />} />
              <Route path="/not-found" element={<NotFound showToast={showToast} />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
          </div>
        </Frame>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App; 
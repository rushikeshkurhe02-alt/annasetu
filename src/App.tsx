import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoFloatingControls } from './components/demo/DemoFloatingControls';

// Pages
import { HomePage } from './pages/HomePage';
import { ProvidersDirectoryPage } from './pages/ProvidersDirectoryPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { PlacesDirectoryPage } from './pages/PlacesDirectoryPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { NgosDirectoryPage } from './pages/NgosDirectoryPage';
import { NgoDetailPage } from './pages/NgoDetailPage';
import { AuthPage } from './pages/AuthPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { NgoDashboardPage } from './pages/NgoDashboardPage';
import { ImpactReportPage } from './pages/ImpactReportPage';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <DemoProvider>
            <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/providers" element={<ProvidersDirectoryPage />} />
                  <Route path="/providers/:id" element={<ProviderDetailPage />} />
                  <Route path="/places" element={<PlacesDirectoryPage />} />
                  <Route path="/places/:id" element={<PlaceDetailPage />} />
                  <Route path="/ngos" element={<NgosDirectoryPage />} />
                  <Route path="/ngos/:id" element={<NgoDetailPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
                  <Route path="/ngo-dashboard" element={<NgoDashboardPage />} />
                  <Route path="/impact-report" element={<ImpactReportPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <ToastContainer />
              <DemoFloatingControls />
            </div>
          </DemoProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import GetStartedPage from './pages/GetStartedPage'
import BlogIndexPage from './pages/BlogIndexPage'
import BlogPostPage from './pages/BlogPostPage'
import ComparePage from './pages/ComparePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import MagicLinkPage from './pages/auth/MagicLinkPage'
import VerifyPage from './pages/auth/VerifyPage'
import { CookieBanner } from './components/ConsentBanner'

import DashboardPage from './pages/DashboardPage'
import NewClientPage from './pages/NewClientPage'
import SubduedPage from './pages/SubduedPage'
import BillingPage from './pages/BillingPage'
import ProfilePage from './pages/ProfilePage'
import ClientDetailPage from './pages/client/ClientDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <>
      <Routes>
        {/* Public — reachable whether or not anyone is signed in */}
        <Route path="/" element={<HomePage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/magic-link" element={<MagicLinkPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        {/* xsl-backend's sendMagicLinkEmail() builds links as /portal/verify?token=...
          (see auth.routes.ts) — aliased here rather than asking the backend to change. */}
        <Route path="/portal/verify" element={<VerifyPage />} />

        {/* Authenticated console */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients/new" element={<NewClientPage />} />
            <Route path="/clients/:slug" element={<ClientDetailPage />} />
            <Route path="/subdued" element={<SubduedPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <CookieBanner />
    </>
  )
}

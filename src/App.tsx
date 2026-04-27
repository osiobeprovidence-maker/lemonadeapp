import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Screens
import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import Auth from './screens/Auth';
import Home from './screens/Home';
import Explore from './screens/Explore';
import StoryDetail from './screens/StoryDetail';
import Reader from './screens/Reader';
import Library from './screens/Library';
import CreatorDashboard from './screens/CreatorDashboard';
import UploadFlow from './screens/UploadFlow';
import CreatorProfile from './screens/CreatorProfile';
import ReaderProfile from './screens/ReaderProfile';
import CreatorPortfolio from './screens/CreatorPortfolio';
import Premium from './screens/Premium';
import Wallet from './screens/Wallet';
import SearchResults from './screens/SearchResults';
import Notifications from './screens/Notifications';
import Settings from './screens/Settings';
import AdminLogin from './screens/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import AdminOverview from './screens/admin/AdminOverview';
import AdminUsers from './screens/admin/AdminUsers';
import AdminCreators from './screens/admin/AdminCreators';
import AdminApplications from './screens/admin/AdminApplications';
import AdminStories from './screens/admin/AdminStories';
import AdminReports from './screens/admin/AdminReports';
import AdminPayments from './screens/admin/AdminPayments';
import AdminDropSomething from './screens/admin/AdminDropSomething';
import AdminPremium from './screens/admin/AdminPremium';
import AdminModerators from './screens/admin/AdminModerators';
import AdminFeatured from './screens/admin/AdminFeatured';
import AdminSettingsPage from './screens/admin/AdminSettings';
import AdminActivity from './screens/admin/AdminActivity';
import AdminAnalytics from './screens/admin/AdminAnalytics';
import AdminUserDetail from './screens/admin/details/AdminUserDetail';
import AdminCreatorDetail from './screens/admin/details/AdminCreatorDetail';
import AdminStoryDetail from './screens/admin/details/AdminStoryDetail';
import AdminReportDetail from './screens/admin/details/AdminReportDetail';
import AdminPaymentDetail from './screens/admin/details/AdminPaymentDetail';
import AdminApplicationDetail from './screens/admin/details/AdminApplicationDetail';
import AdminFeaturedEditor from './screens/admin/details/AdminFeaturedEditor';
import AdminPlatformRules from './screens/admin/AdminPlatformRules';
import AdminModerationPresets from './screens/admin/AdminModerationPresets';
import AdminAuditLog from './screens/admin/AdminAuditLog';

// User Settings Detail
import SettingsAccountProfile from './screens/settings/SettingsAccountProfile';
import SettingsAccountPassword from './screens/settings/SettingsAccountPassword';
import SettingsAccountPrivacy from './screens/settings/SettingsAccountPrivacy';
import SettingsAppearance from './screens/settings/SettingsAppearance';
import SettingsReading from './screens/settings/SettingsReading';
import SettingsNotifications from './screens/settings/SettingsNotifications';
import SettingsCreator from './screens/settings/SettingsCreator';
import SettingsLegal from './screens/settings/SettingsLegal';
import Help from './screens/help/Help';
import ContactSupport from './screens/help/ContactSupport';
import ReportProblem from './screens/help/ReportProblem';

// Legal
import Terms from './screens/legal/Terms';
import Privacy from './screens/legal/Privacy';

import CreatorApplication from './screens/CreatorApplication';
import CreatorApplicationStatus from './screens/CreatorApplicationStatus';
import StudioAccessGuard from './components/StudioAccessGuard';

import NavigationLayout from './components/NavigationLayout';

import { AppProvider } from './contexts/AppContext';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Main App Routes with Navigation */}
        <Route element={<NavigationLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/library" element={<Library />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/account/profile" element={<SettingsAccountProfile />} />
          <Route path="/settings/account/password" element={<SettingsAccountPassword />} />
          <Route path="/settings/account/privacy" element={<SettingsAccountPrivacy />} />
          <Route path="/settings/appearance" element={<SettingsAppearance />} />
          <Route path="/settings/reading" element={<SettingsReading />} />
          <Route path="/settings/notifications" element={<SettingsNotifications />} />
          <Route path="/settings/creator" element={<SettingsCreator />} />
          <Route path="/settings/legal" element={<SettingsLegal />} />
          <Route path="/settings/help" element={<Help />} />
          
          <Route path="/help" element={<Help />} />
          <Route path="/help/contact" element={<ContactSupport />} />
          <Route path="/help/report-problem" element={<ReportProblem />} />
          
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<ReaderProfile />} />
          <Route path="/premium" element={<Premium />} />
          
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/creator/:username" element={<CreatorProfile />} />
          <Route path="/creator/:username/portfolio" element={<CreatorPortfolio />} />
          
          <Route path="/creator-application" element={<CreatorApplication />} />
          <Route path="/creator-application/status" element={<CreatorApplicationStatus />} />
          
          {/* Creator Studio Routes */}
          <Route path="/studio" element={
            <StudioAccessGuard>
              <CreatorDashboard />
            </StudioAccessGuard>
          } />
          <Route path="/studio/upload" element={
            <StudioAccessGuard>
              <UploadFlow />
            </StudioAccessGuard>
          } />
        </Route>

        {/* Reader is full screen, no standard navigation */}
        <Route path="/read/:id/:chapterNum" element={<Reader />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminOverview />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/analytics" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/activity" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminActivity />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/users" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/users/:userId" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminUserDetail />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/creators" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminCreators />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/creators/:username" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminCreatorDetail />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/applications" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminApplications />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/applications/:applicationId" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminApplicationDetail />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/stories" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminStories />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/stories/:storyId" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminStoryDetail />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/reports" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/reports/:reportId" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminReportDetail />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/payments" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminPayments />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/payments/:paymentId" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminPaymentDetail />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/dropsomething" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminDropSomething />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/premium" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminPremium />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/moderators" element={
          <AdminRouteGuard superAdminOnly>
            <AdminLayout>
              <AdminModerators />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/featured" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminFeatured />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/featured/editor" element={
          <AdminRouteGuard>
            <AdminLayout>
               <AdminFeaturedEditor />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/settings" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/platform-rules" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminPlatformRules />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/moderation-presets" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminModerationPresets />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        <Route path="/admin/audit-log" element={
          <AdminRouteGuard>
            <AdminLayout>
              <AdminAuditLog />
            </AdminLayout>
          </AdminRouteGuard>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AnimatedRoutes />
      </AppProvider>
    </Router>
  );
}


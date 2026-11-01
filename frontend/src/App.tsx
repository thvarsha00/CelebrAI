import React, { lazy, Suspense } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage').then(m => ({ default: m.CreateEventPage })));
const EventPlanView = lazy(() => import('./pages/EventPlanView').then(m => ({ default: m.EventPlanView })));
const BudgetPlannerPage = lazy(() => import('./pages/BudgetPlannerPage').then(m => ({ default: m.BudgetPlannerPage })));
const ThemeStudioPage = lazy(() => import('./pages/ThemeStudioPage').then(m => ({ default: m.ThemeStudioPage })));
const InvitationStudioPage = lazy(() => import('./pages/InvitationStudioPage').then(m => ({ default: m.InvitationStudioPage })));
const GuestManagerPage = lazy(() => import('./pages/GuestManagerPage').then(m => ({ default: m.GuestManagerPage })));
const EventTimelinePage = lazy(() => import('./pages/EventTimelinePage').then(m => ({ default: m.EventTimelinePage })));
const ShoppingChecklistPage = lazy(() => import('./pages/ShoppingChecklistPage').then(m => ({ default: m.ShoppingChecklistPage })));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage').then(m => ({ default: m.AIAssistantPage })));
const LastMinuteRescuePage = lazy(() => import('./pages/LastMinuteRescuePage').then(m => ({ default: m.LastMinuteRescuePage })));
const MyEventsPage = lazy(() => import('./pages/MyEventsPage').then(m => ({ default: m.MyEventsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center" role="status">
    <span className="text-sm text-gray-500">Loading page...</span>
  </div>
);

const AppContent: React.FC = () => {
  const { isLanding, activeTab } = useEventContext();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'my-events': return <MyEventsPage />;
      case 'create-event': return <CreateEventPage />;
      case 'event-plan': return <EventPlanView />;
      case 'budget': return <BudgetPlannerPage />;
      case 'theme-studio': return <ThemeStudioPage />;
      case 'invitations': return <InvitationStudioPage />;
      case 'guests': return <GuestManagerPage />;
      case 'timeline': return <EventTimelinePage />;
      case 'shopping': return <ShoppingChecklistPage />;
      case 'ai-assistant': return <AIAssistantPage />;
      case 'last-minute': return <LastMinuteRescuePage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-warm-white dark:bg-[#151722] text-brand-navy dark:text-brand-warm-white transition-colors duration-200">
      <Navbar />
      <Toast />

      <Suspense fallback={<PageLoader />}>
        {isLanding ? (
          <main className="flex-1">
            <LandingPage />
          </main>
        ) : (
          <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {renderActiveTab()}
            </main>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export const App: React.FC = () => (
  <EventProvider>
    <AppContent />
  </EventProvider>
);

export default App;

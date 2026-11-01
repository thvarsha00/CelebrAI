import React from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';

import { LandingPage } from './pages/LandingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { CreateEventPage } from './pages/CreateEventPage';
import { EventPlanView } from './pages/EventPlanView';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { ThemeStudioPage } from './pages/ThemeStudioPage';
import { InvitationStudioPage } from './pages/InvitationStudioPage';
import { GuestManagerPage } from './pages/GuestManagerPage';
import { EventTimelinePage } from './pages/EventTimelinePage';
import { ShoppingChecklistPage } from './pages/ShoppingChecklistPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { LastMinuteRescuePage } from './pages/LastMinuteRescuePage';
import { MyEventsPage } from './pages/MyEventsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { isLanding, activeTab } = useEventContext();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'my-events':
        return <MyEventsPage />;
      case 'create-event':
        return <CreateEventPage />;
      case 'event-plan':
        return <EventPlanView />;
      case 'budget':
        return <BudgetPlannerPage />;
      case 'theme-studio':
        return <ThemeStudioPage />;
      case 'invitations':
        return <InvitationStudioPage />;
      case 'guests':
        return <GuestManagerPage />;
      case 'timeline':
        return <EventTimelinePage />;
      case 'shopping':
        return <ShoppingChecklistPage />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      case 'last-minute':
        return <LastMinuteRescuePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-warm-white dark:bg-[#151722] text-brand-navy dark:text-brand-warm-white transition-colors duration-200">
      <Navbar />
      <Toast />

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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
};

export default App;

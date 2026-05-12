import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children, activePage, onNavigate, dashboards, onAddDashboard, onDeleteDashboard, onRenameDashboard }) {
  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        dashboards={dashboards}
        onAddDashboard={onAddDashboard}
        onDeleteDashboard={onDeleteDashboard}
        onRenameDashboard={onRenameDashboard}
      />
      <div className="main-area">
        <Header />
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

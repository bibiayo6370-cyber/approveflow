import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';
import { ApproveFlowLogo } from '../brand/ApproveFlowLogo';
import { ThemeToggle } from '../theme/ThemeToggle';
import { CAPABILITIES } from '../../architecture/capabilities';
import type { Role } from '../../types/api';

export function AppShell({ children, role, userEmail, onLogout }: {
  children: ReactNode;
  role: Role;
  userEmail: string;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isRequester = role === 'REQUESTER';
  const handleNavigate = () => setMenuOpen(false);
  const initials = userEmail.slice(0, 2).toUpperCase();
  const previewFeatures = CAPABILITIES.filter(feature => feature.source === 'DEMO_FIXTURE');

  return <div className="af-app-layout">
    <button className="af-mobile-menu af-icon-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
      aria-controls="af-primary-sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
      {menuOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
    {menuOpen && <button className="af-nav-scrim" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside id="af-primary-sidebar" className={`af-sidebar ${menuOpen ? 'af-sidebar-open' : ''}`} aria-label="Primary navigation">
      <NavLink to="/" className="af-brand-link" onClick={handleNavigate}><ApproveFlowLogo /></NavLink>
      <div className="af-sidebar-section-title">WORKSPACE</div>
      <nav className="af-nav-list" aria-label="Live workspace">
        <NavLink to="/" end className={({ isActive }) => `af-nav-item ${isActive ? 'af-nav-active' : ''}`} onClick={handleNavigate}>
          <LayoutDashboard size={19} aria-hidden="true" /><span>{isRequester ? 'My requests' : 'Pending decisions'}</span>
        </NavLink>
        {isRequester && <NavLink to="/requests/new" className={({ isActive }) => `af-nav-item ${isActive ? 'af-nav-active' : ''}`} onClick={handleNavigate}>
          <Plus size={19} aria-hidden="true" /><span>Create request</span>
        </NavLink>}
      </nav>
      <div className="af-sidebar-section-title af-preview-title">PRODUCT VISION <span className="af-preview-pill">Preview</span></div>
      <div className="af-feature-preview-list" aria-label="Future features, not yet available in the live MVP">
        {previewFeatures.map(feature => <div className="af-preview-item" key={feature.id} title={feature.description}>
          <span className="af-preview-dot" aria-hidden="true" />{feature.label}
        </div>)}
      </div>
      <div className="af-sidebar-spacer" />
      <div className="af-sidebar-footnote">Interactive product previews are being prepared. Live request actions remain connected to the real API.</div>
    </aside>
    <div className="af-main-area">
      <div className="af-topbar">
        <div className="af-topbar-title"><ClipboardList size={18} aria-hidden="true" /> <span>{isRequester ? 'Requester workspace' : 'Approver workspace'}</span></div>
        <div className="af-topbar-actions"><ThemeToggle />
          <span className="af-user-avatar" aria-hidden="true">{initials}</span>
          <span className="af-user-meta"><strong>{userEmail}</strong><small>{isRequester ? 'Requester' : 'Approver'} · Live MVP</small></span>
          <button className="af-icon-button af-logout" type="button" onClick={onLogout} aria-label="Log out"><LogOut size={18} aria-hidden="true" /><span>Log out</span></button>
        </div>
      </div>
      <main id="main-content" className="af-main-content">{children}</main>
    </div>
  </div>;
}

export function PublicShell({ children }: { children: ReactNode }) {
  return <div className="af-public-shell">
    <header className="af-public-header"><ApproveFlowLogo /><ThemeToggle /></header>
    <main className="af-public-main" id="main-content">{children}</main>
    <footer className="af-public-footer">ApproveFlow · Structured approvals, better decisions.</footer>
  </div>;
}

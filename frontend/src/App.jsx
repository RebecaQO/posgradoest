import React, { lazy, Suspense, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLoginView } from './components/auth/AdminLoginView';

import { HeroSection } from './components/home/HeroSection';
import { PromotionalBannerSection } from './components/home/PromotionalBannerSection';
import { FeaturedPrograms } from './components/home/FeaturedPrograms';
import { KpiSection } from './components/home/KpiSection';
import { ImpactSection } from './components/home/ImpactSection';
import { EventsSection } from './components/home/EventsSection';
import { MasterBannerPopup } from './components/common/MasterBannerPopup';

const InstitutionView = lazy(() => import('./components/institution/InstitutionView').then((m) => ({ default: m.InstitutionView })));
const ProgramsView = lazy(() => import('./components/programs/ProgramsView').then((m) => ({ default: m.ProgramsView })));
const ProgramDetailModal = lazy(() => import('./components/programs/ProgramDetailModal').then((m) => ({ default: m.ProgramDetailModal })));
const ProgramDetailView = lazy(() => import('./components/programs/ProgramDetailView').then((m) => ({ default: m.ProgramDetailView })));
const AdmissionView = lazy(() => import('./components/admission/AdmissionView').then((m) => ({ default: m.AdmissionView })));
const RegulationsView = lazy(() => import('./components/regulations/RegulationsView').then((m) => ({ default: m.RegulationsView })));
const NewsView = lazy(() => import('./components/news/NewsView').then((m) => ({ default: m.NewsView })));
const ContactView = lazy(() => import('./components/contact/ContactView').then((m) => ({ default: m.ContactView })));
const AdminPortal = lazy(() => import('./components/portals/AdminPortal').then((m) => ({ default: m.AdminPortal })));

import './styles/index.css';
import './styles/components.css';

const getInitialHashState = () => {
  const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
  if (hash === '#admin' || hash === '#/admin') return { tab: 'admin-login', programId: null };
  if (hash === '#admin/panel' || hash === '#/admin/panel') return { tab: 'portal-admin', programId: null };
  if (hash.startsWith('#programa/') || hash.startsWith('#/programa/')) {
    const id = hash.replace(/^#\/?programa\//, '');
    return {
      tab: 'programa-detalle',
      programId: id ? decodeURIComponent(id) : null,
    };
  }
  if (hash === '#programas' || hash === '#/programas') {
    return { tab: 'programas', programId: null };
  }
  if (hash === '#admision' || hash === '#/admision') {
    return { tab: 'admision', programId: null };
  }
  return { tab: 'inicio', programId: null };
};

const MainApp = () => {
  const initial = getInitialHashState();
  const [currentTab, setCurrentTab] = useState(initial.tab);
  const [selectedProgramModal, setSelectedProgramModal] = useState(null);
  const [selectedProgramDetailId, setSelectedProgramDetailId] = useState(initial.programId);
  const [targetProgramForAdmission, setTargetProgramForAdmission] = useState(null);
  const [programFilterState, setProgramFilterState] = useState(null);
  const { currentUser, logout } = useAuth();

  React.useEffect(() => {
    try { window.localStorage.removeItem('posgrado_umsa_applicants'); } catch { /* El almacenamiento local puede estar bloqueado por el navegador. */ }
  }, []);

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#programa/') || hash.startsWith('#/programa/')) {
        const id = hash.replace(/^#\/?programa\//, '');
        if (id) {
          setSelectedProgramDetailId(decodeURIComponent(id));
          setCurrentTab('programa-detalle');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash === '#programas' || hash === '#/programas') {
        setCurrentTab('programas');
      } else if (hash === '#admision' || hash === '#/admision') {
        setCurrentTab('admision');
      } else if (hash === '#admin' || hash === '#/admin') {
        setCurrentTab(currentUser ? 'portal-admin' : 'admin-login');
      } else if (hash === '#admin/panel' || hash === '#/admin/panel') {
        setCurrentTab('portal-admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentUser]);

  const handleNavigateToAdmission = (programId = null) => {
    if (programId) setTargetProgramForAdmission(programId);
    setCurrentTab('admision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterPrograms = (filterObj) => {
    setProgramFilterState(filterObj);
    setCurrentTab('programas');
  };

  const handleLoginSuccess = () => {
    setCurrentTab('portal-admin');
    window.location.hash = 'admin/panel';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (currentTab === 'portal-admin' && !currentUser) {
      setCurrentTab('admin-login');
      window.location.hash = 'admin';
    }
  }, [currentTab, currentUser]);

  const handleOpenProgramDetail = (prog) => {
    const progId = prog?.id || prog?.code || prog;
    setSelectedProgramDetailId(progId);
    setCurrentTab('programa-detalle');
    window.location.hash = `programa/${progId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // MODO ADMIN: pantalla completa sin navbar/footer publicos
  if (currentTab === 'portal-admin' && currentUser) {
    return (
      <Suspense fallback={<div role="status" className="container">Cargando panel administrativo…</div>}><AdminPortal
        onExitAdmin={async () => {
          await logout();
          setCurrentTab('inicio');
          window.location.hash = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      /></Suspense>
    );
  }

  if (currentTab === 'admin-login') {
    return <AdminLoginView onLoginSuccess={handleLoginSuccess} onBack={() => { setCurrentTab('inicio'); window.location.hash = ''; }} />;
  }

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">Saltar al contenido</a>

      <Navbar
        currentTab={currentTab === 'programa-detalle' ? 'programas' : currentTab}
        setCurrentTab={(tab) => {
          if (window.location.hash.startsWith('#programa/')) {
            window.location.hash = tab === 'programas' ? '#programas' : '';
          }
          setCurrentTab(tab);
        }}
        onOpenProgramDetail={handleOpenProgramDetail}
      />

      <Suspense fallback={<div role="status" className="container" style={{ padding: '3rem 1rem' }}>Cargando contenido…</div>}><main id="main" className="site-main">
        {currentTab === 'inicio' && (
          <div className="animate-fade-in">
            <HeroSection onNavigate={setCurrentTab} onFilterPrograms={handleFilterPrograms} />
            <PromotionalBannerSection onSelectProgram={handleOpenProgramDetail} />
            <FeaturedPrograms onSelectProgram={handleOpenProgramDetail} onNavigateToAdmission={handleNavigateToAdmission} />
            <KpiSection />
            <ImpactSection
              onExplorePrograms={() => { setCurrentTab('programas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onAboutInstitution={() => { setCurrentTab('institucion'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        )}
        {currentTab === 'institucion' && <InstitutionView />}
        {currentTab === 'programas' && (
          <ProgramsView onNavigateToAdmission={handleNavigateToAdmission} initialFilter={programFilterState} onSelectProgram={handleOpenProgramDetail} />
        )}
        {currentTab === 'programa-detalle' && (
          <ProgramDetailView
            programId={selectedProgramDetailId}
            onBack={() => { window.location.hash = 'programas'; setCurrentTab('programas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onNavigateToAdmission={handleNavigateToAdmission}
          />
        )}
        {currentTab === 'admision' && <AdmissionView targetProgramId={targetProgramForAdmission} />}
        {currentTab === 'normativa' && <RegulationsView />}
        {currentTab === 'noticias' && <NewsView />}
        {currentTab === 'contacto' && <ContactView />}
      </main></Suspense>

      <Footer onNavigate={(tab) => { if (window.location.hash.startsWith('#programa/')) window.location.hash = ''; setCurrentTab(tab); }} />
      <Suspense fallback={null}>{selectedProgramModal && (
        <ProgramDetailModal
          program={selectedProgramModal}
          onClose={() => setSelectedProgramModal(null)}
          onApply={(progId) => { setSelectedProgramModal(null); handleNavigateToAdmission(progId); }}
        />
      )}</Suspense>
      <MasterBannerPopup onNavigateToProgram={handleOpenProgramDetail} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

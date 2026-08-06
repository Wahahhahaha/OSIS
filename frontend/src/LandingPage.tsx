import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Briefcase, 
  Coins, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  User as UserIcon, 
  Sun, 
  Moon, 
  CheckSquare, 
  Award,
  Menu,
  X
} from 'lucide-react';
import { authApi } from './api';
import type { SystemResponse } from './api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light'
  );
  const [systemSettings, setSystemSettings] = useState<SystemResponse | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fitur' | 'kandidat' | 'faq'>('fitur');
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [dbActivePeriod, setDbActivePeriod] = useState<any>(null);

  // Authentication State
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isLoggedIn = false;
  let dashboardPath = '/dashboard';
  let userName = '';

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      isLoggedIn = true;
      userName = user.username || 'Pengguna';
      const isTeacher = user.level === 'school' && user.role === 'teacher';
      const isStudentNoRole = user.level === 'student' && (!user.role || user.role === '-' || user.role === 'members' || user.role === 'student');
      if (isTeacher || isStudentNoRole) {
        dashboardPath = '/vote';
      }
    } catch (err) {
      console.error('Error parsing user storage in landing page:', err);
    }
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    const fetchSystem = async () => {
      try {
        const system = await authApi.getSystemSettings();
        setSystemSettings(system);
        document.title = `E-OSIS - ${system.systemname}`;
      } catch (err) {
        console.error('Failed to load system settings', err);
        document.title = 'E-OSIS - Portal OSIS Digital';
      }
    };

    const fetchCandidates = async () => {
      try {
        const data = await authApi.getPublicCandidates();
        if (data && Array.isArray(data.candidates)) {
          setCandidatesList(data.candidates);
          setDbActivePeriod(data.activePeriod);
        }
      } catch (err) {
        console.error('Failed to load public candidates:', err);
      }
    };

    fetchSystem();
    fetchCandidates();
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate(dashboardPath);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-dark)',
      fontFamily: 'var(--font-family)',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(16px)',
        backgroundColor: theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid var(--card-border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'var(--transition)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {systemSettings?.systemlogo ? (
            <img src={systemSettings.systemlogo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <Building size={28} color="var(--secondary-blue)" />
          )}
          <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
            {systemSettings?.systemname || 'E-OSIS'}
          </span>
        </div>

        {/* Desktop Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          <a href="#fitur" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--secondary-blue)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>Fitur</a>
          <a href="#kandidat" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--secondary-blue)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>Kandidat</a>
          <a href="#faq" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--secondary-blue)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>Bantuan</a>
          
          <button onClick={toggleTheme} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)'
          }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--card-border)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isLoggedIn ? (
            <button onClick={handleCTA} style={{
              backgroundColor: 'var(--secondary-blue)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              transition: 'var(--transition)'
            }} onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.3)';
            }} onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
            }}>
              <UserIcon size={16} /> Ke Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/login')} style={{
              backgroundColor: 'var(--primary-navy)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
              transition: 'var(--transition)'
            }} onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = 'var(--secondary-blue)';
            }} onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.backgroundColor = 'var(--primary-navy)';
            }}>
              <Lock size={16} /> Masuk Sistem
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div style={{ display: 'none' }} className="mobile-nav-btn">
          <button onClick={toggleTheme} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '8px',
            borderRadius: '50%'
          }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dark)',
            cursor: 'pointer',
            padding: '4px'
          }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '73px',
          left: 0,
          right: 0,
          backgroundColor: 'var(--card-bg)',
          borderBottom: '1px solid var(--card-border)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 999,
          boxShadow: 'var(--card-shadow)',
          animation: 'slideUp 0.3s ease'
        }}>
          <a href="#fitur" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 500 }}>Fitur Utama</a>
          <a href="#kandidat" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 500 }}>Kandidat Ketua</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 500 }}>Bantuan & FAQ</a>
          <hr style={{ border: '0', borderTop: '1px solid var(--card-border)', margin: '8px 0' }} />
          {isLoggedIn ? (
            <button onClick={() => { setMobileMenuOpen(false); handleCTA(); }} style={{
              backgroundColor: 'var(--secondary-blue)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: 600,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <UserIcon size={16} /> Ke Dashboard ({userName})
            </button>
          ) : (
            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} style={{
              backgroundColor: 'var(--primary-navy)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: 600,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Lock size={16} /> Masuk Sistem
            </button>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 100px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(56, 189, 248, 0.05) 50%, rgba(255,255,255,0) 100%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: theme === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(59, 130, 246, 0.15)',
          color: 'var(--secondary-blue)',
          padding: '8px 16px',
          borderRadius: '100px',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '24px',
          letterSpacing: '0.5px',
          border: '1px solid rgba(37, 99, 235, 0.15)'
        }}>
          <Award size={14} /> KEPENGURUSAN OSIS ERA DIGITAL
        </div>

        {/* Big Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 850,
          lineHeight: 1.1,
          color: 'var(--text-dark)',
          maxWidth: '900px',
          margin: '0 0 24px',
          letterSpacing: '-2px'
        }}>
          Transformasi Digital Manajemen & E-Voting <span style={{
            background: 'linear-gradient(135deg, var(--secondary-blue) 0%, var(--accent-sky) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>{systemSettings?.systemname || 'OSIS Sekolah'}</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 19px)',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          lineHeight: 1.6,
          margin: '0 0 40px',
          fontWeight: 400
        }}>
          Platform integrasi cerdas untuk menyelenggarakan pemilihan umum ketua OSIS (E-Voting), manajemen program kerja yang transparan, keuangan kas OSIS real-time, dan evaluasi kinerja pengurus.
        </p>

        {/* Call to action buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '60px'
        }}>
          <button onClick={handleCTA} style={{
            backgroundColor: 'var(--secondary-blue)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '16px 32px',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
            transition: 'var(--transition)'
          }} onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.35)';
          }} onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.25)';
          }}>
            {isLoggedIn ? 'Masuk ke Aplikasi' : 'Mulai Sekarang'} <ArrowRight size={18} />
          </button>

          <a href="#fitur" style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-dark)',
            border: '1px solid var(--card-border)',
            borderRadius: '14px',
            padding: '16px 32px',
            fontWeight: 600,
            fontSize: '16px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: 'var(--card-shadow)',
            transition: 'var(--transition)'
          }} onMouseOver={e => {
            e.currentTarget.style.backgroundColor = 'var(--bg-soft-white)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
            e.currentTarget.style.transform = 'none';
          }}>
            Pelajari Fitur
          </a>
        </div>

        {/* Dashboard Preview / Mock-up */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          borderRadius: '24px',
          border: '1px solid var(--card-border)',
          padding: '12px',
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden',
          transition: 'var(--transition)'
        }} className="hero-preview-container">
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--card-border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header bar mock */}
            <div style={{
              height: '48px',
              backgroundColor: 'var(--bg-soft-white)',
              borderBottom: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px'
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--card-bg)',
                padding: '4px 32px',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                letterSpacing: '0.5px'
              }}>
                {window.location.origin}/dashboard
              </div>
              <div style={{ width: '48px' }} />
            </div>

            {/* Dashboard content mock */}
            <div style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              textAlign: 'left',
              backgroundColor: 'var(--bg-color)'
            }}>
              {/* Stat Card 1 */}
              <div className="theme-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PERSENTASE VOTING</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800 }}>94.2%</span>
                  <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>+4.2%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--card-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '94%', height: '100%', backgroundColor: 'var(--secondary-blue)' }} />
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="theme-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PROGRAM KERJA</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800 }}>18 Proker</span>
                  <span style={{ fontSize: '12px', color: 'var(--secondary-blue)', fontWeight: 600 }}>Aktif</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>14 Selesai</span>
                  <span>•</span>
                  <span>4 Berjalan</span>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="theme-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>SALDO KAS OSIS</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800 }}>Rp 4.8M</span>
                  <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>100% Transparan</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Uang Masuk Terdata Otomatis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info / Quick Stats */}
      <section style={{
        backgroundColor: 'var(--bg-soft-white)',
        padding: '60px 24px',
        borderTop: '1px solid var(--card-border)',
        borderBottom: '1px solid var(--card-border)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '40px', fontWeight: 800, margin: '0 0 8px', color: 'var(--secondary-blue)' }}>98%</h3>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: '16px' }}>Partisipasi Pemilu</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Tingkat partisipasi e-voting siswa yang tinggi & tepercaya.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '40px', fontWeight: 800, margin: '0 0 8px', color: 'var(--secondary-blue)' }}>24/7</h3>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: '16px' }}>Transparansi Kas</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Keuangan kas dapat dipantau real-time oleh pengurus & sekolah.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '40px', fontWeight: 800, margin: '0 0 8px', color: 'var(--secondary-blue)' }}>100%</h3>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: '16px' }}>Aman & Rahasia</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Data voting terenkripsi untuk pemilu yang jujur & adil.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '40px', fontWeight: 800, margin: '0 0 8px', color: 'var(--secondary-blue)' }}>18+</h3>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: '16px' }}>Proker Terlaksana</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Program kerja terdokumentasi dengan evaluasi kinerja jelas.</p>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section id="fitur" style={{
        padding: '100px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>Fitur Portal & Keunggulan E-OSIS</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            E-OSIS dirancang khusus untuk memenuhi semua kebutuhan tata kelola organisasi siswa intra sekolah secara digital, transparan, dan modern.
          </p>
          
          {/* Tab buttons */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-soft-white)',
            padding: '6px',
            borderRadius: '14px',
            marginTop: '32px',
            gap: '4px'
          }}>
            <button 
              onClick={() => setActiveTab('fitur')} 
              style={{
                backgroundColor: activeTab === 'fitur' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'fitur' ? 'var(--text-dark)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: activeTab === 'fitur' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Fitur Utama
            </button>
            <button 
              onClick={() => setActiveTab('kandidat')} 
              style={{
                backgroundColor: activeTab === 'kandidat' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'kandidat' ? 'var(--text-dark)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: activeTab === 'kandidat' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Simulasi E-Voting
            </button>
            <button 
              onClick={() => setActiveTab('faq')} 
              style={{
                backgroundColor: activeTab === 'faq' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'faq' ? 'var(--text-dark)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: activeTab === 'faq' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Panduan Siswa
            </button>
          </div>
        </div>

        {/* Tab 1: Fitur Utama */}
        {activeTab === 'fitur' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            animation: 'slideUp 0.4s ease'
          }}>
            {/* Feature card 1 */}
            <div className="theme-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--secondary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckSquare size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>E-Voting Demokratis</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '14px' }}>
                Gunakan hak suara Anda dalam pemilihan ketua & wakil ketua OSIS secara langsung, rahasia, jujur, dan adil. Hasil suara langsung terhitung otomatis dan real-time.
              </p>
            </div>

            {/* Feature card 2 */}
            <div className="theme-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Briefcase size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Manajemen Program Kerja</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '14px' }}>
                Memudahkan pengurus mendokumentasikan, merencanakan, serta memantau progres pelaksanaan program kerja seksi bidang OSIS secara rapi dan akuntabel.
              </p>
            </div>

            {/* Feature card 3 */}
            <div className="theme-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Coins size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Transparansi Keuangan Kas</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '14px' }}>
                Catatan kas bulanan OSIS untuk setiap kelas dapat dilihat kapan saja. Mencegah manipulasi keuangan dan menanamkan nilai kejujuran organisasi sejak dini.
              </p>
            </div>

            {/* Feature card 4 */}
            <div className="theme-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Evaluasi Kinerja Pengurus</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '14px' }}>
                Penilaian berkala untuk setiap program kerja dan aktivitas anggota kepengurusan, mendorong kinerja organisasi yang lebih produktif dan dinamis.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Simulasi E-Voting */}
        {activeTab === 'kandidat' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '20px',
            padding: '40px 24px',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
            animation: 'slideUp 0.4s ease'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Bagaimana Cara Memberikan Suara?</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '600px', fontSize: '15px', lineHeight: 1.6 }}>
              E-OSIS menjamin proses pemungutan suara aman dan tidak dapat dicurangi dengan alur berikut:
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              width: '100%',
              maxWidth: '500px',
              textAlign: 'left',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', width: '28px', height: '28px', backgroundColor: 'var(--secondary-blue)', color: '#fff', borderRadius: '50%', justifyContent: 'center', alignItems: 'center', fontWeight: 700, flexShrink: 0 }}>1</span>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>Login dengan Akun Siswa</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Gunakan username dan password yang diberikan pihak sekolah.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', width: '28px', height: '28px', backgroundColor: 'var(--secondary-blue)', color: '#fff', borderRadius: '50%', justifyContent: 'center', alignItems: 'center', fontWeight: 700, flexShrink: 0 }}>2</span>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>Masuk Menu E-Voting</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Sistem mendeteksi otomatis jika masa pemilihan sedang aktif.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', width: '28px', height: '28px', backgroundColor: 'var(--secondary-blue)', color: '#fff', borderRadius: '50%', justifyContent: 'center', alignItems: 'center', fontWeight: 700, flexShrink: 0 }}>3</span>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>Pilih Pasangan Calon</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Lihat visi misi setiap kandidat, lalu klik tombol "Pilih" atau "Cast Vote".</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', width: '28px', height: '28px', backgroundColor: 'var(--secondary-blue)', color: '#fff', borderRadius: '50%', justifyContent: 'center', alignItems: 'center', fontWeight: 700, flexShrink: 0 }}>4</span>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>Verifikasi & Selesai</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Suara disimpan secara anonim. Anda tidak dapat memilih lagi untuk periode yang sama.</p>
                </div>
              </div>
            </div>

            <button onClick={handleCTA} style={{
              backgroundColor: 'var(--secondary-blue)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 28px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Masuk & Mulai Memilih <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Tab 3: Bantuan / FAQ */}
        {activeTab === 'faq' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            animation: 'slideUp 0.4s ease'
          }}>
            <div className="theme-card" style={{ padding: '24px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700 }}>Apakah kerahasiaan pilihan saya dijamin?</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Ya, 100%. Sistem kami merancang database pemilu secara terpisah antara log kehadiran pemilih dengan pilihan kandidat. Tidak ada admin maupun pengurus OSIS yang dapat melacak pilihan individu Anda.
              </p>
            </div>
            <div className="theme-card" style={{ padding: '24px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700 }}>Bagaimana jika saya lupa username atau kata sandi?</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Silakan hubungi Wali Kelas Anda atau tim Administrasi IT Sekolah yang bertugas mengelola data E-OSIS untuk mereset kata sandi Anda.
              </p>
            </div>
            <div className="theme-card" style={{ padding: '24px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700 }}>Bagaimana kas OSIS dicatat dalam sistem ini?</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Bendahara OSIS/Bendahara Kelas mencatat pembayaran kas bulanan masing-masing siswa melalui dashboard administrasi kas. Setelah dicatat, saldo kas keseluruhan dan status pembayaran masing-masing kelas langsung diperbarui dan dapat dipantau oleh seluruh siswa.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Candidates Section */}
      <section id="kandidat" style={{
        padding: '100px 24px',
        backgroundColor: 'var(--bg-soft-white)',
        borderTop: '1px solid var(--card-border)',
        borderBottom: '1px solid var(--card-border)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>Kandidat Ketua & Wakil Ketua OSIS</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Calon pemimpin hebat yang siap membawa perubahan positif bagi masa depan OSIS {systemSettings?.systemname || 'sekolah kita'}.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '40px',
            justifyContent: 'center'
          }}>
            {candidatesList.length > 0 ? (
              candidatesList.map((c) => {
                const yearLabel = dbActivePeriod ? dbActivePeriod.yearLabel : 'PERIODE AKTIF';
                return (
                  <div key={c.id} className="theme-card" style={{
                    backgroundColor: 'var(--card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px',
                    transition: 'var(--transition)'
                  }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                    {/* Image banner */}
                    <div style={{
                      height: '240px',
                      background: c.photo ? `url(${c.photo}) center/cover no-repeat` : 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '18px',
                      fontWeight: 700,
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(8px)',
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        NO. URUT {c.paslonNo}
                      </div>
                      
                      {!c.photo && (
                        <div style={{ display: 'flex', gap: '-12px' }}>
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', border: '3px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                            <UserIcon size={40} />
                          </div>
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', border: '3px solid #3B82F6', marginLeft: '-15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                            <UserIcon size={40} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{c.name || `${c.presidentName} & ${c.vicePresidentName}`}</h3>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-blue)', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>PERIODE {yearLabel}</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        <div><strong>Calon Ketua:</strong> {c.presidentName} ({c.presidentClass})</div>
                        <div><strong>Calon Wakil:</strong> {c.vicePresidentName} ({c.vicePresidentClass})</div>
                      </div>

                      <p style={{ color: 'var(--text-dark)', fontWeight: 600, margin: '0 0 8px', fontSize: '14px' }}>Visi:</p>
                      <p style={{ color: 'var(--text-muted)', margin: '0 0 20px', fontSize: '14px', lineHeight: 1.5 }}>
                        "{c.visi}"
                      </p>
                      
                      {c.misi && (
                        <>
                          <p style={{ color: 'var(--text-dark)', fontWeight: 600, margin: '0 0 8px', fontSize: '14px' }}>Misi:</p>
                          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                            {c.misi}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {/* Candidate 1 */}
                <div className="theme-card" style={{
                  backgroundColor: 'var(--card-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '20px',
                  transition: 'var(--transition)'
                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  {/* Image banner mock */}
                  <div style={{
                    height: '240px',
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 700,
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      NO. URUT 01
                    </div>
                    {/* Simulated Avatar icons instead of local missing images */}
                    <div style={{ display: 'flex', gap: '-12px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', border: '3px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                        <UserIcon size={40} />
                      </div>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', border: '3px solid #3B82F6', marginLeft: '-15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                        <UserIcon size={40} />
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Farel Prasetya & Amelia Putri</h3>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-blue)', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>PERIODE 2026/2027</span>
                    <p style={{ color: 'var(--text-dark)', fontWeight: 600, margin: '0 0 8px', fontSize: '14px' }}>Visi:</p>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 20px', fontSize: '14px', lineHeight: 1.5 }}>
                      "Membentuk karakter siswa {systemSettings?.systemname || 'sekolah'} yang mandiri, kreatif, dan kolaboratif melalui implementasi program kerja berbasis digitalisasi dan kepedulian sosial."
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--secondary-blue)' }} />
                        <span>Penyediaan mading sekolah digital terintegrasi.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--secondary-blue)' }} />
                        <span>Pekan Olahraga dan Seni (Porseni) antar-kelas interaktif.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate 2 */}
                <div className="theme-card" style={{
                  backgroundColor: 'var(--card-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '20px',
                  transition: 'var(--transition)'
                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  {/* Image banner mock */}
                  <div style={{
                    height: '240px',
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 700,
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      NO. URUT 02
                    </div>
                    <div style={{ display: 'flex', gap: '-12px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', border: '3px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                        <UserIcon size={40} />
                      </div>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', border: '3px solid #1E293B', marginLeft: '-15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                        <UserIcon size={40} />
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Bagas Aditya & Larasati Dwi</h3>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-blue)', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>PERIODE 2026/2027</span>
                    <p style={{ color: 'var(--text-dark)', fontWeight: 600, margin: '0 0 8px', fontSize: '14px' }}>Visi:</p>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 20px', fontSize: '14px', lineHeight: 1.5 }}>
                      "Mewujudkan kepengurusan OSIS yang berintegritas tinggi, transparan dalam finansial, dan aktif merangkul semua komunitas bakat & minat siswa di sekolah."
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--secondary-blue)' }} />
                        <span>Laporan kas & keuangan berkala yang dipajang digital.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--secondary-blue)' }} />
                        <span>Wadah minat bakat (Science, Art, E-Sports League).</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '900px',
          width: '100%',
          background: 'var(--banner-bg)',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background circle decoration */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.08)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.08)',
            pointerEvents: 'none'
          }} />

          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px', color: '#ffffff' }}>
            Siap Berkontribusi dalam OSIS Digital?
          </h2>
          <p style={{ color: 'rgba(248, 250, 252, 0.8)', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6, fontSize: '15px' }}>
            Masukkan hak pilih Anda sekarang, pantau program kerja kepengurusan aktif, dan bantu mewujudkan organisasi yang bersih dan berintegritas.
          </p>
          
          <button onClick={handleCTA} style={{
            backgroundColor: '#ffffff',
            color: '#0F172A',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            transition: 'var(--transition)'
          }} onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = 'var(--bg-soft-white)';
          }} onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}>
            {isLoggedIn ? 'Buka Portal E-OSIS' : 'Masuk Akun'} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="faq" style={{
        backgroundColor: theme === 'light' ? '#0F172A' : '#0a0f1d',
        color: '#94A3B8',
        padding: '60px 24px 30px',
        borderTop: '1px solid var(--card-border)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Column 1: App Info */}
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} color="#3B82F6" /> {systemSettings?.systemname || 'E-OSIS'}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Portal terintegrasi kepengurusan OSIS digital, menyediakan e-voting aman, pencatatan kas transparan, dan administrasi program kerja modern.
            </p>
          </div>

          {/* Column 2: Link navigasi */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Menu Cepat</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <a href="#fitur" style={{ color: '#94A3B8', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>Fitur Utama</a>
              <a href="#kandidat" style={{ color: '#94A3B8', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>Kandidat Paslon</a>
              <a href="#faq" style={{ color: '#94A3B8', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>Bantuan Pengguna</a>
            </div>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Hubungi Kami</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', lineHeight: 1.5 }}>
              {systemSettings?.systemaddress && (
                <p style={{ margin: 0 }}>📍 {systemSettings.systemaddress}</p>
              )}
              {systemSettings?.systemcontact && (
                <p style={{ margin: 0 }}>📞 {systemSettings.systemcontact}</p>
              )}
              {!systemSettings?.systemaddress && !systemSettings?.systemcontact && (
                <p style={{ margin: 0 }}>Silakan hubungi administrator IT sekolah untuk informasi operasional E-OSIS.</p>
              )}
            </div>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid #1E293B', margin: '0 0 30px' }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '13px'
        }}>
          <p style={{ margin: 0 }}>
            © 2026 {systemSettings?.systemname || 'E-OSIS'}. All rights reserved.
          </p>
          <p style={{ margin: 0 }}>
            Made for School Digitalization with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  User as UserIcon, 
  Mail, 
  LogOut, 
  ShieldAlert, 
  GraduationCap, 
  Building, 
  Briefcase, 
  Award,
  BookOpen,
  Sun,
  Moon,
  Calendar,
  Settings,
  Database,
  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Users,
  Grid,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Search
} from 'lucide-react';
import { authApi } from './api';
import type { SystemResponse } from './api';
import './App.css';

// Helper to dynamically update browser favicon
const updateFavicon = (url: string) => {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = url;
};

// Initialize theme from localStorage immediately to avoid visual flashing
const initialTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', initialTheme);

// Protected Layout / Route
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Home Component (Dashboard)
const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<SystemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation for Admin
  const location = useLocation();
  const getActiveMenuFromPath = (path: string) => {
    if (path === '/') return 'vote';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/candidates' || path === '/kandidat') return 'kandidat';
    if (path === '/manage-class') return 'manage-class';
    if (path === '/manage-grade') return 'manage-grade';
    if (path === '/manage-major') return 'manage-major';
    if (path === '/manage-period') return 'manage-period';
    if (path === '/manage-user') return 'manage-user';
    if (path === '/system-setting') return 'system-setting';
    if (path === '/backup-db') return 'backup-db';
    if (path === '/profile') return 'profile';
    if (path === '/kas-osis') return 'kas-osis';
    if (path === '/proker' || path === '/program-kerja') return 'proker';
    return 'dashboard';
  };
  const activeMenu = getActiveMenuFromPath(location.pathname);
  const [isManageDataOpen, setIsManageDataOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_manage_data_open');
    return saved !== null ? saved === 'true' : true;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_settings_open');
    return saved !== null ? saved === 'true' : true;
  });
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_account_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleManageData = () => {
    const nextVal = !isManageDataOpen;
    setIsManageDataOpen(nextVal);
    localStorage.setItem('sidebar_manage_data_open', String(nextVal));
  };

  const toggleSettings = () => {
    const nextVal = !isSettingsOpen;
    setIsSettingsOpen(nextVal);
    localStorage.setItem('sidebar_settings_open', String(nextVal));
  };

  const toggleAccount = () => {
    const nextVal = !isAccountOpen;
    setIsAccountOpen(nextVal);
    localStorage.setItem('sidebar_account_open', String(nextVal));
  };

  // Edit Profile Form State
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [editProfileError, setEditProfileError] = useState('');
  const [editProfileSuccess, setEditProfileSuccess] = useState('');

  // Modal Control State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [resetPasswordNewVal, setResetPasswordNewVal] = useState('');

  // Dynamic Candidates State
  const [candidates, setCandidates] = useState<any[]>(() => {
    const saved = localStorage.getItem('osis_candidates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'c1',
        paslonNo: '01',
        name: 'Rian & Siska',
        classes: 'XII RPL 1 & XI BDP 2',
        votes: 102,
        percent: '54%',
        visi: 'Mewujudkan OSIS yang kreatif, inklusif, dan berteknologi tinggi.',
        misi: 'Mengadakan event teknologi tahunan, membuat wadah aspirasi digital.',
        photo: 'https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=150',
        periodId: 'p3'
      },
      {
        id: 'c2',
        paslonNo: '02',
        name: 'Diana & Fajar',
        classes: 'XII AKL 2 & XI RPL 1',
        votes: 87,
        percent: '46%',
        visi: 'Menciptakan lingkungan sekolah ramah lingkungan dan kolaboratif.',
        misi: 'Mengurangi sampah plastik di kantin, menyelenggarakan diskusi antarkelas.',
        photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        periodId: 'p3'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('osis_candidates', JSON.stringify(candidates));
  }, [candidates]);

  // Candidate Search & Filter State
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidatePeriodFilter, setCandidatePeriodFilter] = useState('');

  // Add Candidate Form State
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateClasses, setNewCandidateClasses] = useState('');
  const [newCandidatePaslonNo, setNewCandidatePaslonNo] = useState('');
  const [newCandidateVisi, setNewCandidateVisi] = useState('');
  const [newCandidateMisi, setNewCandidateMisi] = useState('');
  const [newCandidatePhoto, setNewCandidatePhoto] = useState('');
  const [newCandidatePeriodId, setNewCandidatePeriodId] = useState('');
  const [selectedPresidentId, setSelectedPresidentId] = useState('');
  const [selectedVicePresidentId, setSelectedVicePresidentId] = useState('');

  // Kas OSIS Monthly Class Claims State
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [monthlyClaims, setMonthlyClaims] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem('osis_monthly_kas_claims');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('osis_monthly_kas_claims', JSON.stringify(monthlyClaims));
  }, [monthlyClaims]);

  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // Dynamic Kas Expenses State
  const [expenses, setExpenses] = useState<any[]>(() => {
    const saved = localStorage.getItem('osis_kas_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 'exp_1', description: 'Beli ATK & Kertas Print', amount: 45000, date: '2026-07-15' },
      { id: 'exp_2', description: 'Konsumsi Rapat OSIS', amount: 75000, date: '2026-07-20' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('osis_kas_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Add Expense Form State
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Dynamic Proker State
  const [prokers, setProkers] = useState<any[]>(() => {
    const saved = localStorage.getItem('osis_prokers');
    return saved ? JSON.parse(saved) : [
      { id: 'pro_1', name: 'LDKS (Latihan Dasar Kepemimpinan Siswa)', description: 'Pelatihan dasar kepemimpinan untuk melatih mental dan disiplin calon pengurus OSIS baru.', targetDate: 'September 2026', status: 'Rencana', periodId: 'p3' },
      { id: 'pro_2', name: 'Pentas Seni & Bazar Sekolah', description: 'Acara pameran kreatif seni dan bazar kewirausahaan siswa antar kelas.', targetDate: 'Desember 2026', status: 'Rencana', periodId: 'p3' },
      { id: 'pro_3', name: 'Class Meeting Olahraga', description: 'Turnamen olahraga sepak bola, basket, dan e-sports antar kelas setelah ujian semester.', targetDate: 'Juni 2026', status: 'Selesai', periodId: 'p3' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('osis_prokers', JSON.stringify(prokers));
  }, [prokers]);

  // Lists state for admin panel
  const [classes, setClasses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>(() => {
    const saved = localStorage.getItem('osis_periods');
    if (saved) return JSON.parse(saved);
    const defaultPeriods = [
      { id: 'p1', yearLabel: '2024/2025', status: 'ARCHIVED', voteStartDate: '', voteEndDate: '' },
      { id: 'p2', yearLabel: '2025/2026', status: 'INACTIVE', voteStartDate: '', voteEndDate: '' },
      { id: 'p3', yearLabel: '2026/2027', status: 'ACTIVE', voteStartDate: '2026-07-25T08:00', voteEndDate: '2026-07-26T17:00' },
    ];
    localStorage.setItem('osis_periods', JSON.stringify(defaultPeriods));
    return defaultPeriods;
  });
  const [users, setUsers] = useState<any[]>([]);

  // Elected OSIS Pairs state (periodId -> candidateId)
  const electedPairs = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    periods.forEach(p => {
      if (p.electedCandidateId) {
        map[p.id] = p.electedCandidateId;
      }
    });
    return map;
  }, [periods]);

  // Add/Edit Proker Form States
  const [prokerName, setProkerName] = useState('');
  const [prokerDesc, setProkerDesc] = useState('');
  const [prokerTargetDate, setProkerTargetDate] = useState('');
  const [prokerStatus, setProkerStatus] = useState('Rencana');

  // Add User Form State
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserLevel, setNewUserLevel] = useState('student');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserClassId, setNewUserClassId] = useState('');

  // User OSIS votes (userId -> candidateId)
  const [userVotes, setUserVotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('osis_user_votes');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('osis_user_votes', JSON.stringify(userVotes));
  }, [userVotes]);

  // Add Period Form State
  const [newPeriodYear, setNewPeriodYear] = useState('');
  const [newPeriodStatus, setNewPeriodStatus] = useState('INACTIVE');
  const [newPeriodVoteStart, setNewPeriodVoteStart] = useState('');
  const [newPeriodVoteEnd, setNewPeriodVoteEnd] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Custom vote confirmation modal state
  const [voteConfirmModal, setVoteConfirmModal] = useState<{ candidateId: string; periodId: string; candidateName: string } | null>(null);

  // Voter dropdown menu state
  const [voterDropdownOpen, setVoterDropdownOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Find all student user IDs who are already candidates in the selected period (excluding current editing item if editing)
  const existingCandidateUserIds = useMemo(() => {
    if (!newCandidatePeriodId) return new Set<string>();
    const set = new Set<string>();
    candidates.forEach(c => {
      if (editingItem && c.id === editingItem.id) {
        return;
      }
      if (c.periodId === newCandidatePeriodId) {
        if (c.presidentId && c.presidentId !== '-') set.add(c.presidentId);
        if (c.vicePresidentId && c.vicePresidentId !== '-') set.add(c.vicePresidentId);
      }
    });
    return set;
  }, [candidates, newCandidatePeriodId, editingItem]);

  // Auto-generate candidate name and classes based on selected president/vice president
  useEffect(() => {
    const studentUsers = users.filter(u => u.level === 'student');
    const pres = studentUsers.find(u => u.id === selectedPresidentId);
    const vice = studentUsers.find(u => u.id === selectedVicePresidentId);
    
    if (pres && vice) {
      setNewCandidateName(`${pres.username} & ${vice.username}`);
      const presClass = pres.classname !== '-' ? pres.classname : '';
      const viceClass = vice.classname !== '-' ? vice.classname : '';
      if (presClass && viceClass) {
        setNewCandidateClasses(`${presClass} & ${viceClass}`);
      } else {
        setNewCandidateClasses(presClass || viceClass || '-');
      }
    } else if (pres) {
      setNewCandidateName(pres.username);
      setNewCandidateClasses(pres.classname || '-');
    } else {
      setNewCandidateName('');
      setNewCandidateClasses('');
    }
  }, [selectedPresidentId, selectedVicePresidentId, users]);
  
  // Forms state
  const [newClassname, setNewClassname] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState('');
  const [newGradename, setNewGradename] = useState('');
  const [newMajorname, setNewMajorname] = useState('');
  const [newMajorcode, setNewMajorcode] = useState('');
  
  // System Setting Form State
  const [sysName, setSysName] = useState('');
  const [sysLogo, setSysLogo] = useState('');
  const [sysFavicon, setSysFavicon] = useState('');
  const [sysAddress, setSysAddress] = useState('');
  const [sysContact, setSysContact] = useState('');
  
  // Backup State
  const [backupLogs, setBackupLogs] = useState<string[]>([]);
  const [backupProgress, setBackupProgress] = useState<number | null>(null);

  // Theme Toggler
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const [profile, system] = await Promise.all([
          authApi.getProfile(),
          authApi.getSystemSettings()
        ]);
        setUserData(profile);
        setSystemSettings(system);
        loadPeriodsData();
        loadCandidatesData();
        loadVotesData();
        loadProkersData();
        loadKasClaimsData();
        loadKasExpensesData();

        // Update Title and Favicon dynamically
        document.title = `Dashboard - ${system.systemname}`;
        if (system.systemfavicon) {
          updateFavicon(system.systemfavicon);
        }
      } catch (err: any) {
        console.error(err);
        setError('Gagal mengambil data profil atau session telah berakhir.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  // Redirect based on user level and role
  useEffect(() => {
    if (!userData) return;
    const isTeacher = userData.level === 'school' && userData.role === 'teacher';
    const isStudentNoRole = userData.level === 'student' && (!userData.role || userData.role === '-' || userData.role === 'members' || userData.role === 'student');
    
    if (location.pathname === '/') {
      if (!isTeacher && !isStudentNoRole) {
        navigate('/dashboard', { replace: true });
      }
    } else if (location.pathname === '/dashboard') {
      if (isTeacher || isStudentNoRole) {
        navigate('/', { replace: true });
      }
    }
  }, [userData, location.pathname, navigate]);

  // Load Data depending on view
  useEffect(() => {
    if (!userData) return;
    if (userData.role === 'superadmin') {
      if (activeMenu === 'manage-class') {
        loadClassesData();
        loadGradesData();
        loadMajorsData();
      }
      if (activeMenu === 'manage-grade') loadGradesData();
      if (activeMenu === 'manage-major') loadMajorsData();
      if (activeMenu === 'manage-period' || activeMenu === 'kandidat') {
        loadPeriodsData();
        loadCandidatesData();
      }
      if (activeMenu === 'manage-user' || activeMenu === 'kandidat' || activeMenu === 'kas-osis') {
        loadUsersData();
        loadCandidatesData();
      }
      if (activeMenu === 'manage-user' || activeMenu === 'kas-osis') {
        loadClassesData();
      }
      if (activeMenu === 'system-setting' && systemSettings) {
        setSysName(systemSettings.systemname || '');
        setSysLogo(systemSettings.systemlogo || '');
        setSysFavicon(systemSettings.systemfavicon || '');
        setSysAddress(systemSettings.systemaddress || '');
        setSysContact(systemSettings.systemcontact || '');
      }
    }

    // Loaded for all roles
    if (activeMenu === 'proker') {
      loadProkersData();
      loadPeriodsData();
      loadCandidatesData();
    }
    if (activeMenu === 'kas-osis') {
      loadKasClaimsData();
      loadKasExpensesData();
      loadClassesData();
    }
    if (activeMenu === 'vote') {
      loadPeriodsData();
      loadCandidatesData();
      loadVotesData();
    }
  }, [activeMenu, userData]);

  const loadClassesData = async () => {
    try {
      const data = await authApi.getClasses();
      setClasses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadGradesData = async () => {
    try {
      const data = await authApi.getGrades();
      setGrades(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMajorsData = async () => {
    try {
      const data = await authApi.getMajors();
      setMajors(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPeriodsData = async () => {
    try {
      const data = await authApi.getPeriods();
      setPeriods(data);
      localStorage.setItem('osis_periods', JSON.stringify(data));
    } catch (e) {
      console.error(e);
      const savedPeriods = localStorage.getItem('osis_periods');
      if (savedPeriods) {
        setPeriods(JSON.parse(savedPeriods));
      }
    }
  };

  const loadUsersData = async () => {
    try {
      const data = await authApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCandidatesData = async () => {
    try {
      const data = await authApi.getCandidates();
      setCandidates(data);
      localStorage.setItem('osis_candidates', JSON.stringify(data));
    } catch (e) {
      console.error(e);
      const savedCandidates = localStorage.getItem('osis_candidates');
      if (savedCandidates) {
        setCandidates(JSON.parse(savedCandidates));
      }
    }
  };

  const loadVotesData = async () => {
    try {
      const data = await authApi.getVotes();
      const votesMap: Record<string, string> = {};
      data.forEach(v => {
        votesMap[`${v.userId}_${v.periodId}`] = v.candidateId;
      });
      setUserVotes(votesMap);
      localStorage.setItem('osis_user_votes', JSON.stringify(votesMap));
    } catch (e) {
      console.error(e);
      const savedVotes = localStorage.getItem('osis_user_votes');
      if (savedVotes) {
        setUserVotes(JSON.parse(savedVotes));
      }
    }
  };

  const loadProkersData = async () => {
    try {
      const data = await authApi.getProkers();
      setProkers(data);
      localStorage.setItem('osis_prokers', JSON.stringify(data));
    } catch (e) {
      console.error(e);
      const savedProkers = localStorage.getItem('osis_prokers');
      if (savedProkers) {
        setProkers(JSON.parse(savedProkers));
      }
    }
  };

  const loadKasClaimsData = async () => {
    try {
      const data = await authApi.getKasClaims();
      const map: Record<string, Record<string, boolean>> = {};
      data.forEach(c => {
        if (!map[c.monthKey]) map[c.monthKey] = {};
        map[c.monthKey][c.classId] = c.claimed;
      });
      setMonthlyClaims(map);
      localStorage.setItem('osis_monthly_kas_claims', JSON.stringify(map));
    } catch (e) {
      console.error(e);
      const saved = localStorage.getItem('osis_monthly_kas_claims');
      if (saved) {
        setMonthlyClaims(JSON.parse(saved));
      }
    }
  };

  const loadKasExpensesData = async () => {
    try {
      const data = await authApi.getKasExpenses();
      setExpenses(data);
      localStorage.setItem('osis_kas_expenses', JSON.stringify(data));
    } catch (e) {
      console.error(e);
      const saved = localStorage.getItem('osis_kas_expenses');
      if (saved) {
        setExpenses(JSON.parse(saved));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileError('');
    setEditProfileSuccess('');

    if (!editEmail.trim()) {
      setEditProfileError('Email tidak boleh kosong.');
      return;
    }

    if (editPassword) {
      if (editPassword !== editConfirmPassword) {
        setEditProfileError('Konfirmasi password tidak cocok.');
        return;
      }
      if (editPassword.length < 6) {
        setEditProfileError('Password minimal 6 karakter.');
        return;
      }
    }

    try {
      await authApi.updateProfile({
        email: editEmail,
        password: editPassword || undefined,
      });

      // Update local state
      setUserData((prev: any) => ({
        ...prev,
        email: editEmail,
      }));

      setEditPassword('');
      setEditConfirmPassword('');
      setEditProfileSuccess('Profil Anda berhasil diperbarui.');
      showToast('Profil Anda berhasil diperbarui.');
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || 'Gagal memperbarui profil.';
      setEditProfileError(Array.isArray(message) ? message[0] : message);
    }
  };

  // Actions for Classes
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassname.trim() || !selectedGradeId || !selectedMajorId) return;
    try {
      await authApi.createClass({
        classname: newClassname,
        gradeid: selectedGradeId,
        majorid: selectedMajorId,
      });
      setNewClassname('');
      loadClassesData();
      showToast('Kelas berhasil ditambahkan!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kelas ini?')) return;
    try {
      await authApi.deleteClass(id);
      loadClassesData();
      showToast('Kelas berhasil dihapus!');
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Grades
  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradename.trim()) return;
    try {
      await authApi.createGrade({ gradename: newGradename });
      setNewGradename('');
      loadGradesData();
      showToast('Tingkatan kelas (Grade) berhasil ditambahkan!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus grade ini?')) return;
    try {
      await authApi.deleteGrade(id);
      loadGradesData();
      showToast('Tingkatan kelas (Grade) berhasil dihapus!');
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Majors
  const handleAddMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMajorname.trim() || !newMajorcode.trim()) return;
    try {
      await authApi.createMajor({
        majorname: newMajorname,
        majorcode: newMajorcode,
      });
      setNewMajorname('');
      setNewMajorcode('');
      loadMajorsData();
      showToast('Jurusan berhasil ditambahkan!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMajor = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus jurusan ini?')) return;
    try {
      await authApi.deleteMajor(id);
      loadMajorsData();
      showToast('Jurusan berhasil dihapus!');
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Users
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserUsername.trim() || !newUserPassword.trim() || !newUserEmail.trim()) {
      alert('Harap isi Username, Password, dan Email.');
      return;
    }
    try {
      await authApi.createUser({
        username: newUserUsername,
        password: newUserPassword,
        level: newUserLevel,
        email: newUserEmail,
        role: newUserRole || undefined,
        classid: newUserLevel === 'student' ? newUserClassId || undefined : undefined,
      });
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserLevel('student');
      setNewUserEmail('');
      setNewUserRole('');
      setNewUserClassId('');
      setActiveModal(null);
      loadUsersData();
      showToast('User baru berhasil ditambahkan!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal membuat user baru.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === userData?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await authApi.deleteUser(id);
      loadUsersData();
      showToast('User berhasil dihapus!');
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus user.');
    }
  };

  // Actions for Periods
  const handleAddPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodYear.trim()) return;
    try {
      await authApi.createPeriod({
        yearLabel: newPeriodYear,
        status: newPeriodStatus,
        voteStartDate: newPeriodVoteStart,
        voteEndDate: newPeriodVoteEnd
      });
      setNewPeriodYear('');
      setNewPeriodStatus('INACTIVE');
      setNewPeriodVoteStart('');
      setNewPeriodVoteEnd('');
      setActiveModal(null);
      loadPeriodsData();
      showToast('Periode pemilihan OSIS berhasil ditambahkan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan periode');
    }
  };

  // Edit Submissions
  const handleEditClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassname.trim() || !selectedGradeId || !selectedMajorId || !editingItem) return;
    try {
      await authApi.updateClass(editingItem.id, {
        classname: newClassname,
        gradeid: selectedGradeId,
        majorid: selectedMajorId,
      });
      setNewClassname('');
      setSelectedGradeId('');
      setSelectedMajorId('');
      setEditingItem(null);
      setActiveModal(null);
      loadClassesData();
      showToast('Kelas berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit kelas');
    }
  };

  const handleEditGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradename.trim() || !editingItem) return;
    try {
      await authApi.updateGrade(editingItem.id, { gradename: newGradename });
      setNewGradename('');
      setEditingItem(null);
      setActiveModal(null);
      loadGradesData();
      showToast('Tingkatan kelas (Grade) berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit grade');
    }
  };

  const handleEditMajorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMajorname.trim() || !newMajorcode.trim() || !editingItem) return;
    try {
      await authApi.updateMajor(editingItem.id, {
        majorname: newMajorname,
        majorcode: newMajorcode,
      });
      setNewMajorname('');
      setNewMajorcode('');
      setEditingItem(null);
      setActiveModal(null);
      loadMajorsData();
      showToast('Jurusan berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit jurusan');
    }
  };

  const handleEditPeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodYear.trim() || !editingItem) return;
    try {
      await authApi.updatePeriod(editingItem.id, {
        yearLabel: newPeriodYear,
        status: newPeriodStatus,
        voteStartDate: newPeriodVoteStart,
        voteEndDate: newPeriodVoteEnd
      });
      setNewPeriodYear('');
      setNewPeriodStatus('INACTIVE');
      setNewPeriodVoteStart('');
      setNewPeriodVoteEnd('');
      setEditingItem(null);
      setActiveModal(null);
      loadPeriodsData();
      showToast('Periode pemilihan OSIS berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit periode');
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserUsername.trim() || !newUserEmail.trim() || !editingItem) return;
    try {
      await authApi.updateUser(editingItem.id, {
        username: newUserUsername,
        password: newUserPassword || undefined,
        email: newUserEmail,
        role: newUserRole || undefined,
        classid: newUserLevel === 'student' ? newUserClassId || undefined : undefined,
      });
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserLevel('student');
      setNewUserEmail('');
      setNewUserRole('');
      setNewUserClassId('');
      setEditingItem(null);
      setActiveModal(null);
      loadUsersData();
      showToast('User berhasil diperbarui!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengedit user');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordNewVal.trim() || !editingItem) return;
    try {
      await authApi.resetUserPassword(editingItem.id, { password: resetPasswordNewVal });
      setResetPasswordNewVal('');
      setEditingItem(null);
      setActiveModal(null);
      showToast(`Password untuk "${editingItem.username}" berhasil direset.`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mereset password.');
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateName.trim() || !newCandidatePaslonNo.trim() || !newCandidatePeriodId) {
      alert('Harap isi Nama Paslon, No. Paslon, dan Periode.');
      return;
    }
    const defaultPhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    
    const presUser = users.find(u => u.id === selectedPresidentId);
    const vpUser = users.find(u => u.id === selectedVicePresidentId);

    try {
      await authApi.createCandidate({
        paslonNo: newCandidatePaslonNo,
        name: newCandidateName,
        presidentId: selectedPresidentId || '-',
        vicePresidentId: selectedVicePresidentId || '-',
        presidentName: presUser ? presUser.username : '',
        vicePresidentName: vpUser ? vpUser.username : '',
        presidentClass: presUser ? (presUser.classname || '-') : '-',
        vicePresidentClass: vpUser ? (vpUser.classname || '-') : '-',
        classes: newCandidateClasses || '-',
        visi: newCandidateVisi || '-',
        misi: newCandidateMisi || '-',
        photo: newCandidatePhoto.trim() || defaultPhoto,
        periodId: newCandidatePeriodId
      });

      setNewCandidateName('');
      setNewCandidateClasses('');
      setNewCandidatePaslonNo('');
      setNewCandidateVisi('');
      setNewCandidateMisi('');
      setNewCandidatePhoto('');
      setNewCandidatePeriodId('');
      setSelectedPresidentId('');
      setSelectedVicePresidentId('');
      setActiveModal(null);
      loadCandidatesData();
      showToast('Kandidat baru berhasil ditambahkan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan kandidat');
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kandidat ini?')) return;
    try {
      await authApi.deleteCandidate(id);
      loadCandidatesData();
      showToast('Kandidat berhasil dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus kandidat');
    }
  };

  const handleStartEditCandidate = (c: any) => {
    setEditingItem(c);
    setNewCandidatePaslonNo(c.paslonNo || '');
    setSelectedPresidentId(c.presidentId || '');
    setSelectedVicePresidentId(c.vicePresidentId || '');
    setNewCandidateClasses(c.classes || '');
    setNewCandidateVisi(c.visi || '');
    setNewCandidateMisi(c.misi || '');
    setNewCandidatePhoto(c.photo || '');
    setNewCandidatePeriodId(c.periodId || '');
    setActiveModal('edit-candidate');
  };

  const handleEditCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPresidentId || !selectedVicePresidentId || !newCandidatePeriodId) {
      alert('Presiden, Wakil Presiden, dan Periode wajib dipilih.');
      return;
    }
    const presUser = users.find(u => u.id === selectedPresidentId);
    const vpUser = users.find(u => u.id === selectedVicePresidentId);
    
    try {
      await authApi.updateCandidate(editingItem.id, {
        paslonNo: newCandidatePaslonNo,
        name: `${presUser?.username} & ${vpUser?.username}`,
        presidentId: selectedPresidentId,
        vicePresidentId: selectedVicePresidentId,
        presidentName: presUser ? presUser.username : '',
        vicePresidentName: vpUser ? vpUser.username : '',
        presidentClass: presUser ? (presUser.classname || '-') : '-',
        vicePresidentClass: vpUser ? (vpUser.classname || '-') : '-',
        classes: newCandidateClasses,
        visi: newCandidateVisi,
        misi: newCandidateMisi,
        photo: newCandidatePhoto,
        periodId: newCandidatePeriodId
      });

      setNewCandidateName('');
      setNewCandidateClasses('');
      setNewCandidatePaslonNo('');
      setNewCandidateVisi('');
      setNewCandidateMisi('');
      setNewCandidatePhoto('');
      setNewCandidatePeriodId('');
      setSelectedPresidentId('');
      setSelectedVicePresidentId('');
      setEditingItem(null);
      setActiveModal(null);
      loadCandidatesData();
      showToast('Kandidat berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit kandidat');
    }
  };

  const handleToggleClassKasClaim = async (classId: string, monthKey: string) => {
    try {
      await authApi.claimKas({ monthKey, classId, claimed: true });
      loadKasClaimsData();
      showToast('Status iuran kas kelas berhasil diperbarui!');
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui status kas kelas');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount || !expenseDate) {
      alert('Harap isi Keterangan, Jumlah, dan Tanggal.');
      return;
    }
    try {
      await authApi.createKasExpense({
        description: expenseDesc,
        amount: Number(expenseAmount),
        date: expenseDate
      });
      setExpenseDesc('');
      setExpenseAmount('');
      const today = new Date();
      setExpenseDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
      setActiveModal(null);
      loadKasExpensesData();
      showToast('Catatan pengeluaran kas OSIS berhasil ditambahkan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan catatan pengeluaran');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus catatan pengeluaran ini?')) return;
    try {
      await authApi.deleteKasExpense(id);
      loadKasExpensesData();
      showToast('Catatan pengeluaran kas OSIS berhasil dihapus!');
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus catatan pengeluaran');
    }
  };
  const handleAddProker = async (e: React.FormEvent, activePeriodId: string) => {
    e.preventDefault();
    if (!prokerName.trim() || !prokerTargetDate.trim()) {
      alert('Nama program dan Target pelaksanaan wajib diisi.');
      return;
    }
    try {
      await authApi.createProker({
        name: prokerName,
        description: prokerDesc,
        targetDate: prokerTargetDate,
        status: prokerStatus,
        periodId: activePeriodId
      });
      setProkerName('');
      setProkerDesc('');
      setProkerTargetDate('');
      setProkerStatus('Rencana');
      setActiveModal(null);
      loadProkersData();
      showToast('Program kerja OSIS berhasil ditambahkan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan program kerja');
    }
  };

  const handleEditProker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prokerName.trim() || !prokerTargetDate.trim() || !editingItem) {
      alert('Nama program dan Target pelaksanaan wajib diisi.');
      return;
    }
    try {
      await authApi.updateProker(editingItem.id, {
        name: prokerName,
        description: prokerDesc,
        targetDate: prokerTargetDate,
        status: prokerStatus,
        periodId: editingItem.periodId
      });
      setEditingItem(null);
      setProkerName('');
      setProkerDesc('');
      setProkerTargetDate('');
      setProkerStatus('Rencana');
      setActiveModal(null);
      loadProkersData();
      showToast('Program kerja OSIS berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit program kerja');
    }
  };

  const handleStartEditProker = (p: any) => {
    setEditingItem(p);
    setProkerName(p.name);
    setProkerDesc(p.description || '');
    setProkerTargetDate(p.targetDate);
    setProkerStatus(p.status || 'Rencana');
    setActiveModal('edit-proker');
  };

  const handleDeleteProker = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus program kerja ini?')) return;
    try {
      await authApi.deleteProker(id);
      loadProkersData();
      showToast('Program kerja OSIS berhasil dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus program kerja');
    }
  };

  const handleSelectElectedPair = async (periodId: string, candidateId: string) => {
    try {
      await authApi.setElectedPair(periodId, candidateId || null);
      loadPeriodsData();
      showToast('Pengurus OSIS terpilih berhasil ditetapkan!');
    } catch (e) {
      console.error(e);
      alert('Gagal menetapkan pengurus terpilih');
    }
  };

  const handleCastVote = async (candidateId: string, periodId: string) => {
    if (!userData) return;
    if (userData.level === 'employer') {
      alert('Mohon maaf, akun dengan level Employer tidak diperkenankan untuk memberikan suara.');
      return;
    }
    const candidate = candidates.find(c => c.id === candidateId);
    const candidateName = candidate ? candidate.name : 'Paslon';
    
    // Open custom confirmation modal
    setVoteConfirmModal({ candidateId, periodId, candidateName });
  };

  const handleConfirmVoteSubmit = async () => {
    if (!voteConfirmModal) return;
    const { candidateId, periodId } = voteConfirmModal;
    setVoteConfirmModal(null);
    try {
      await authApi.castVote({ periodId, candidateId });
      showToast('Terima kasih! Suara Anda telah berhasil dikirim.');
      loadVotesData();
    } catch (err) {
      console.error(err);
      alert('Gagal menyalurkan suara. Mungkin Anda sudah memilih untuk periode ini.');
    }
  };
  // Action for System settings update
  const handleUpdateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await authApi.updateSystemSettings({
        systemname: sysName,
        systemlogo: sysLogo,
        systemfavicon: sysFavicon,
        systemaddress: sysAddress,
        systemcontact: sysContact,
      });
      setSystemSettings(updated);
      showToast('Pengaturan sistem berhasil diperbarui!');
      
      // Live reload tab title and favicon
      document.title = `Dashboard - ${updated.systemname}`;
      if (updated.systemfavicon) {
        updateFavicon(updated.systemfavicon);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui pengaturan.');
    }
  };

  // Database Backup Flow
  const triggerDatabaseBackup = () => {
    setBackupProgress(0);
    setBackupLogs([]);
    
    const logs = [
      'Menghubungkan ke PostgreSQL database...',
      'Membaca konfigurasi skema dan relasi schema.prisma...',
      'Mengekstrak data tabel (users, levels, roles, classes, grades, majors)...',
      'Mengompresi dan membuat SQL backup script...',
      'Backup sukses: backup_osis_database.sql siap diunduh.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        setBackupLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentStep]}`]);
        setBackupProgress(Math.min(((currentStep + 1) / logs.length) * 100, 100));
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Trigger simulated file download
        const sqlDump = `-- SQL Backup Dump\n-- System: ${systemSettings?.systemname || 'E-OSIS'}\n-- Date: ${new Date().toLocaleString()}\n\nCREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, password TEXT);\nINSERT INTO users VALUES ('1', 'superadmin', 'hashed_pass');\n\n-- End of Backup Dump`;
        const blob = new Blob([sqlDump], { type: 'text/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_osis_${new Date().toISOString().slice(0,10)}.sql`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 400);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Memuat profil pengguna...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-card animate-slideup" style={{ padding: '40px', maxWidth: '500px', margin: '40px auto' }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>Akses Bermasalah</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => navigate('/login')} className="login-button">
          Kembali ke Login
        </button>
      </div>
    );
  }

  // Helper styles/classes
  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'student': return 'badge badge-student';
      case 'school': return 'badge badge-school';
      case 'employer': return 'badge badge-employer';
      default: return 'badge';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'student': return <GraduationCap size={24} color="#34d399" />;
      case 'school': return <Building size={24} color="#60a5fa" />;
      case 'employer': return <Briefcase size={24} color="#fbbf24" />;
      default: return <Award size={24} />;
    }
  };

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="dashboard-grid">
            {/* Profile Card */}
            <div className="theme-card profile-card">
              <h2 className="profile-card-title">
                {getLevelIcon(userData.level)}
                Informasi Akun
              </h2>

              <div className="profile-fields">
                <div className="profile-field">
                  <div className="profile-label">Username</div>
                  <div className="profile-value">{userData.username}</div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Level Akses</div>
                  <div>
                    <span className={getBadgeClass(userData.level)}>
                      {userData.level}
                    </span>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Email Terdaftar</div>
                  <div className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} className="text-muted" />
                    {userData.email || '-'}
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Role Jabatan</div>
                  <div className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={16} className="text-muted" />
                    <span style={{ textTransform: 'capitalize' }}>{userData.role || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Details Card */}
            <div className="theme-card details-card">
              <h2 className="profile-card-title">
                <BookOpen size={20} color="var(--secondary-blue)" />
                Detail Level
              </h2>

              {userData.level === 'student' && userData.details && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="detail-item">
                    <span className="detail-name">Kelas</span>
                    <span className="detail-val">{userData.details.class}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Grade</span>
                    <span className="detail-val">{userData.details.grade}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Jurusan</span>
                    <span className="detail-val">{userData.details.major}</span>
                  </div>
                </div>
              )}

              {userData.level === 'student' && !userData.details && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Data detail siswa tidak ditemukan.</p>
              )}

              {userData.level === 'school' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    Level akun ini memiliki wewenang administrasi sekolah.
                  </p>
                  <div className="detail-item">
                    <span className="detail-name">Institusi</span>
                    <span className="detail-val">Lembaga Sekolah</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Status</span>
                    <span className="detail-val" style={{ color: 'var(--success)' }}>Aktif</span>
                  </div>
                </div>
              )}

              {userData.level === 'employer' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    Level akun ini diperuntukkan bagi instansi pemberi kerja / industri mitra.
                  </p>
                  <div className="detail-item">
                    <span className="detail-name">Kemitraan</span>
                    <span className="detail-val">Industri & Dunia Kerja</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Status</span>
                    <span className="detail-val" style={{ color: 'var(--success)' }}>Aktif</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'vote': {
        const activePeriod = periods.find(p => p.status === 'active' || p.status === 'ACTIVE');
        const activePeriodCandidates = activePeriod ? candidates.filter(c => {
          if (c.periodId === activePeriod.id) return true;
          const candidatePeriod = periods.find(p => p.id === c.periodId);
          const candidateYearLabel = candidatePeriod ? candidatePeriod.yearLabel : (c.periodId === 'p3' ? '2026/2027' : c.periodId === 'p2' ? '2025/2026' : c.periodId === 'p1' ? '2024/2025' : '');
          return candidateYearLabel === activePeriod.yearLabel;
        }) : [];
        const voteKey = userData && activePeriod ? `${userData.id}_${activePeriod.id}` : '';
        const userVotedCandidateId = voteKey ? userVotes[voteKey] : undefined;
        const userVotedCandidate = candidates.find(c => c.id === userVotedCandidateId);

        const now = new Date();
        const start = activePeriod?.voteStartDate ? new Date(activePeriod.voteStartDate) : null;
        const end = activePeriod?.voteEndDate ? new Date(activePeriod.voteEndDate) : null;

        const resultReleaseTime = end ? new Date(end.getTime() + 24 * 60 * 60 * 1000) : null;
        const isResultReleased = resultReleaseTime ? now >= resultReleaseTime : false;

        let votingStatus = 'open';
        if (!activePeriod) {
          votingStatus = 'no_period';
        } else if (start && now < start) {
          votingStatus = 'not_started';
        } else if (end && now > end) {
          votingStatus = isResultReleased ? 'results' : 'ended';
        }

        const formatDatetime = (dt: Date | null) => {
          if (!dt) return '-';
          return dt.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) + ' WIB';
        };

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <h2 className="profile-card-title">
              <Award size={20} color="var(--secondary-blue)" />
              Bilik Suara Pemilihan Ketua & Wakil Ketua OSIS
            </h2>

            {votingStatus === 'no_period' && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <ShieldAlert size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h3>Tidak Ada Pemilihan OSIS Aktif</h3>
                <p style={{ marginTop: '8px' }}>Saat ini tidak ada periode pemilihan OSIS yang sedang berlangsung aktif di sistem.</p>
              </div>
            )}

            {votingStatus === 'not_started' && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '12px', background: 'var(--bg-soft-white)' }}>
                <Calendar size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--primary-navy)' }}>Voting Belum Dibuka</h3>
                <p style={{ marginTop: '8px', fontSize: '15px' }}>
                  Pemilihan OSIS Periode <strong>{activePeriod?.yearLabel}</strong> baru akan dimulai pada:
                </p>
                <strong style={{ display: 'block', marginTop: '12px', fontSize: '18px', color: 'var(--warning)' }}>
                  {formatDatetime(start)}
                </strong>
              </div>
            )}

            {votingStatus === 'ended' && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '12px', background: 'var(--bg-soft-white)' }}>
                <Lock size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--primary-navy)' }}>Voting Telah Ditutup</h3>
                <p style={{ marginTop: '8px', fontSize: '15px' }}>
                  Waktu pemilihan OSIS Periode <strong>{activePeriod?.yearLabel}</strong> telah berakhir pada:
                </p>
                <strong style={{ display: 'block', marginTop: '12px', fontSize: '18px', color: 'var(--danger)' }}>
                  {formatDatetime(end)}
                </strong>
                <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-dark)' }}>
                  Hasil perhitungan suara akan diumumkan secara resmi pada:
                </p>
                <strong style={{ display: 'block', marginTop: '8px', fontSize: '16px', color: 'var(--secondary-blue)' }}>
                  {formatDatetime(resultReleaseTime)}
                </strong>
                <p style={{ marginTop: '16px', fontSize: '12px' }}>Terima kasih kepada seluruh siswa yang telah berpartisipasi menyalurkan hak suaranya.</p>
              </div>
            )}

            {votingStatus === 'results' && activePeriod && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', background: 'var(--bg-soft-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '14px' }}>Periode Pemilihan: <strong>{activePeriod.yearLabel}</strong></span>
                  <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 'bold' }}>Hasil Pemilihan Resmi Dirilis</span>
                </div>

                {(() => {
                  const activePeriodVotes = Object.entries(userVotes)
                    .filter(([key]) => key.endsWith(`_${activePeriod.id}`))
                    .map(([_, candidateId]) => candidateId);
                  
                  const totalVotesCount = activePeriodVotes.length;

                  // Count votes per candidate
                  const candidateVotes = activePeriodCandidates.map(c => {
                    const count = activePeriodVotes.filter(cid => cid === c.id).length;
                    return {
                      ...c,
                      votesCount: count,
                      percentage: totalVotesCount > 0 ? Math.round((count / totalVotesCount) * 100) : 0
                    };
                  }).sort((a, b) => b.votesCount - a.votesCount);

                  // Find max vote to identify winner
                  const maxVotes = candidateVotes.length > 0 ? candidateVotes[0].votesCount : 0;
                  const isDraw = candidateVotes.filter(c => c.votesCount === maxVotes).length > 1;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div className="theme-card" style={{ padding: '24px', border: '1px solid var(--card-border)', background: 'linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(37,99,235,0) 100%)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Total Hak Suara Masuk</span>
                          <strong style={{ fontSize: '32px', color: 'var(--primary-navy)', fontWeight: 800 }}>{totalVotesCount} Suara</strong>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--card-border)', height: '40px', display: 'block' }}></div>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Status Pengumuman</span>
                          <span style={{ fontSize: '13px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '20px', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>Resmi & Sah</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {candidateVotes.map(c => {
                          const isWinner = c.votesCount === maxVotes && maxVotes > 0 && !isDraw;
                          return (
                            <div key={c.id} className="theme-card animate-slideup" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: isWinner ? '2px solid var(--success)' : '1px solid var(--card-border)', position: 'relative', borderRadius: '12px', background: 'var(--card-bg)', overflow: 'visible' }}>
                              {isWinner && (
                                <div style={{ position: 'absolute', top: '-14px', right: '16px', background: 'var(--success)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                  👑 Suara Terbanyak (Elected)
                                </div>
                              )}
                              
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <img src={c.photo || 'https://via.placeholder.com/64'} alt={c.name} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
                                <div>
                                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', background: 'rgba(37,99,235,0.08)', color: 'var(--secondary-blue)', borderRadius: '6px', display: 'inline-block', marginBottom: '4px' }}>
                                    PASLON {c.paslonNo}
                                  </span>
                                  <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700 }}>{c.name}</h3>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.classes}</span>
                                </div>
                              </div>

                              <div style={{ fontSize: '13px', borderTop: '1px solid var(--card-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Perolehan Suara</span>
                                  <strong style={{ fontSize: '16px', color: 'var(--primary-navy)' }}>{c.votesCount} Suara</strong>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Persentase</span>
                                  <strong style={{ fontSize: '16px', color: isWinner ? 'var(--success)' : 'var(--text-dark)' }}>{c.percentage}%</strong>
                                </div>

                                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                                  <div style={{ width: `${c.percentage}%`, height: '100%', background: isWinner ? 'var(--success)' : 'var(--secondary-blue)', borderRadius: '4px' }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {votingStatus === 'open' && activePeriod && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', background: 'var(--bg-soft-white)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '14px' }}>Periode: <strong>{activePeriod.yearLabel}</strong></span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Batas Waktu: <strong>{formatDatetime(start)} s/d {formatDatetime(end)}</strong>
                  </span>
                </div>

                {userData?.level === 'employer' ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid var(--card-border)', borderRadius: '12px', background: 'var(--bg-soft-white)' }}>
                    <ShieldAlert size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--primary-navy)' }}>Akses Voting Terbatas</h3>
                    <p style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                      Mohon maaf, hak suara hanya berlaku bagi akun dengan tingkat akses <strong>Sekolah (School)</strong> dan <strong>Siswa (Student)</strong>. Akun level Employer tidak memiliki hak untuk memilih.
                    </p>
                  </div>
                ) : userVotedCandidateId ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px solid var(--success)', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0) 100%)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', fontWeight: 'bold' }}>✓</div>
                    <h3 style={{ color: 'var(--success)', fontWeight: 800 }}>Hak Suara Berhasil Disalurkan!</h3>
                    <p style={{ marginTop: '8px', color: 'var(--text-dark)' }}>Terima kasih atas partisipasi Anda dalam pemilihan Ketua & Wakil Ketua OSIS Periode {activePeriod.yearLabel}.</p>
                    
                    {userVotedCandidate && (
                      <div style={{ marginTop: '24px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '16px 32px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Pilihan Anda:</span>
                        <img src={userVotedCandidate.photo || 'https://via.placeholder.com/80'} alt="Pilihan" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', marginBottom: '12px' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '6px', marginBottom: '6px' }}>PASLON {userVotedCandidate.paslonNo}</span>
                        <strong style={{ fontSize: '15px', color: 'var(--primary-navy)' }}>{userVotedCandidate.name}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '15px', color: 'var(--text-dark)', marginBottom: '24px', textAlign: 'center' }}>
                      Silakan pelajari visi-misi pasangan calon di bawah ini dan tentukan pilihan terbaik Anda.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                      {activePeriodCandidates.map(c => (
                        <div key={c.id} className="theme-card animate-slideup" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--card-border)', textAlign: 'left', borderRadius: '12px', background: 'var(--card-bg)' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <img src={c.photo || 'https://via.placeholder.com/64'} alt={c.name} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
                            <div>
                              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', background: 'rgba(37,99,235,0.08)', color: 'var(--secondary-blue)', borderRadius: '6px', display: 'inline-block', marginBottom: '4px' }}>
                                PASLON {c.paslonNo}
                              </span>
                              <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700 }}>{c.name}</h3>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.classes}</span>
                            </div>
                          </div>

                          <div style={{ fontSize: '13px', borderTop: '1px solid var(--card-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                            <div><strong>Visi:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.visi}</span></div>
                            {c.misi && <div><strong>Misi:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.misi}</span></div>}
                          </div>

                          <button 
                            onClick={() => handleCastVote(c.id, activePeriod.id)}
                            className="btn-primary-sm"
                            style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          >
                            PILIH PASLON {c.paslonNo}
                          </button>
                        </div>
                      ))}

                      {activePeriodCandidates.length === 0 && (
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          Belum ada kandidat yang didaftarkan untuk periode pemilihan OSIS aktif ini.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'kandidat': {
        const filteredCandidates = candidates.filter(c => {
          const matchSearch = (c.name + ' ' + c.classes + ' ' + c.visi).toLowerCase().includes(candidateSearch.toLowerCase());
          
          let resolvedPeriodId = c.periodId;
          const candidatePeriod = periods.find(p => p.id === c.periodId);
          if (!candidatePeriod) {
            const mockYearLabel = c.periodId === 'p3' ? '2026/2027' : c.periodId === 'p2' ? '2025/2026' : c.periodId === 'p1' ? '2024/2025' : '';
            const dbPeriod = periods.find(p => p.yearLabel === mockYearLabel);
            if (dbPeriod) {
              resolvedPeriodId = dbPeriod.id;
            }
          }
          
          const matchPeriod = candidatePeriodFilter ? resolvedPeriodId === candidatePeriodFilter : true;
          return matchSearch && matchPeriod;
        });

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Users size={20} color="var(--secondary-blue)" />
                Kandidat Ketua & Wakil Ketua OSIS
              </h2>
              {userData.role === 'superadmin' && (
                <button onClick={() => {
                  const activePeriod = periods.find(p => p.status?.toLowerCase() === 'active') || periods[0];
                  setNewCandidatePeriodId(activePeriod?.id || 'p3');
                  setSelectedPresidentId('');
                  setSelectedVicePresidentId('');
                  setNewCandidateClasses('');
                  setNewCandidateVisi('');
                  setNewCandidateMisi('');
                  setNewCandidatePhoto('');
                  setEditingItem(null);
                  setActiveModal('add-candidate');
                }} className="btn-primary-sm">
                  <Plus size={16} /> Tambah Kandidat
                </button>
              )}
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Daftar pasangan calon OSIS yang sedang bersaing dalam pemilihan periode aktif.
            </p>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Cari nama calon, kelas, visi..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={candidateSearch}
                  onChange={e => setCandidateSearch(e.target.value)}
                />
              </div>

              <select 
                className="form-input" 
                style={{ width: '220px', margin: 0, paddingLeft: '16px' }}
                value={candidatePeriodFilter}
                onChange={e => setCandidatePeriodFilter(e.target.value)}
              >
                <option value="">Semua Periode</option>
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.yearLabel}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredCandidates.map(c => {
                const matchedPeriod = periods.find(p => p.id === c.periodId);
                const periodLabel = matchedPeriod ? matchedPeriod.yearLabel : '2026/2027';
                return (
                  <div key={c.id} className="theme-card animate-slideup" style={{ padding: '24px', textAlign: 'left', border: '1px solid var(--card-border)', display: 'flex', gap: '16px', position: 'relative' }}>
                    <img 
                      src={c.photo || 'https://via.placeholder.com/80'} 
                      alt={c.name} 
                      style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--card-border)', flexShrink: 0 }} 
                    />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingRight: userData.role === 'superadmin' ? '50px' : '0' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', background: 'rgba(37,99,235,0.08)', color: 'var(--secondary-blue)', borderRadius: '6px' }}>
                          PASLON {c.paslonNo}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Periode {periodLabel}
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--primary-navy)', fontWeight: 700 }}>{c.name}</h3>
                      <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-muted)' }}>{c.classes}</p>
                      
                      <div style={{ fontSize: '12px', borderTop: '1px solid var(--card-border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong>Visi:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.visi}</span></div>
                        {c.misi && <div><strong>Misi:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.misi}</span></div>}
                      </div>
 
                      {userData.role === 'superadmin' && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => handleStartEditCandidate(c)} 
                            className="action-btn action-btn-warning" 
                            style={{ padding: '4px 8px' }}
                            title="Edit Kandidat"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCandidate(c.id)} 
                            className="action-btn action-btn-danger" 
                            style={{ padding: '4px 8px' }}
                            title="Hapus Kandidat"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredCandidates.length === 0 && (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', width: '100%' }}>
                  Tidak ada data kandidat yang cocok dengan pencarian Anda.
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'proker': {
        const activePeriod = periods.find(p => p.status === 'active' || p.status === 'ACTIVE') || periods[0];
        
        // Find candidates of activePeriod
        const activePeriodCandidates = activePeriod ? candidates.filter(c => {
          if (c.periodId === activePeriod.id) return true;
          const candidatePeriod = periods.find(p => p.id === c.periodId);
          const candidateYearLabel = candidatePeriod ? candidatePeriod.yearLabel : (c.periodId === 'p3' ? '2026/2027' : c.periodId === 'p2' ? '2025/2026' : c.periodId === 'p1' ? '2024/2025' : '');
          return candidateYearLabel === activePeriod.yearLabel;
        }) : [];
        
        const activePeriodVotes = Object.entries(userVotes)
          .filter(([key]) => key.endsWith(`_${activePeriod?.id}`))
          .map(([_, candidateId]) => candidateId);
        
        const candidateVotes = activePeriodCandidates.map(c => {
          const count = activePeriodVotes.filter(cid => cid === c.id).length;
          return {
            ...c,
            votesCount: count,
          };
        }).sort((a, b) => b.votesCount - a.votesCount);
        
        const maxVotes = candidateVotes.length > 0 ? candidateVotes[0].votesCount : 0;
        const isDraw = candidateVotes.filter(c => c.votesCount === maxVotes).length > 1;
        
        // Auto-select winner if there is one, otherwise fallback to manually selected electedCandidateId
        const winnerCandidate = (candidateVotes.length > 0 && maxVotes > 0 && !isDraw) ? candidateVotes[0] : null;
        
        const electedCandidateId = activePeriod ? (electedPairs[activePeriod.id] || (winnerCandidate ? winnerCandidate.id : undefined)) : undefined;
        const electedCandidate = candidates.find(c => c.id === electedCandidateId) || winnerCandidate;
        
        const periodProkers = activePeriod ? prokers.filter(p => {
          if (p.periodId === activePeriod.id) return true;
          const mockYearLabel = p.periodId === 'p3' ? '2026/2027' : p.periodId === 'p2' ? '2025/2026' : p.periodId === 'p1' ? '2024/2025' : '';
          return mockYearLabel === activePeriod.yearLabel;
        }) : [];
        const totalPro = periodProkers.length;
        const rencanaPro = periodProkers.filter(p => p.status === 'Rencana').length;
        const berjalanPro = periodProkers.filter(p => p.status === 'Berjalan').length;
        const selesaiPro = periodProkers.filter(p => p.status === 'Selesai').length;

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', flexShrink: 0, flexWrap: 'wrap', gap: '16px' }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Briefcase size={20} color="var(--secondary-blue)" />
                Program Kerja OSIS
              </h2>
              
              {userData.role === 'superadmin' && activePeriod && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Pengurus Terpilih:</span>
                    <select 
                      className="form-input" 
                      style={{ width: '220px', margin: 0, paddingLeft: '12px', height: '36px', fontSize: '13px' }}
                      value={electedCandidateId || ''}
                      onChange={e => handleSelectElectedPair(activePeriod.id, e.target.value)}
                    >
                      <option value="">-- Belum Ditentukan --</option>
                      {candidates.filter(c => {
                        if (c.periodId === activePeriod.id) return true;
                        const mockYearLabel = c.periodId === 'p3' ? '2026/2027' : c.periodId === 'p2' ? '2025/2026' : c.periodId === 'p1' ? '2024/2025' : '';
                        return mockYearLabel === activePeriod.yearLabel;
                      }).map(c => (
                        <option key={c.id} value={c.id}>PASLON {c.paslonNo} ({c.name})</option>
                      ))}
                    </select>
                  </div>
                  {electedCandidate && (
                    <button 
                      onClick={() => {
                        setProkerName('');
                        setProkerDesc('');
                        setProkerTargetDate('');
                        setProkerStatus('Rencana');
                        setEditingItem(null);
                        setActiveModal('add-proker');
                      }} 
                      className="btn-primary-sm"
                      style={{ padding: '8px 16px', height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Tambah Proker
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '16px', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                Periode Pemilihan Aktif: <strong>{activePeriod ? activePeriod.yearLabel : 'Belum Ada'}</strong>
              </p>

              {/* Elected Officer Banner */}
              {electedCandidate ? (
                <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(37,99,235,0) 100%)', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '12px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary-blue)', display: 'block' }}>
                      Pengurus OSIS Terpilih (Periode {activePeriod ? activePeriod.yearLabel : '-'})
                    </span>
                    <span style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--success)', color: '#fff', borderRadius: '12px', fontWeight: 700 }}>
                      Hasil Voting Terbanyak
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <img 
                      src={electedCandidate.photo || 'https://via.placeholder.com/64'} 
                      alt="Pengurus" 
                      style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--card-border)' }} 
                    />
                    
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* President Role */}
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>President (Ketua OSIS)</div>
                        <h4 style={{ margin: '4px 0 2px', fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700 }}>
                          {electedCandidate.presidentName || electedCandidate.name.split(' & ')[0]}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Kelas: {electedCandidate.presidentClass || electedCandidate.classes.split(' & ')[0] || '-'}
                        </span>
                      </div>
                      
                      {/* Divider */}
                      <div style={{ borderLeft: '1px solid var(--card-border)', height: '40px' }}></div>
                      
                      {/* Vice President Role */}
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Vice President (Wakil Ketua)</div>
                        <h4 style={{ margin: '4px 0 2px', fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700 }}>
                          {electedCandidate.vicePresidentName || electedCandidate.name.split(' & ')[1]}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Kelas: {electedCandidate.vicePresidentClass || electedCandidate.classes.split(' & ')[1] || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="theme-card" style={{ padding: '24px', border: '1px dashed var(--card-border)', textAlign: 'center', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                    Belum ada pengurus OSIS terpilih yang ditetapkan menjabat untuk periode aktif ({activePeriod ? activePeriod.yearLabel : '-'}).
                  </p>
                  {userData.role === 'superadmin' && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>
                      Silakan pilih Pasangan Terpilih pada dropdown di atas untuk mulai menyusun program kerja.
                    </p>
                  )}
                </div>
              )}

              {electedCandidate && (
                <>
                  {/* Proker Statistics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Program</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--primary-navy)' }}>{totalPro}</h4>
                    </div>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Rencana</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-muted)' }}>{rencanaPro}</h4>
                    </div>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sedang Berjalan</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--warning)' }}>{berjalanPro}</h4>
                    </div>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Selesai</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{selesaiPro}</h4>
                    </div>
                  </div>

                  {/* List of Prokers */}
                  <h3 style={{ fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700, margin: '10px 0 0' }}>
                    Daftar Rencana Program Kerja OSIS
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {periodProkers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                        Belum ada program kerja yang disusun untuk periode ini.
                      </div>
                    ) : (
                      periodProkers.map(p => (
                        <div key={p.id} className="theme-card animate-slideup" style={{ padding: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingRight: userData.role === 'superadmin' ? '80px' : '0' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                              {p.name}
                            </h4>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Target: <strong>{p.targetDate}</strong>
                              </span>
                              
                              {p.status === 'Rencana' && (
                                <span className="badge badge-secondary" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>Rencana</span>
                              )}
                              {p.status === 'Berjalan' && (
                                <span className="badge badge-warning" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--warning)' }}>Berjalan</span>
                              )}
                              {p.status === 'Selesai' && (
                                <span className="badge badge-success" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--success)' }}>Selesai</span>
                              )}
                            </div>
                          </div>

                          {p.description && (
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dark)', lineHeight: '1.5' }}>
                              {p.description}
                            </p>
                          )}

                          {userData.role === 'superadmin' && (
                            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => handleStartEditProker(p)} 
                                className="action-btn action-btn-warning"
                                style={{ padding: '4px 8px' }}
                                title="Edit Proker"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProker(p.id)} 
                                className="action-btn action-btn-danger"
                                style={{ padding: '4px 8px' }}
                                title="Hapus Proker"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }

      case 'kas-osis': {
        const studentUsers = users.filter(u => u.level === 'student');
        const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
        const classKasClaims = monthlyClaims[monthKey] || {};
        
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        // Overall calculations
        let totalKasCollected = 0;
        let totalKasTarget = 0;
        let claimedClassesCount = 0;
        let totalClassesWithStudents = 0;

        classes.forEach(c => {
          const classStudents = studentUsers.filter(u => u.classname.toLowerCase() === c.classname.toLowerCase());
          const classTotalFee = classStudents.length * 5000;
          totalKasTarget += classTotalFee;
          if (classStudents.length > 0) {
            totalClassesWithStudents++;
          }
          if (classKasClaims[c.id]) {
            totalKasCollected += classTotalFee;
            if (classStudents.length > 0) {
              claimedClassesCount++;
            }
          }
        });

        // Cumulative Calculations (All time)
        const getAllTimeCollectedKas = () => {
          let total = 0;
          Object.keys(monthlyClaims).forEach(mKey => {
            const claims = monthlyClaims[mKey] || {};
            classes.forEach(c => {
              if (claims[c.id]) {
                const classStudents = studentUsers.filter(u => u.classname.toLowerCase() === c.classname.toLowerCase());
                total += classStudents.length * 5000;
              }
            });
          });
          return total;
        };

        const allTimeCollected = getAllTimeCollectedKas();
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const currentBalance = allTimeCollected - totalExpenses;
        
        const formatRupiah = (amount: number) => {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
        };

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <h2 className="profile-card-title" style={{ flexShrink: 0, margin: 0, paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
              <DollarSign size={20} color="var(--secondary-blue)" />
              Kelola Kas & Keuangan OSIS
            </h2>

            <div className="custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '16px', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Month Switcher Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px', background: 'var(--bg-soft-white)', border: '1px solid var(--card-border)', borderRadius: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Periode Bulan:</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => {
                    const prev = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
                    setSelectedMonth(prev);
                  }}
                  className="btn-secondary-sm"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', fontWeight: 700 }}
                  title="Bulan Sebelumnya"
                >
                  &larr;
                </button>
                
                <button 
                  onClick={() => {
                    setSelectedMonth(new Date());
                  }}
                  className="btn-secondary-sm"
                  style={{ fontWeight: 600, padding: '8px 16px' }}
                >
                  Bulan Ini (Today)
                </button>
                
                <button 
                  onClick={() => {
                    const next = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
                    setSelectedMonth(next);
                  }}
                  className="btn-secondary-sm"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', fontWeight: 700 }}
                  title="Bulan Berikutnya"
                >
                  &rarr;
                </button>
              </div>
            </div>

            {/* General Financial Summary Banner */}
            <h3 style={{ fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700, margin: '0 0 12px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              Laporan Ringkasan Keuangan (All-Time)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0) 100%)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Saldo Kas Saat Ini</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>
                  {formatRupiah(currentBalance)}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Sisa saldo bersih kas OSIS
                </p>
              </div>

              <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Kas Masuk</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {formatRupiah(allTimeCollected)}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Akumulasi seluruh bulan
                </p>
              </div>

              <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0) 100%)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Pengeluaran</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 800, color: 'var(--danger)' }}>
                  {formatRupiah(totalExpenses)}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Total pengeluaran dana kas
                </p>
              </div>
            </div>

            {/* Monthly Details Section */}
            <h3 style={{ fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700, margin: '0 0 12px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              Penerimaan Kas Bulan: {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Kas Terkumpul Bulan Ini</span>
                <h4 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>
                  {formatRupiah(totalKasCollected)}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target: {formatRupiah(totalKasTarget)}</span>
              </div>

              <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Persentase Klaim Kelas</span>
                <h4 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  {claimedClassesCount} / {totalClassesWithStudents} Kelas
                </h4>
                <div style={{ marginTop: '6px', background: 'var(--card-border)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${totalClassesWithStudents ? (claimedClassesCount / totalClassesWithStudents) * 100 : 0}%`, background: 'var(--success)', height: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* List of Classes */}
            <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', paddingRight: '8px', marginBottom: '40px' }}>
              {classes.map(c => {
                const classStudents = studentUsers.filter(u => u.classname.toLowerCase() === c.classname.toLowerCase());
                const classTotalFee = classStudents.length * 5000;
                const isClaimed = classKasClaims[c.id] === true;
                const isExpanded = expandedClassId === c.id;

                return (
                  <div key={c.id} className="theme-card animate-slideup" style={{ padding: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {classStudents.length > 0 && (
                          <input 
                            type="checkbox" 
                            checked={isClaimed}
                            disabled={isClaimed}
                            onChange={() => handleToggleClassKasClaim(c.id, monthKey)}
                            style={{ 
                              width: '22px', 
                              height: '22px', 
                              cursor: isClaimed ? 'not-allowed' : 'pointer',
                              accentColor: 'var(--success)'
                            }} 
                          />
                        )}
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--primary-navy)', fontWeight: 700 }}>
                            Kelas {c.classname}
                          </h3>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {classStudents.length} Siswa Terdaftar
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Iuran Kas (Rp 5.000 / Siswa)</span>
                          <strong style={{ fontSize: '14px', color: isClaimed ? 'var(--success)' : 'var(--text-dark)' }}>
                            {isClaimed ? formatRupiah(classTotalFee) : formatRupiah(0)} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px' }}>/ {formatRupiah(classTotalFee)}</span>
                          </strong>
                        </div>
                        
                        {classStudents.length === 0 ? (
                          <span className="badge badge-secondary" style={{ padding: '6px 12px', borderRadius: '8px' }}>Kosong</span>
                        ) : isClaimed ? (
                          <span className="badge badge-success" style={{ padding: '6px 12px', borderRadius: '8px', color: 'var(--success)' }}>Telah Diklaim</span>
                        ) : (
                          <span className="badge badge-warning" style={{ padding: '6px 12px', borderRadius: '8px', color: 'var(--warning)' }}>Belum Diklaim</span>
                        )}

                        <button 
                          onClick={() => setExpandedClassId(isExpanded ? null : c.id)} 
                          className="btn-secondary-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {isExpanded ? 'Tutup Detail' : 'Lihat Anggota'}
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="table-responsive animate-slideup" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px', marginTop: '4px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--primary-navy)', fontWeight: 600 }}>Daftar Anggota Kelas:</h4>
                        {classStudents.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0' }}>Tidak ada murid di kelas ini.</p>
                        ) : (
                          <table className="data-table" style={{ width: '100%' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Nama Murid</th>
                                <th style={{ textAlign: 'center', padding: '10px 12px', width: '150px' }}>Iuran Wajib</th>
                                <th style={{ textAlign: 'center', padding: '10px 12px', width: '150px' }}>Status Pembayaran</th>
                              </tr>
                            </thead>
                            <tbody>
                              {classStudents.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                  <td style={{ padding: '12px 12px', fontWeight: 500, color: 'var(--text-dark)' }}>{u.username}</td>
                                  <td style={{ padding: '12px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>Rp 5.000</td>
                                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: isClaimed ? 'var(--success)' : 'var(--text-muted)' }}>
                                      {isClaimed ? 'Lunas (Kolektif)' : 'Belum Diklaim'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Expenses Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--primary-navy)', fontWeight: 700, margin: 0 }}>
                Catatan Pengeluaran Kas OSIS
              </h3>
              <button 
                onClick={() => {
                  const today = new Date();
                  setExpenseDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
                  setExpenseDesc('');
                  setExpenseAmount('');
                  setActiveModal('add-expense');
                }} 
                className="btn-primary-sm"
              >
                <Plus size={16} /> Tambah Pengeluaran
              </button>
            </div>

            <div className="table-responsive custom-scrollbar" style={{ maxHeight: '300px', paddingRight: '4px' }}>
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Belum ada catatan pengeluaran kas.
                </div>
              ) : (
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Tanggal</th>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Keterangan / Keperluan</th>
                      <th style={{ textAlign: 'right', padding: '12px' }}>Jumlah Dana</th>
                      <th style={{ textAlign: 'center', padding: '12px', width: '100px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-dark)' }}>
                          {exp.description}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>
                          {formatRupiah(exp.amount)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteExpense(exp.id)} 
                            className="action-btn action-btn-danger"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      );
      }

      case 'manage-class':
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <BookOpen size={20} color="var(--secondary-blue)" />
                Kelola Data Kelas
              </h2>
              <button onClick={() => setActiveModal('add-class')} className="btn-primary-sm">
                <Plus size={16} /> Tambah Kelas
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Kelola data kelas terdaftar dalam sistem.
            </p>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama Kelas</th>
                    <th>Grade</th>
                    <th>Jurusan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.classname}</td>
                      <td>{c.grade?.gradename}</td>
                      <td>{c.major?.majorname} ({c.major?.majorcode})</td>
                      <td>
                        <button onClick={() => {
                          setEditingItem(c);
                          setNewClassname(c.classname);
                          setSelectedGradeId(c.gradeid);
                          setSelectedMajorId(c.majorid);
                          setActiveModal('edit-class');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteClass(c.id)} className="action-btn action-btn-danger">
                          <Trash2 size={13} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data kelas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'manage-grade':
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Award size={20} color="var(--secondary-blue)" />
                Kelola Data Grade (Tingkatan)
              </h2>
              <button onClick={() => setActiveModal('add-grade')} className="btn-primary-sm">
                <Plus size={16} /> Tambah Grade
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Pengaturan tingkatan kelas aktif dalam sekolah.
            </p>

            <div className="admin-table-container" style={{ maxWidth: '400px' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama Grade</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 600 }}>{g.gradename}</td>
                      <td>
                        <button onClick={() => {
                          setEditingItem(g);
                          setNewGradename(g.gradename);
                          setActiveModal('edit-grade');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteGrade(g.id)} className="action-btn action-btn-danger">
                          <Trash2 size={13} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'manage-major':
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <GraduationCap size={20} color="var(--secondary-blue)" />
                Kelola Data Jurusan (Major)
              </h2>
              <button onClick={() => setActiveModal('add-major')} className="btn-primary-sm">
                <Plus size={16} /> Tambah Jurusan
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Pengaturan data jurusan sekolah terdaftar.
            </p>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Lengkap Jurusan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {majors.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700 }}>{m.majorcode}</td>
                      <td>{m.majorname}</td>
                      <td>
                        <button onClick={() => {
                          setEditingItem(m);
                          setNewMajorname(m.majorname);
                          setNewMajorcode(m.majorcode);
                          setActiveModal('edit-major');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteMajor(m.id)} className="action-btn action-btn-danger">
                          <Trash2 size={13} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'manage-period': {
        const formatDatetime = (dtStr: string) => {
          if (!dtStr) return '-';
          try {
            return new Date(dtStr).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (err) {
            return dtStr;
          }
        };

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Calendar size={20} color="var(--secondary-blue)" />
                Kelola Data Periode & Waktu Voting
              </h2>
              <button onClick={() => {
                setNewPeriodYear('');
                setNewPeriodStatus('INACTIVE');
                setNewPeriodVoteStart('');
                setNewPeriodVoteEnd('');
                setActiveModal('add-period');
              }} className="btn-primary-sm">
                <Plus size={16} /> Tambah Periode
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Pengaturan tahun ajaran periode kepengurusan OSIS dan rentang durasi pelaksanaan voting.
            </p>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tahun Ajaran</th>
                    <th>Status</th>
                    <th>Mulai Voting</th>
                    <th>Selesai Voting</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.yearLabel}</td>
                      <td>
                        <span className={`badge ${p.status === 'ACTIVE' ? 'badge-student' : p.status === 'INACTIVE' ? 'badge-school' : 'badge-employer'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{formatDatetime(p.voteStartDate)}</td>
                      <td style={{ fontSize: '13px' }}>{formatDatetime(p.voteEndDate)}</td>
                      <td>
                        <button onClick={() => {
                          setEditingItem(p);
                          setNewPeriodYear(p.yearLabel);
                          setNewPeriodStatus(p.status);
                          setNewPeriodVoteStart(p.voteStartDate || '');
                          setNewPeriodVoteEnd(p.voteEndDate || '');
                          setActiveModal('edit-period');
                        }} className="action-btn">
                          <Edit2 size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'manage-user':
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <UserIcon className="text-muted" size={20} style={{ color: 'var(--secondary-blue)' }} />
                Kelola Pengguna Sistem
              </h2>
              <button onClick={() => setActiveModal('add-user')} className="btn-primary-sm">
                <Plus size={16} /> Tambah User
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Daftar seluruh akun pengguna yang terdaftar di database sistem beserta level aksesnya.
            </p>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Level</th>
                    <th>Email</th>
                    <th>Jabatan (Role)</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.username}</td>
                      <td>
                        <span className={getBadgeClass(u.level)}>{u.level}</span>
                      </td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td>
                        <button onClick={() => {
                          setEditingItem(u);
                          setNewUserUsername(u.username);
                          setNewUserPassword('');
                          setNewUserEmail(u.email);
                          setNewUserLevel(u.level);
                          setNewUserRole(u.role === '-' ? '' : u.role);
                          setNewUserClassId(u.classid || ''); 
                          setActiveModal('edit-user');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => {
                          setEditingItem(u);
                          setResetPasswordNewVal('');
                          setActiveModal('reset-password');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Lock size={13} /> Reset PW
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="action-btn action-btn-danger">
                          <Trash2 size={13} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'system-setting':
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <h2 className="profile-card-title">
              <Settings size={20} color="var(--secondary-blue)" />
              Pengaturan Sistem Utama
            </h2>
            <form onSubmit={handleUpdateSystem} className="settings-form">
              <div className="form-group">
                <label className="form-label">Nama Aplikasi / Sistem</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px' }} value={sysName} onChange={e => setSysName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Favicon Sistem</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {sysFavicon && (
                    <img src={sysFavicon} alt="Favicon Preview" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="form-input" 
                    style={{ padding: '8px 16px' }} 
                    onChange={e => handleFileChange(e, setSysFavicon)} 
                  />
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Logo Sistem</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {sysLogo && (
                    <img src={sysLogo} alt="Logo Preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="form-input" 
                    style={{ padding: '8px 16px' }} 
                    onChange={e => handleFileChange(e, setSysLogo)} 
                  />
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Alamat Sekolah / Institusi</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px' }} value={sysAddress} onChange={e => setSysAddress(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Kontak / Dukungan Teknis</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px' }} value={sysContact} onChange={e => setSysContact(e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="btn-primary-sm">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        );

      case 'backup-db':
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <h2 className="profile-card-title">
              <Database size={20} color="var(--secondary-blue)" />
              Pencadangan Database (Backup)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--primary-navy)' }}>Status Keamanan Database</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status Koneksi</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>TERHUBUNG</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mesin Database</span>
                    <span style={{ fontWeight: 600 }}>PostgreSQL 16</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Jumlah Tabel Aktif</span>
                    <span style={{ fontWeight: 600 }}>10 Tabel</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ukuran Database</span>
                    <span style={{ fontWeight: 600 }}>~24.5 KB</span>
                  </div>
                </div>
                <button onClick={triggerDatabaseBackup} className="btn-primary-sm" style={{ marginTop: '20px' }}>
                  <Download size={16} /> Mulai Backup Database
                </button>
              </div>

              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--primary-navy)' }}>Konsol Backup</h3>
                <div style={{ background: 'var(--bg-soft-white)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', height: '140px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dark)', textAlign: 'left' }}>
                  {backupLogs.map((log, index) => <div key={index} style={{ marginBottom: '4px' }}>{log}</div>)}
                  {backupLogs.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Klik tombol untuk melihat progress logs.</span>}
                </div>
                {backupProgress !== null && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Progress Pencadangan</span>
                      <span>{Math.round(backupProgress)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--card-border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${backupProgress}%`, height: '100%', background: 'var(--success)', transition: 'width 0.1s linear' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="theme-card profile-card animate-slideup" style={{ gridColumn: 'span 2' }}>
            <h2 className="profile-card-title">
              <UserIcon size={20} color="var(--secondary-blue)" />
              Ubah Profil & Kata Sandi
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Perbarui alamat email terdaftar atau ubah kata sandi akses akun Anda.
            </p>
            
            {editProfileError && (
              <div className="error-banner" style={{ maxWidth: '500px' }}>
                <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                <span>{editProfileError}</span>
              </div>
            )}
            
            {editProfileSuccess && (
              <div className="error-banner" style={{ maxWidth: '500px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                <span>{editProfileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Username (Tidak dapat diubah)</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px', opacity: 0.6, cursor: 'not-allowed' }} value={userData?.username || ''} disabled />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Alamat Email</label>
                <input type="email" className="form-input" style={{ paddingLeft: '16px' }} value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Kata Sandi Baru (Kosongkan jika tidak ingin diubah)</label>
                <input type="password" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Masukkan password baru" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Konfirmasi Kata Sandi Baru</label>
                <input type="password" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Ulangi password baru" value={editConfirmPassword} onChange={e => setEditConfirmPassword(e.target.value)} />
              </div>
              <div>
                <button type="submit" className="btn-primary-sm">
                  <Save size={16} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return <div>View tidak ditemukan</div>;
    }
  };

  // Layout rendering (voter/teacher non-sidebar layout vs admin/employer/OSIS officer layout with sidebar)
  const isTeacher = userData.level === 'school' && userData.role === 'teacher';
  const isStudentNoRole = userData.level === 'student' && (!userData.role || userData.role === '-' || userData.role === 'members' || userData.role === 'student');

  if (isTeacher || isStudentNoRole) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', width: '100%' }}>
        {/* Sleek Top Navbar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--card-border)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'var(--transition)'
        }} className="top-navbar-glass">
          {/* Brand Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            {systemSettings?.systemlogo ? (
              <img src={systemSettings.systemlogo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <Building size={24} color="var(--secondary-blue)" />
            )}
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-navy)', letterSpacing: '-0.3px' }}>
              {systemSettings?.systemname || 'E-OSIS'}
            </span>
          </div>

          {/* User Info & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid var(--card-border)',
                background: 'transparent',
                color: 'var(--text-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-soft-white)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* User Dropdown Profile Menu */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setVoterDropdownOpen(!voterDropdownOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  background: 'var(--bg-soft-white)', 
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'var(--transition)'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--secondary-blue)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
              >
                <UserIcon size={14} color="var(--text-muted)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
                  Selamat datang, {userData.username}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transform: voterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }} />
              </div>

              {/* Dropdown Menu Overlay */}
              {voterDropdownOpen && (
                <>
                  {/* Backdrop listener to close dropdown on click outside */}
                  <div 
                    onClick={() => setVoterDropdownOpen(false)} 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '180px',
                    borderRadius: '12px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--card-shadow)',
                    padding: '8px 0',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left'
                  }}>
                    {/* Account Settings Menu */}
                    <div 
                      onClick={() => {
                        setVoterDropdownOpen(false);
                        navigate('/profile');
                        setEditEmail(userData?.email || '');
                        setEditPassword('');
                        setEditConfirmPassword('');
                        setEditProfileError('');
                        setEditProfileSuccess('');
                      }}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-dark)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-soft-white)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings size={14} />
                      <span>Ubah Profil</span>
                    </div>

                    {/* Horizontal Divider */}
                    <div style={{ height: '1px', background: 'var(--card-border)', margin: '4px 0' }} />

                    {/* Logout Menu */}
                    <div 
                      onClick={() => {
                        setVoterDropdownOpen(false);
                        handleLogout();
                      }}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} />
                      <span>Keluar</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div 
          className="dashboard-container animate-slideup"
          style={activeMenu === 'vote' ? { maxWidth: '100%', margin: '0 auto', padding: '24px 0', width: '100%', boxSizing: 'border-box' } : { padding: '24px', boxSizing: 'border-box' }}
        >
          <div style={{
            paddingLeft: activeMenu === 'vote' ? '24px' : '0',
            paddingRight: activeMenu === 'vote' ? '24px' : '0'
          }}>
            {renderActiveView()}
          </div>
        </div>

        {voteConfirmModal && (
          <div className="modal-backdrop" onClick={() => setVoteConfirmModal(null)}>
            <div className="modal-card animate-slideup" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                  <Award size={20} /> Konfirmasi Pilihan Suara
                </h3>
              </div>
              <div style={{ padding: '20px 24px', textAlign: 'left', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-dark)' }}>
                Apakah Anda yakin ingin menyalurkan suara Anda untuk paslon <strong>{voteConfirmModal.candidateName}</strong>?
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.08)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  ⚠️ Pilihan Anda bersifat final dan <strong>tidak dapat diubah atau ditarik kembali</strong> setelah dikirim.
                </p>
              </div>
              <div className="modal-actions" style={{ padding: '0 24px 24px', marginTop: 0 }}>
                <button type="button" className="btn-secondary-sm" onClick={() => setVoteConfirmModal(null)}>Batal</button>
                <button 
                  type="button" 
                  className="btn-primary-sm" 
                  style={{ background: 'var(--danger)', border: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', color: '#fff' }}
                  onClick={handleConfirmVoteSubmit}
                >
                  Kirim Suara Saya
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`toast-notification toast-${toast.type} toast-slide-up`} style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            minWidth: '300px',
            padding: '14px 20px',
            paddingBottom: '18px',
            borderRadius: '12px',
            background: toast.type === 'success' ? '#2e7d32' : toast.type === 'error' ? '#d32f2f' : '#0288d1',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontWeight: 500,
            fontSize: '14px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {toast.type === 'success' && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
              {toast.type === 'error' && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>⚠</span>}
              {toast.type === 'info' && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>ℹ</span>}
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={() => setToast(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'var(--transition)',
                outline: 'none'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              aria-label="Close Toast"
            >
              ✕
            </button>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '4px',
              background: 'rgba(255,255,255,0.4)',
            }} className="toast-progress-bar" />
          </div>
        )}
      </div>
    );
  }

  // Superadmin layout with sidebar menu
  return (
    <div className="admin-layout animate-slideup">
      {/* Sidebar on Left */}
      <div className="theme-card sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingLeft: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {systemSettings?.systemlogo ? (
              <img src={systemSettings.systemlogo} alt="System Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
            ) : (
              <Building size={28} color="var(--secondary-blue)" />
            )}
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {systemSettings?.systemname || 'E-OSIS'}
            </span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            style={{ 
              padding: '6px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              background: 'transparent', 
              border: '1px solid var(--card-border)', 
              color: 'var(--text-dark)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }} 
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>

        {/* Scrollable menu content */}
        <div className="sidebar-scrollable-content" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px', marginBottom: '16px' }}>
          {/* Menu Utama */}
          <div className="sidebar-menu-section" style={{ marginBottom: 0 }}>
            <div className="sidebar-menu-title">Menu Utama</div>
            <div className={`sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
              <Grid size={16} /> Dashboard
            </div>

            <div className={`sidebar-item ${activeMenu === 'kandidat' ? 'active' : ''}`} onClick={() => navigate('/candidates')}>
              <Users size={16} /> Kandidat OSIS
            </div>
            <div className={`sidebar-item ${activeMenu === 'kas-osis' ? 'active' : ''}`} onClick={() => navigate('/kas-osis')}>
              <DollarSign size={16} /> Kas OSIS
            </div>
            <div className={`sidebar-item ${activeMenu === 'proker' ? 'active' : ''}`} onClick={() => navigate('/proker')}>
              <Briefcase size={16} /> Program Kerja
            </div>
          </div>

          {/* Manage Data Accordion */}
          {userData.role === 'superadmin' && (
            <div className="sidebar-menu-section" style={{ marginBottom: 0 }}>
              <div 
                className="sidebar-item" 
                onClick={toggleManageData}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Database size={16} />
                  <span>Manage Data</span>
                </div>
                {isManageDataOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {isManageDataOpen && (
                <div>
                  <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-class' ? 'active' : ''}`} onClick={() => navigate('/manage-class')}>
                    Manage Class
                  </div>
                  <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-grade' ? 'active' : ''}`} onClick={() => navigate('/manage-grade')}>
                    Manage Grade
                  </div>
                  <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-major' ? 'active' : ''}`} onClick={() => navigate('/manage-major')}>
                    Manage Major
                  </div>
                  <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-period' ? 'active' : ''}`} onClick={() => navigate('/manage-period')}>
                    Manage Period
                  </div>
                  <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-user' ? 'active' : ''}`} onClick={() => navigate('/manage-user')}>
                    Manage User
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Accordion */}
          {userData.role === 'superadmin' && (
            <div className="sidebar-menu-section" style={{ marginBottom: 0 }}>
              <div 
                className="sidebar-item" 
                onClick={toggleSettings}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </div>
                {isSettingsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {isSettingsOpen && (
                <div>
                  <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'system-setting' ? 'active' : ''}`} onClick={() => navigate('/system-setting')}>
                    System Setting
                  </div>
                  <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'backup-db' ? 'active' : ''}`} onClick={() => navigate('/backup-db')}>
                    Backup Database
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Accordion */}
          <div className="sidebar-menu-section" style={{ marginBottom: 0 }}>
            <div 
              className="sidebar-item" 
              onClick={toggleAccount}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserIcon size={16} />
                <span>Account</span>
              </div>
              {isAccountOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {isAccountOpen && (
              <div>
                <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => {
                  navigate('/profile');
                  setEditEmail(userData?.email || '');
                  setEditPassword('');
                  setEditConfirmPassword('');
                  setEditProfileError('');
                  setEditProfileSuccess('');
                }}>
                  Profile
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Menu Item */}
        <div className="sidebar-menu-section" style={{ marginTop: 'auto', marginBottom: 0, paddingTop: '16px', borderTop: '1px solid var(--card-border)', flexShrink: 0 }}>
          <div className="sidebar-item" onClick={handleLogout} style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content Area on Right */}
      <div className="main-content">
        {activeMenu === 'dashboard' && (
          <div className="dashboard-banner">
            <div className="welcome-section" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <h1>Selamat Datang, {userData.username}!</h1>
                <p>{systemSettings?.systemname || 'Sistem Informasi OSIS & Manajemen Level Akun'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Active view component loaded here */}
        {renderActiveView()}
      </div>

      {/* Admin Management Modals */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card animate-slideup" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {activeModal === 'add-class' && 'Tambah Kelas Baru'}
                {activeModal === 'edit-class' && 'Edit Kelas'}
                {activeModal === 'add-grade' && 'Tambah Grade Baru'}
                {activeModal === 'edit-grade' && 'Edit Grade'}
                {activeModal === 'add-major' && 'Tambah Jurusan Baru'}
                {activeModal === 'edit-major' && 'Edit Jurusan'}
                {activeModal === 'add-period' && 'Tambah Periode Baru'}
                {activeModal === 'edit-period' && 'Edit Periode'}
                {activeModal === 'add-user' && 'Tambah Pengguna Baru'}
                {activeModal === 'edit-user' && 'Edit Pengguna'}
                {activeModal === 'reset-password' && 'Reset Password Pengguna'}
                {activeModal === 'add-candidate' && 'Tambah Kandidat OSIS Baru'}
                {activeModal === 'add-expense' && 'Tambah Catatan Pengeluaran Kas'}
                {activeModal === 'add-proker' && 'Tambah Program Kerja OSIS'}
                {activeModal === 'edit-proker' && 'Edit Program Kerja OSIS'}
              </h3>
              <button className="modal-close-btn" onClick={() => {
                setActiveModal(null);
                setEditingItem(null);
              }}>&times;</button>
            </div>

            {activeModal === 'add-class' && (
              <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Kelas</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: XII RPL 1" value={newClassname} onChange={e => setNewClassname(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)} required>
                    <option value="">Pilih Grade</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.gradename}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jurusan</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedMajorId} onChange={e => setSelectedMajorId(e.target.value)} required>
                    <option value="">Pilih Jurusan</option>
                    {majors.map(m => <option key={m.id} value={m.id}>{m.majorname} ({m.majorcode})</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => setActiveModal(null)}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'add-grade' && (
              <form onSubmit={handleAddGrade} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Grade</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: X" value={newGradename} onChange={e => setNewGradename(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => setActiveModal(null)}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'add-major' && (
              <form onSubmit={handleAddMajor} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Kode Jurusan</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: RPL" value={newMajorcode} onChange={e => setNewMajorcode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Jurusan</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: Rekayasa Perangkat Lunak" value={newMajorname} onChange={e => setNewMajorname(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => setActiveModal(null)}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {(activeModal === 'add-period' || activeModal === 'edit-period') && (
              <form onSubmit={activeModal === 'edit-period' ? handleEditPeriodSubmit : handleAddPeriod} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Tahun Ajaran Periode</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: 2027/2028" value={newPeriodYear} onChange={e => setNewPeriodYear(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={newPeriodStatus} onChange={e => setNewPeriodStatus(e.target.value)} required>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Waktu Mulai Voting</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    value={newPeriodVoteStart} 
                    onChange={e => setNewPeriodVoteStart(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Waktu Selesai Voting</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    value={newPeriodVoteEnd} 
                    onChange={e => setNewPeriodVoteEnd(e.target.value)} 
                    required 
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'add-user' && (
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Masukkan username" value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Masukkan password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: user@email.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Level Akses</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserLevel} onChange={e => {
                    setNewUserLevel(e.target.value);
                    setNewUserRole('');
                  }} required>
                    <option value="student">Student (Siswa)</option>
                    <option value="school">School (Pihak Sekolah)</option>
                    <option value="employer">Employer (Mitra Industri)</option>
                  </select>
                </div>
                
                {newUserLevel === 'student' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Pilih Kelas</label>
                      <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserClassId} onChange={e => setNewUserClassId(e.target.value)} required>
                        <option value="">Pilih Kelas</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.classname}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role OSIS (Opsional)</label>
                      <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                        <option value="">Bukan Pengurus (null)</option>
                        <option value="members">Members</option>
                        <option value="president">President</option>
                        <option value="vice president">Vice President</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="secretaris">Secretaris</option>
                      </select>
                    </div>
                  </>
                )}

                {newUserLevel === 'school' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Sekolah (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="">Pilih Jabatan</option>
                      <option value="principal">Principal (Kepala Sekolah)</option>
                      <option value="viceprincipal">Vice Principal (Wakil Kepsek)</option>
                      <option value="student affair">Student Affair (Kesiswaan)</option>
                      <option value="teacher">Teacher (Guru)</option>
                    </select>
                  </div>
                )}

                {newUserLevel === 'employer' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Mitra (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="members">Members (Anggota)</option>
                    </select>
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => setActiveModal(null)}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'edit-class' && (
              <form onSubmit={handleEditClassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Kelas</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: XII RPL 1" value={newClassname} onChange={e => setNewClassname(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedGradeId} onChange={e => setSelectedGradeId(e.target.value)} required>
                    <option value="">Pilih Grade</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.gradename}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jurusan</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedMajorId} onChange={e => setSelectedMajorId(e.target.value)} required>
                    <option value="">Pilih Jurusan</option>
                    {majors.map(m => <option key={m.id} value={m.id}>{m.majorname} ({m.majorcode})</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'edit-grade' && (
              <form onSubmit={handleEditGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Grade</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: X" value={newGradename} onChange={e => setNewGradename(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'edit-major' && (
              <form onSubmit={handleEditMajorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Kode Jurusan</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: RPL" value={newMajorcode} onChange={e => setNewMajorcode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Jurusan</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: Rekayasa Perangkat Lunak" value={newMajorname} onChange={e => setNewMajorname(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}



            {activeModal === 'edit-user' && (
              <form onSubmit={handleEditUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Username (Tidak dapat diubah)</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px', opacity: 0.6 }} value={newUserUsername} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Password Baru (Kosongkan jika tidak diubah)</label>
                  <input type="password" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Masukkan password baru" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: user@email.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Level Akses (Tidak dapat diubah)</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px', opacity: 0.6 }} value={newUserLevel} disabled />
                </div>
                
                {newUserLevel === 'student' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Pilih Kelas</label>
                      <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserClassId} onChange={e => setNewUserClassId(e.target.value)} required>
                        <option value="">Pilih Kelas</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.classname}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role OSIS (Opsional)</label>
                      <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                        <option value="">Bukan Pengurus (null)</option>
                        <option value="members">Members</option>
                        <option value="president">President</option>
                        <option value="vice president">Vice President</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="secretaris">Secretaris</option>
                      </select>
                    </div>
                  </>
                )}

                {newUserLevel === 'school' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Sekolah (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="">Pilih Jabatan</option>
                      <option value="principal">Principal (Kepala Sekolah)</option>
                      <option value="viceprincipal">Vice Principal (Wakil Kepsek)</option>
                      <option value="student affair">Student Affair (Kesiswaan)</option>
                      <option value="teacher">Teacher (Guru)</option>
                    </select>
                  </div>
                )}

                {newUserLevel === 'employer' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Mitra (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="members">Members (Anggota)</option>
                    </select>
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'reset-password' && (
              <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px', opacity: 0.6 }} value={editingItem?.username || ''} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Password Baru (Min. 6 Karakter)</label>
                  <input type="password" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Masukkan password baru untuk user ini" value={resetPasswordNewVal} onChange={e => setResetPasswordNewVal(e.target.value)} required minLength={6} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); setResetPasswordNewVal(''); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Reset Password</button>
                </div>
              </form>
            )}

            {(activeModal === 'add-candidate' || activeModal === 'edit-candidate') && (
              <form onSubmit={activeModal === 'edit-candidate' ? handleEditCandidate : handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">No. Urut Paslon</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: 03" value={newCandidatePaslonNo} onChange={e => setNewCandidatePaslonNo(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pilih Calon Ketua OSIS (President)</label>
                  <select 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }}
                    value={selectedPresidentId}
                    onChange={e => {
                      setSelectedPresidentId(e.target.value);
                      if (e.target.value === selectedVicePresidentId) {
                        setSelectedVicePresidentId('');
                      }
                    }}
                    required
                  >
                    <option value="">Pilih Siswa (Level Student)</option>
                    {users.filter(u => u.level === 'student' && !existingCandidateUserIds.has(u.id)).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.username} {u.classname !== '-' ? `(${u.classname})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pilih Calon Wakil Ketua OSIS (Vice President)</label>
                  <select 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }}
                    value={selectedVicePresidentId}
                    onChange={e => setSelectedVicePresidentId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Siswa (Level Student)</option>
                    {users
                      .filter(u => u.level === 'student' && u.id !== selectedPresidentId && !existingCandidateUserIds.has(u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.username} {u.classname !== '-' ? `(${u.classname})` : ''}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kelas / Jurusan</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: XII RPL 1 & XII RPL 2" value={newCandidateClasses} onChange={e => setNewCandidateClasses(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Visi</label>
                  <textarea className="form-input" style={{ paddingLeft: '16px', minHeight: '60px' }} placeholder="Visi kandidat..." value={newCandidateVisi} onChange={e => setNewCandidateVisi(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Misi</label>
                  <textarea className="form-input" style={{ paddingLeft: '16px', minHeight: '60px' }} placeholder="Misi kandidat..." value={newCandidateMisi} onChange={e => setNewCandidateMisi(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Foto Calon</label>
                  <input 
                    type="file" 
                    className="form-input" 
                    style={{ paddingLeft: '16px', paddingTop: '6px' }} 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewCandidatePhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  {newCandidatePhoto && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={newCandidatePhoto} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Preview Foto</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Pilih Periode Pemilihan</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={newCandidatePeriodId} onChange={e => setNewCandidatePeriodId(e.target.value)} required>
                    <option value="">Pilih Periode</option>
                    {periods.map(p => <option key={p.id} value={p.id}>{p.yearLabel} ({p.status})</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'add-expense' && (
              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Keterangan / Keperluan Pengeluaran</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: Konsumsi Rapat Anggota" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah Dana (Rp)</label>
                  <input type="number" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: 50000" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Transaksi</label>
                  <input type="date" className="form-input" style={{ paddingLeft: '16px' }} value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan Catatan</button>
                </div>
              </form>
            )}

            {(activeModal === 'add-proker' || activeModal === 'edit-proker') && (
              <form onSubmit={activeModal === 'edit-proker' ? handleEditProker : (e) => handleAddProker(e, periods.find(p => p.status === 'active')?.id || periods[0]?.id || 'p3')} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Program Kerja</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    placeholder="Contoh: LDKS Pengurus OSIS" 
                    value={prokerName} 
                    onChange={e => setProkerName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deskripsi Program</label>
                  <textarea 
                    className="form-input" 
                    style={{ paddingLeft: '16px', minHeight: '80px' }} 
                    placeholder="Jelaskan detail/maksud program..." 
                    value={prokerDesc} 
                    onChange={e => setProkerDesc(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Pelaksanaan</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    placeholder="Contoh: September 2026 atau Akhir Ujian Semester" 
                    value={prokerTargetDate} 
                    onChange={e => setProkerTargetDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status Program</label>
                  <select 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    value={prokerStatus} 
                    onChange={e => setProkerStatus(e.target.value)}
                  >
                    <option value="Rencana">Rencana</option>
                    <option value="Berjalan">Sedang Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {voteConfirmModal && (
        <div className="modal-backdrop" onClick={() => setVoteConfirmModal(null)}>
          <div className="modal-card animate-slideup" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <Award size={20} /> Konfirmasi Pilihan Suara
              </h3>
            </div>
            <div style={{ padding: '20px 24px', textAlign: 'left', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-dark)' }}>
              Apakah Anda yakin ingin menyalurkan suara Anda untuk paslon <strong>{voteConfirmModal.candidateName}</strong>?
              <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.08)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                ⚠️ Pilihan Anda bersifat final dan <strong>tidak dapat diubah atau ditarik kembali</strong> setelah dikirim.
              </p>
            </div>
            <div className="modal-actions" style={{ padding: '0 24px 24px', marginTop: 0 }}>
              <button type="button" className="btn-secondary-sm" onClick={() => setVoteConfirmModal(null)}>Batal</button>
              <button 
                type="button" 
                className="btn-primary-sm" 
                style={{ background: 'var(--danger)', border: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', color: '#fff' }}
                onClick={handleConfirmVoteSubmit}
              >
                Kirim Suara Saya
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast-notification toast-${toast.type} toast-slide-up`} style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          minWidth: '300px',
          padding: '14px 20px',
          paddingBottom: '18px',
          borderRadius: '12px',
          background: toast.type === 'success' ? '#2e7d32' : toast.type === 'error' ? '#d32f2f' : '#0288d1',
          color: '#fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontWeight: 500,
          fontSize: '14px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
            {toast.type === 'error' && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>⚠</span>}
            {toast.type === 'info' && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>ℹ</span>}
            <span>{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'var(--transition)',
              outline: 'none'
            }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            aria-label="Close Toast"
          >
            ✕
          </button>
          
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            background: 'rgba(255,255,255,0.4)',
          }} className="toast-progress-bar" />
        </div>
      )}
    </div>
  );
};

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [systemSettings, setSystemSettings] = useState<SystemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Redirect if already logged in and fetch system settings
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const isTeacher = user.level === 'school' && user.role === 'teacher';
        const isStudentNoRole = user.level === 'student' && (!user.role || user.role === '-' || user.role === 'members' || user.role === 'student');
        if (isTeacher || isStudentNoRole) {
          navigate('/', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        navigate('/', { replace: true });
      }
      return;
    }

    const fetchSystem = async () => {
      try {
        const system = await authApi.getSystemSettings();
        setSystemSettings(system);
        document.title = `Login - ${system.systemname}`;
        if (system.systemfavicon) {
          updateFavicon(system.systemfavicon);
        }
      } catch (err) {
        console.error('Failed to load system settings', err);
        document.title = 'Login - E-OSIS';
      }
    };
    fetchSystem();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan password tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const user = data.user;
      const isTeacher = user.level === 'school' && user.role === 'teacher';
      const isStudentNoRole = user.level === 'student' && (!user.role || user.role === '-' || user.role === 'members' || user.role === 'student');
      
      if (isTeacher || isStudentNoRole) {
        navigate('/', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.';
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-slideup">
      <div className="theme-card login-card">
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="login-header">
          <div className="login-logo-glow" style={{ overflow: 'hidden' }}>
            {systemSettings?.systemlogo ? (
              <img src={systemSettings.systemlogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Lock size={26} />
            )}
          </div>
          <h1 className="login-title">{systemSettings?.systemname || 'Akses Akun'}</h1>
          <p className="login-subtitle">Silakan login dengan akun Anda</p>
        </div>

        {error && (
          <div className="error-banner">
            <ShieldAlert size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-wrapper">
              <UserIcon className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        <div className="demo-accounts">
          <p>Demo akun (username / password):</p>
          <div className="demo-account-row">
            <span>Superadmin</span>
            <code>superadmin / password123</code>
          </div>
          <div className="demo-account-row">
            <span>Siswa (Student)</span>
            <code>student / password123</code>
          </div>
          <div className="demo-account-row">
            <span>Sekolah (School)</span>
            <code>school / password123</code>
          </div>
          <div className="demo-account-row">
            <span>Mitra (Employer)</span>
            <code>employer / password123</code>
          </div>
        </div>

        {systemSettings && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--card-border)', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            {systemSettings.systemaddress && <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{systemSettings.systemaddress}</p>}
            {systemSettings.systemcontact && <p style={{ margin: 0 }}>{systemSettings.systemcontact}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// Root Router App
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

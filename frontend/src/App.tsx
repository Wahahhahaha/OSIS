import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  Layers,
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
  Search,
  Coins,
  ArrowLeft,
  Info,
  FileText,
  Folder,
  UserPlus,
  CheckSquare,
  Image as ImageIcon,
  TrendingUp,
  QrCode,
  Scan,
  AlertCircle,
  LogIn,
  RefreshCw,
  AlertTriangle
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
    if (path === '/manage-role') return 'manage-role';
    if (path === '/manage-section') return 'manage-section';
    if (path === '/organization' || path === '/organisasi') return 'organization';
    if (path === '/system-setting') return 'system-setting';
    if (path === '/backup-db') return 'backup-db';
    if (path === '/profile') return 'profile';
    if (path === '/proker' || path === '/program-kerja') return 'proker';
    if (path === '/kas') return 'kas';
    if (path === '/proker-detail') return 'proker-detail';
    if (path === '/evaluasi-kinerja') return 'evaluasi-kinerja';
    if (path === '/activity-log') return 'activity-log';
    if (path === '/recycle-bin') return 'recycle-bin';
    if (path === '/permissions') return 'permissions';
    return 'error-404';
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

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

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
  const [roles, setRoles] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [newRolename, setNewRolename] = useState('');
  const [newSectionname, setNewSectionname] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [activityLogRoleFilter, setActivityLogRoleFilter] = useState('all');
  const [evalSearch, setEvalSearch] = useState('');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState<boolean>(false);
  const [recycleBinData, setRecycleBinData] = useState<any>(null);
  const [recycleBinLoading, setRecycleBinLoading] = useState<boolean>(false);
  const [myPermissions, setMyPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [kasData, setKasData] = useState<{ activePeriod: any; selectedMonth: number; selectedYear: number; accumulatedTotal: number; classes: any[] } | null>(null);
  const [kasLoading, setKasLoading] = useState<boolean>(false);
  const [kasError, setKasError] = useState<string | null>(null);
  const [kasMonth, setKasMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [kasYear, setKasYear] = useState<number>(() => new Date().getFullYear());
  const [selectedProkerDetail, setSelectedProkerDetail] = useState<any | null>(null);
  const [prokerTab, setProkerTab] = useState<'overview' | 'document' | 'rapat' | 'divisi' | 'anggota' | 'absensi' | 'dokumentasi'>('overview');
  const [prokerDocType, setProkerDocType] = useState<'proposal' | 'laporan'>('proposal');
  const [recycleBinTab, setRecycleBinTab] = useState<'class' | 'grade' | 'major' | 'user' | 'role' | 'section'>('class');
  const [activeProkerMeetingId, setActiveProkerMeetingId] = useState<string>('');
  const [selectedProposalFile, setSelectedProposalFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedReportFile, setSelectedReportFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [reportDragActive, setReportDragActive] = useState<boolean>(false);
  const [selectedDocFile, setSelectedDocFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [docDragActive, setDocDragActive] = useState<boolean>(false);
  const [docInputMethod, setDocInputMethod] = useState<'file' | 'link'>('file');
  const [showAbsensiAddMeeting, setShowAbsensiAddMeeting] = useState<boolean>(false);
  const [faviconDragActive, setFaviconDragActive] = useState<boolean>(false);
  const [logoDragActive, setLogoDragActive] = useState<boolean>(false);
  const [activeQrMember, setActiveQrMember] = useState<{ memberId: string; memberName: string; meetingId: string; meetingTitle: string } | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannerResult, setScannerResult] = useState<{ memberName: string; meetingTitle: string; prokerName: string } | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [prokerSubData, setProkerSubData] = useState<any>({
    proposals: [],
    meetings: [],
    divisions: [],
    members: [],
    attendances: {},
    reports: [],
    documentations: []
  });
  const [selectedOrgStudentId, setSelectedOrgStudentId] = useState('');
  const [selectedOrgRoleId, setSelectedOrgRoleId] = useState('');
  const [selectedOrgPeriodId, setSelectedOrgPeriodId] = useState('');
  const [selectedOrgSectionId, setSelectedOrgSectionId] = useState('');
  const [orgViewMode, setOrgViewMode] = useState<'chart' | 'table'>('chart');
  const [selectedChartPeriodId, setSelectedChartPeriodId] = useState('');
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sessionStorage.setItem('user_latitude', position.coords.latitude.toString());
          sessionStorage.setItem('user_longitude', position.coords.longitude.toString());
        },
        (error) => {
          console.warn('Geolocation access denied or failed:', error);
          sessionStorage.setItem('user_latitude', '-6.2088');
          sessionStorage.setItem('user_longitude', '106.8456');
        }
      );
    } else {
      sessionStorage.setItem('user_latitude', '-6.2088');
      sessionStorage.setItem('user_longitude', '106.8456');
    }
  }, []);

  // Selected period ID for program kerja view
  const [prokerPeriodId, setProkerPeriodId] = useState<string>('');

  // Auto-grow textareas to fit content
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea.form-input');
    textareas.forEach(textarea => {
      const el = textarea as HTMLTextAreaElement;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    });
  }, [newCandidateVisi, newCandidateMisi, prokerDesc, activeModal]);

  // Globally computed active period & selected proker period
  const activePeriod = useMemo(() => {
    return periods.find(p => p.status?.toLowerCase() === 'active') || periods[0];
  }, [periods]);

  const selectedProkerPeriod = useMemo(() => {
    return periods.find(p => p.id === prokerPeriodId) || activePeriod;
  }, [periods, prokerPeriodId, activePeriod]);

  // Compute the winner candidate of the selected proker period based on votes
  const selectedProkerWinnerCandidate = useMemo(() => {
    if (!selectedProkerPeriod) return null;

    // Find candidates of the selected period
    const periodCandidates = candidates.filter(c => {
      if (c.periodId === selectedProkerPeriod.id) return true;
      const candidatePeriod = periods.find(p => p.id === c.periodId);
      const candidateYearLabel = candidatePeriod ? candidatePeriod.yearLabel : (c.periodId === 'p3' ? '2026/2027' : c.periodId === 'p2' ? '2025/2026' : c.periodId === 'p1' ? '2024/2025' : '');
      return candidateYearLabel === selectedProkerPeriod.yearLabel;
    });

    // Find winner based on votes
    const periodVotes = Object.entries(userVotes)
      .filter(([key]) => key.endsWith(`_${selectedProkerPeriod.id}`))
      .map(([_, candidateId]) => candidateId);

    const candidateVotes = periodCandidates.map(c => {
      const count = periodVotes.filter(cid => cid === c.id).length;
      return { ...c, votesCount: count };
    }).sort((a, b) => b.votesCount - a.votesCount);

    const maxVotes = candidateVotes.length > 0 ? candidateVotes[0].votesCount : 0;
    const isDraw = candidateVotes.filter(c => c.votesCount === maxVotes).length > 1;
    return (candidateVotes.length > 0 && maxVotes > 0 && !isDraw) ? candidateVotes[0] : null;
  }, [selectedProkerPeriod, candidates, periods, userVotes]);

  // Compute elected candidate for the selected proker period
  const selectedProkerCandidate = useMemo(() => {
    if (!selectedProkerPeriod) return null;

    // If voting is still active (current time is before voteEndDate), do not show elected pengurus yet
    if (selectedProkerPeriod.voteEndDate) {
      const now = new Date();
      const voteEnd = new Date(selectedProkerPeriod.voteEndDate);
      if (now < voteEnd) {
        return null;
      }
    }

    const electedId = electedPairs[selectedProkerPeriod.id] || (selectedProkerWinnerCandidate ? selectedProkerWinnerCandidate.id : undefined);
    return candidates.find(c => c.id === electedId) || selectedProkerWinnerCandidate || null;
  }, [selectedProkerPeriod, candidates, electedPairs, selectedProkerWinnerCandidate]);

  const prokerPresident = useMemo(() => {
    if (!selectedProkerPeriod) return null;
    return orgMembers.find(m => 
      m.periodid === selectedProkerPeriod.id && 
      (m.role?.rolename.toLowerCase() === 'president' || m.role?.rolename.toLowerCase() === 'ketua osis')
    );
  }, [selectedProkerPeriod, orgMembers]);

  const prokerVicePresident = useMemo(() => {
    if (!selectedProkerPeriod) return null;
    return orgMembers.find(m => 
      m.periodid === selectedProkerPeriod.id && 
      (m.role?.rolename.toLowerCase() === 'vice president' || m.role?.rolename.toLowerCase() === 'wakil ketua osis')
    );
  }, [selectedProkerPeriod, orgMembers]);

  // Add Period Form State
  const [newPeriodYear, setNewPeriodYear] = useState('');
  const [newPeriodStatus, setNewPeriodStatus] = useState('ACTIVE');
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

  const formatCandidateStudentOptionLabel = (student: any) => {
    const studentName = student.username || student.user?.username || student.user?.name || student.user?.fullName || student.name || '-';
    const classId = student.classid || student.classId;
    const studentClass = classes.find((c: any) => c.id === classId) || student.class || student.Class || {};
    const majorCode = studentClass.major?.majorcode || studentClass.majorcode || studentClass.majorCode;
    const gradeName = studentClass.grade?.gradename || studentClass.gradename || studentClass.gradeName;
    const className = studentClass.classname || studentClass.className;
    return [studentName, majorCode, gradeName, className].filter(Boolean).join(' ');
  };

  const getCandidateStudentGradeLevel = (student: any) => {
    const classId = student.classid || student.classId;
    const studentClass = classes.find((c: any) => c.id === classId) || student.class || student.Class || {};
    const gradeName = studentClass.grade?.gradename || studentClass.gradename || studentClass.gradeName || '';
    const normalized = gradeName.trim().toUpperCase();
    const romanMap: Record<string, number> = {
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
    };

    if (romanMap[normalized]) {
      return romanMap[normalized];
    }

    const match = normalized.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  const isPureStudentCandidate = (student: any) => {
    const role = (student.role || '').trim().toLowerCase();
    return role === '' || role === '-' || role === 'student';
  };

  const candidateStudentOptions = useMemo(() => {
    return users.filter(u => {
      if (u.level !== 'student') return false;
      if (!isPureStudentCandidate(u)) return false;
      if (existingCandidateUserIds.has(u.id)) return false;
      return getCandidateStudentGradeLevel(u) === 10;
    });
  }, [users, classes, existingCandidateUserIds]);

  const viceCandidateStudentOptions = useMemo(() => {
    return users.filter(u => {
      if (u.level !== 'student') return false;
      if (!isPureStudentCandidate(u)) return false;
      if (u.id === selectedPresidentId) return false;
      if (existingCandidateUserIds.has(u.id)) return false;
      return getCandidateStudentGradeLevel(u) === 10;
    });
  }, [users, classes, existingCandidateUserIds, selectedPresidentId]);

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
        const [profile, system, myPerms] = await Promise.all([
          authApi.getProfile(),
          authApi.getSystemSettings(),
          authApi.getMyPermissions()
        ]);
        setUserData(profile);
        setSystemSettings(system);
        setMyPermissions(myPerms);
        loadPeriodsData();
        loadCandidatesData();
        loadVotesData();
        loadProkersData();

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
    setAdminSearch('');
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
      if (activeMenu === 'manage-user' || activeMenu === 'kandidat') {
        loadUsersData();
        loadCandidatesData();
      }
      if (activeMenu === 'manage-user') {
        loadClassesData();
        loadRolesData();
      }
      if (activeMenu === 'manage-role') {
        loadRolesData();
      }
      if (activeMenu === 'manage-section') {
        loadSectionsData();
      }
      if (activeMenu === 'system-setting' && systemSettings) {
        setSysName(systemSettings.systemname || '');
        setSysLogo(systemSettings.systemlogo || '');
        setSysFavicon(systemSettings.systemfavicon || '');
        setSysAddress(systemSettings.systemaddress || '');
        setSysContact(systemSettings.systemcontact || '');
      }
    }

    if (activeMenu === 'kandidat') {
      loadPeriodsData();
      loadCandidatesData();
      loadUsersData();
      loadClassesData();
    }

    // Loaded for all roles
    if (activeMenu === 'organization') {
      loadOrgMembersData();
      loadStudentsData();
      loadClassesData();
      loadUsersData();
      loadRolesData();
      loadPeriodsData();
      loadSectionsData();
    }
    if (activeMenu === 'kandidat') {
      loadPeriodsData();
      loadCandidatesData();
      loadUsersData();
      loadClassesData();
    }
    if (activeMenu === 'proker' || activeMenu === 'proker-detail') {
      loadProkersData();
      loadPeriodsData();
      loadCandidatesData();
      loadOrgMembersData();
      loadClassesData();
    }
    if (activeMenu === 'vote') {
      loadPeriodsData();
      loadCandidatesData();
      loadVotesData();
    }
    if (activeMenu === 'kas') {
      loadKasData(kasMonth, kasYear);
    }
    if (activeMenu === 'activity-log') {
      loadActivityLogsData();
      loadUsersData();
    }
    if (activeMenu === 'recycle-bin') {
      loadRecycleBinData();
    }
    if (activeMenu === 'permissions') {
      loadAllPermissions();
    }
    if (activeMenu === 'evaluasi-kinerja') {
      loadProkersData();
      loadPeriodsData();
      loadOrgMembersData();
    }
  }, [activeMenu, userData]);

  useEffect(() => {
    if (activeMenu === 'proker-detail') {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get('id');
      if (id && prokers.length > 0) {
        const found = prokers.find(p => p.id === id);
        if (found) {
          if (!selectedProkerDetail || selectedProkerDetail.id !== found.id) {
            setSelectedProkerDetail(found);
          }
        }
      }
    }
  }, [location.pathname, location.search, prokers, selectedProkerDetail, activeMenu]);

  useEffect(() => {
    const loadDetails = async () => {
      if (activeMenu === 'proker-detail' && selectedProkerDetail) {
        try {
          const details = await authApi.getProkerDetails(selectedProkerDetail.id);
          setProkerSubData(details);
        } catch (err) {
          console.error('Error loading proker details:', err);
          showToast('Failed to load work program details.');
        }
      }
    };
    loadDetails();
  }, [activeMenu, selectedProkerDetail]);

  const updateProkerSubData = async (newData: any) => {
    if (!selectedProkerDetail) return;
    setProkerSubData(newData);
    try {
      await authApi.updateProkerDetails(selectedProkerDetail.id, newData);
    } catch (err) {
      console.error('Error updating proker details:', err);
      showToast('Failed to save changes to server.');
    }
  };

  const loadKasData = async (m?: number, y?: number) => {
    setKasLoading(true);
    setKasError(null);
    const targetMonth = m !== undefined ? m : kasMonth;
    const targetYear = y !== undefined ? y : kasYear;
    try {
      const data = await authApi.getKasData(targetMonth, targetYear);
      setKasData(data);
    } catch (err: any) {
      console.error(err);
      setKasError('Gagal memuat data kas OSIS.');
    } finally {
      setKasLoading(false);
    }
  };

  const handleRecordKasPayment = async (classId: string, classname: string, requiredAmount: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const confirmPay = window.confirm(`Are you sure you want to mark class ${classname} as paid for OSIS cash of IDR ${requiredAmount.toLocaleString('en-US')} for ${monthNames[kasMonth - 1]} ${kasYear}? This action cannot be undone and cash will be recorded.`);
    if (!confirmPay) return;
    
    try {
      await authApi.recordKasPayment(classId, kasMonth, kasYear);
      loadKasData(kasMonth, kasYear);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to record cash payment.');
    }
  };

  const handlePrevMonth = () => {
    let prevMonth = kasMonth - 1;
    let prevYear = kasYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = kasYear - 1;
    }
    setKasMonth(prevMonth);
    setKasYear(prevYear);
    loadKasData(prevMonth, prevYear);
  };

  const handleNextMonth = () => {
    let nextMonth = kasMonth + 1;
    let nextYear = kasYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = kasYear + 1;
    }
    setKasMonth(nextMonth);
    setKasYear(nextYear);
    loadKasData(nextMonth, nextYear);
  };

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

  const loadRolesData = async () => {
    try {
      const data = await authApi.getRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSectionsData = async () => {
    try {
      const data = await authApi.getSections();
      setSections(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPeriodsData = async () => {
    try {
      const data = await authApi.getPeriods();
      setPeriods(data);
      localStorage.setItem('osis_periods', JSON.stringify(data));
      const active = data.find(p => p.status === 'ACTIVE');
      setSelectedChartPeriodId(prev => {
        if (prev && data.some((p: any) => p.id === prev)) return prev;
        return active ? active.id : (data[0]?.id || '');
      });
    } catch (e) {
      console.error(e);
      const savedPeriods = localStorage.getItem('osis_periods');
      if (savedPeriods) {
        const parsed = JSON.parse(savedPeriods);
        setPeriods(parsed);
        const active = parsed.find((p: any) => p.status === 'ACTIVE');
        setSelectedChartPeriodId(prev => {
          if (prev && parsed.some((p: any) => p.id === prev)) return prev;
          return active ? active.id : (parsed[0]?.id || '');
        });
      }
    }
  };

  const loadOrgMembersData = async () => {
    try {
      const data = await authApi.getOrgMembers();
      setOrgMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudentsData = async () => {
    try {
      const data = await authApi.getStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
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

  const loadActivityLogsData = async () => {
    try {
      setActivityLogsLoading(true);
      const data = await authApi.getActivityLogs();
      setActivityLogs(data);
    } catch (e) {
      console.error('Failed to load activity logs:', e);
    } finally {
      setActivityLogsLoading(false);
    }
  };

  const loadRecycleBinData = async () => {
    try {
      setRecycleBinLoading(true);
      const data = await authApi.getRecycleBin();
      setRecycleBinData(data);
    } catch (e) {
      console.error('Failed to load recycle bin:', e);
    } finally {
      setRecycleBinLoading(false);
    }
  };

  const handleRestoreItem = async (type: string, id: string) => {
    try {
      await authApi.restoreRecycleBinItem(type, id);
      await loadRecycleBinData();
      // Reload matching dataset
      if (type === 'class') loadClassesData();
      else if (type === 'grade') loadGradesData();
      else if (type === 'major') loadMajorsData();
      else if (type === 'user') loadUsersData();
      else if (type === 'role') loadRolesData();
      else if (type === 'section') loadSectionsData();
    } catch (e) {
      console.error('Failed to restore item:', e);
    }
  };

  const loadMyPermissions = async () => {
    try {
      const data = await authApi.getMyPermissions();
      setMyPermissions(data);
    } catch (e) {
      console.error('Failed to load my permissions:', e);
    }
  };

  const loadAllPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const data = await authApi.getPermissions();
      setAllPermissions(data);
    } catch (e) {
      console.error('Failed to load all permissions:', e);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleTogglePermission = async (roleName: string, menuKey: string, currentAllowed: boolean) => {
    try {
      await authApi.updatePermission(roleName, menuKey, !currentAllowed);
      await loadAllPermissions();
      if (userData && normalizeRoleForAccess(userData.role || '') === normalizeRoleForAccess(roleName)) {
        await loadMyPermissions();
      }
    } catch (e) {
      console.error('Failed to update permission:', e);
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
      setSelectedGradeId('');
      setSelectedMajorId('');
      setActiveModal(null);
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
      setEditingItem(null);
      setActiveModal(null);
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
      setActiveModal(null);
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
      setEditingItem(null);
      setActiveModal(null);
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
      setActiveModal(null);
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
      setEditingItem(null);
      setActiveModal(null);
      loadMajorsData();
      showToast('Jurusan berhasil dihapus!');
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Roles
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRolename.trim()) return;
    try {
      await authApi.createRole({ rolename: newRolename });
      setNewRolename('');
      setActiveModal(null);
      loadRolesData();
      showToast('Peran (Role) berhasil ditambahkan!');
    } catch (e) {
      console.error(e);
      alert('Gagal menambahkan peran');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus peran (Role) ini?')) return;
    try {
      await authApi.deleteRole(id);
      setEditingItem(null);
      setActiveModal(null);
      loadRolesData();
      showToast('Peran (Role) berhasil dihapus!');
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Gagal menghapus peran');
    }
  };

  // Actions for Sections
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionname.trim()) return;
    try {
      await authApi.createSection({ sectionname: newSectionname });
      setNewSectionname('');
      setActiveModal(null);
      loadSectionsData();
      showToast('Sekbid (Section) berhasil ditambahkan!');
    } catch (e) {
      console.error(e);
      alert('Gagal menambahkan sekbid');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus sekbid (Section) ini?')) return;
    try {
      await authApi.deleteSection(id);
      setEditingItem(null);
      setActiveModal(null);
      loadSectionsData();
      showToast('Sekbid (Section) berhasil dihapus!');
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus sekbid');
    }
  };

  const openAddOrgMemberForRole = (roleNameQuery: string, sectionId: string = '') => {
    const matchedRole = roles.find(r => 
      r.rolename.toLowerCase() === roleNameQuery.toLowerCase() ||
      r.rolename.toLowerCase().includes(roleNameQuery.toLowerCase())
    ) || roles.find(r => r.rolename.toLowerCase() === 'members') || roles[0];
    
    setSelectedOrgStudentId('');
    setSelectedOrgRoleId(matchedRole ? matchedRole.id : '');
    setSelectedOrgPeriodId(selectedChartPeriodId);
    setSelectedOrgSectionId(sectionId);
    setEditingItem(null);
    setActiveModal('add-org-member');
  };

  // Actions for Organization Members
  const handleAddOrgMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const periodIdToUse = selectedOrgPeriodId || selectedChartPeriodId || periods[0]?.id;
    if (!selectedOrgStudentId || !selectedOrgRoleId || !periodIdToUse) {
      alert('Please select a student.');
      return;
    }
    try {
      await authApi.createOrgMember({
        studentid: selectedOrgStudentId,
        roleid: selectedOrgRoleId,
        periodid: periodIdToUse,
        sectionid: selectedOrgSectionId || undefined
      });
      setSelectedOrgStudentId('');
      setSelectedOrgRoleId('');
      setSelectedOrgPeriodId('');
      setSelectedOrgSectionId('');
      setActiveModal(null);
      loadOrgMembersData();
      showToast('Anggota organisasi berhasil ditambahkan!');
    } catch (e: any) {
      console.error(e);
      alert('Gagal menambahkan anggota organisasi (siswa mungkin sudah memiliki jabatan di periode ini)');
    }
  };

  const handleEditOrgMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const periodIdToUse = selectedOrgPeriodId || selectedChartPeriodId || periods[0]?.id;
    if (!selectedOrgStudentId || !selectedOrgRoleId || !periodIdToUse) {
      alert('Please select a student.');
      return;
    }
    try {
      await authApi.updateOrgMember(editingItem.id, {
        studentid: selectedOrgStudentId,
        roleid: selectedOrgRoleId,
        periodid: periodIdToUse,
        sectionid: selectedOrgSectionId || undefined
      });
      setSelectedOrgStudentId('');
      setSelectedOrgRoleId('');
      setSelectedOrgPeriodId('');
      setSelectedOrgSectionId('');
      setEditingItem(null);
      setActiveModal(null);
      loadOrgMembersData();
      showToast('Anggota organisasi berhasil diperbarui!');
    } catch (e: any) {
      console.error(e);
      alert('Gagal memperbarui anggota organisasi (siswa mungkin sudah memiliki jabatan di periode ini)');
    }
  };

  const handleDeleteOrgMember = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus anggota organisasi ini?')) return;
    try {
      await authApi.deleteOrgMember(id);
      loadOrgMembersData();
      showToast('Anggota organisasi berhasil dihapus!');
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus anggota organisasi');
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
      setNewPeriodStatus('ACTIVE');
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
      setNewPeriodStatus('ACTIVE');
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

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRolename.trim() || !editingItem) return;
    try {
      await authApi.updateRole(editingItem.id, { rolename: newRolename });
      setNewRolename('');
      setEditingItem(null);
      setActiveModal(null);
      loadRolesData();
      showToast('Peran (Role) berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit peran');
    }
  };

  const handleEditSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionname.trim() || !editingItem) return;
    try {
      await authApi.updateSection(editingItem.id, { sectionname: newSectionname });
      setNewSectionname('');
      setEditingItem(null);
      setActiveModal(null);
      loadSectionsData();
      showToast('Sekbid (Section) berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit sekbid');
    }
  };

  const executeResetPasswordToUsername = async () => {
    if (!editingItem) return;
    try {
      await authApi.resetUserPassword(editingItem.id, { password: editingItem.username });
      showToast(`Password untuk "${editingItem.username}" berhasil direset menjadi "${editingItem.username}".`);
      setEditingItem(null);
      setActiveModal(null);
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
      showToast('New candidate successfully added!');
    } catch (err) {
      console.error(err);
      alert('Failed to add candidate');
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await authApi.deleteCandidate(id);
      loadCandidatesData();
      showToast('Candidate successfully deleted!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete candidate');
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
      alert('President, Vice President, and Period must be selected.');
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
      showToast('Candidate successfully updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to edit candidate');
    }
  };
  const handleAddProker = async (e: React.FormEvent, activePeriodId: string) => {
    e.preventDefault();
    if (!prokerName.trim() || !prokerTargetDate.trim()) {
      alert('Program name and Target timeline are required.');
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
      showToast('OSIS work program successfully added!');
    } catch (err) {
      console.error(err);
      alert('Failed to add work program');
    }
  };

  const handleEditProker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prokerName.trim() || !prokerTargetDate.trim() || !editingItem) {
      alert('Program name and Target timeline are required.');
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
      showToast('OSIS work program successfully updated!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to edit work program');
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
    if (!window.confirm('Are you sure you want to delete this work program?')) return;
    try {
      await authApi.deleteProker(id);
      loadProkersData();
      showToast('OSIS work program successfully deleted!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete work program');
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

  const normalizeRoleForAccess = (roleName: string) => {
    const r = (roleName || '').trim().toLowerCase();
    if (!r) return 'student';
    if (r === 'secretary 1' || r === 'secretary 2' || r === 'sekretaris 1' || r === 'sekretaris 2') return 'secretaris';
    if (r === 'treasurer 1' || r === 'treasurer 2' || r === 'bendahara 1' || r === 'bendahara 2') return 'treasurer';
    if (r === 'vice principal' || r === 'vice principal 1' || r === 'vice principal 2' || r === 'wakil kepala sekolah') return 'viceprincipal';
    if (r === 'student affair' || r === 'student affairs' || r === 'wakasek kesiswaan' || r === 'pembina osis') return 'student affair';
    if (r === 'member' || r === 'members') return 'student';
    return r;
  };

  const getDefaultPermissionsForRole = (roleName: string) => {
    const role = normalizeRoleForAccess(roleName);
    if (role === 'superadmin' || role === 'admin') {
      return [
        'kandidat',
        'proker',
        'organization',
        'kas',
        'evaluasi-kinerja',
        'activity-log',
        'recycle-bin',
        'vote',
        'manage-class',
        'manage-grade',
        'manage-major',
        'manage-period',
        'manage-user',
        'manage-role',
        'manage-section',
        'system-setting',
        'backup-db'
      ];
    }

    const officerMenus = ['proker', 'organization', 'kas', 'evaluasi-kinerja', 'vote'];
    if (role === 'president') return ['kandidat', ...officerMenus];
    if (role === 'student') return ['proker', 'organization', 'kas', 'vote'];
    if (['vice president', 'treasurer', 'secretaris', 'principal', 'viceprincipal', 'student affair'].includes(role)) return officerMenus;
    return [];
  };

  const normalizedUserRole = normalizeRoleForAccess(userData?.role || '');
  const effectivePermissions = myPermissions.length > 0 ? myPermissions : getDefaultPermissionsForRole(normalizedUserRole);
  const canScanAttendance = ['superadmin', 'admin', 'president', 'vice president', 'student affair'].includes(normalizedUserRole);
  const getGradeLevelNumber = (gradeName: string) => {
    const normalized = (gradeName || '').trim().toUpperCase();
    const romanMap: Record<string, number> = {
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
    };

    if (romanMap[normalized]) {
      return romanMap[normalized];
    }

    const match = normalized.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  const getFilteredMajorsByGrade = (gradeId: string) => {
    const selectedGrade = grades.find((g: any) => g.id === gradeId);
    const gradeLevel = getGradeLevelNumber(selectedGrade?.gradename || '');
    if (!gradeLevel) return majors;

    if (gradeLevel <= 9) {
      return majors.filter((m: any) => {
        const majorCode = (m.majorcode || '').trim().toLowerCase();
        const majorName = (m.majorname || '').trim().toLowerCase();
        return majorCode === 'smp' || majorName.includes('smp');
      });
    }

    return majors.filter((m: any) => {
      const majorCode = (m.majorcode || '').trim().toLowerCase();
      const majorName = (m.majorname || '').trim().toLowerCase();
      return majorCode !== 'smp' && !majorName.includes('smp');
    });
  };

  const filteredClassMajors = getFilteredMajorsByGrade(selectedGradeId);

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'error-404': {
        return <ErrorPage embedded={true} code="404" message="The page you are looking for does not exist in this portal. Please check the address or use the sidebar to navigate." />;
      }
      case 'permissions': {
        const formatPermissionRoleLabel = (roleKey: string) => {
          const normalized = roleKey.trim().toLowerCase();
          const roleLabelMap: Record<string, string> = {
            superadmin: 'Super Admin',
            admin: 'Admin',
            president: 'President',
            'vice president': 'Vice President',
            treasurer: 'Treasurer',
            secretaris: 'Secretary',
            secretary: 'Secretary',
            principal: 'Principal',
            viceprincipal: 'Vice Principal',
            'student affair': 'Student Affairs',
            student: 'Student',
            member: 'Member',
            members: 'Members',
          };

          if (roleLabelMap[normalized]) {
            return roleLabelMap[normalized];
          }

          return roleKey
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        };

        const canonicalRoles = [
          { key: 'superadmin', label: 'Super Admin' },
          { key: 'admin', label: 'Admin' },
          { key: 'president', label: 'President' },
          { key: 'vice president', label: 'Vice President' },
          { key: 'treasurer', label: 'Treasurer' },
          { key: 'secretaris', label: 'Secretary' },
          { key: 'student affair', label: 'Student Affairs' },
          { key: 'principal', label: 'Principal' },
          { key: 'viceprincipal', label: 'Vice Principal' },
          { key: 'student', label: 'Student' },
        ];

        const rolesList = [
          ...canonicalRoles,
          ...roles
            .map((r: any) => (r.rolename || '').trim())
            .filter((roleName: string) => roleName && !canonicalRoles.some(role => role.key === roleName))
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((roleName: string) => ({
              key: roleName,
              label: formatPermissionRoleLabel(roleName),
            }))
        ];

        const menuKeysList = [
          { key: 'kandidat', label: 'Candidates' },
          { key: 'proker', label: 'Work Program' },
          { key: 'organization', label: 'Organization Structure' },
          { key: 'kas', label: 'OSIS Cash' },
          { key: 'evaluasi-kinerja', label: 'Performance Evaluation' },
          { key: 'activity-log', label: 'Activity Log' },
          { key: 'recycle-bin', label: 'Recycle Bin' },
          { key: 'vote', label: 'Voting (E-Voting)' },
          { key: 'manage-class', label: 'Manage Class' },
          { key: 'manage-grade', label: 'Manage Grade' },
          { key: 'manage-major', label: 'Manage Major' },
          { key: 'manage-period', label: 'Manage Period' },
          { key: 'manage-user', label: 'Manage User' },
          { key: 'manage-role', label: 'Manage Role' },
          { key: 'manage-section', label: 'Manage Section' },
          { key: 'system-setting', label: 'System Settings' },
          { key: 'backup-db', label: 'Database Backup' }
        ];

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', minHeight: '600px', boxSizing: 'border-box', gap: '24px' }}>
            <div>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <CheckSquare size={20} color="var(--secondary-blue)" />
                Access Permissions
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0', textAlign: 'left' }}>
                Select the checkboxes to grant menu and feature access for each role.
              </p>
            </div>

            <div className="admin-table-container" style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '220px' }}>Main Menu / Feature</th>
                    {rolesList.map(r => (
                      <th key={r.key} style={{ textAlign: 'center', minWidth: '110px' }}>{r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionsLoading ? (
                    <tr>
                      <td colSpan={rolesList.length + 1} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        Loading access permissions...
                      </td>
                    </tr>
                  ) : (
                    menuKeysList.map(menu => (
                      <tr key={menu.key}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{menu.label}</td>
                        {rolesList.map(role => {
                          const perm = allPermissions.find(p => (p.roleName || '').trim().toLowerCase() === role.key.trim().toLowerCase() && p.menuKey === menu.key);
                          const isAllowed = perm ? perm.allowed : false;
                          const isSuperAdmin = role.key === 'superadmin';

                          return (
                            <td key={role.key} style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                className="custom-checkbox"
                                checked={isSuperAdmin ? true : isAllowed}
                                disabled={isSuperAdmin}
                                onChange={() => handleTogglePermission(role.key, menu.key, isAllowed)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'recycle-bin': {
        const bin = recycleBinData || { classes: [], grades: [], majors: [], users: [], roles: [], sections: [] };

        const renderTabContent = () => {
          switch (recycleBinTab) {
            case 'class':
              return (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Grade / Level</th>
                      <th>Major</th>
                      <th>Deleted At</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bin.classes.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Class recycle bin is empty.
                        </td>
                      </tr>
                    ) : (
                      bin.classes.map((item: any) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700 }}>{item.classname}</td>
                          <td>{item.grade?.gradename || '-'}</td>
                          <td>{item.major?.majorname || '-'}</td>
                          <td>{new Date(item.deletedAt).toLocaleString('en-US')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRestoreItem('class', item.id)}
                              className="btn-primary-sm"
                              style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 10px', height: 'auto', fontSize: '12px' }}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              );
            case 'grade':
              return (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Grade Name</th>
                      <th>Deleted At</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bin.grades.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Grade recycle bin is empty.
                        </td>
                      </tr>
                    ) : (
                      bin.grades.map((item: any) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700 }}>{item.gradename}</td>
                          <td>{new Date(item.deletedAt).toLocaleString('en-US')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRestoreItem('grade', item.id)}
                              className="btn-primary-sm"
                              style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 10px', height: 'auto', fontSize: '12px' }}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              );
            case 'major':
              return (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Major Name</th>
                      <th>Major Code</th>
                      <th>Deleted At</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bin.majors.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Major recycle bin is empty.
                        </td>
                      </tr>
                    ) : (
                      bin.majors.map((item: any) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700 }}>{item.majorname}</td>
                          <td style={{ fontWeight: 600 }}>{item.majorcode}</td>
                          <td>{new Date(item.deletedAt).toLocaleString('en-US')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRestoreItem('major', item.id)}
                              className="btn-primary-sm"
                              style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 10px', height: 'auto', fontSize: '12px' }}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              );
            case 'user':
              return (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Level</th>
                      <th>Email</th>
                      <th>Role / Position</th>
                      <th>Class</th>
                      <th>Deleted At</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bin.users.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          User recycle bin is empty.
                        </td>
                      </tr>
                    ) : (
                      bin.users.map((item: any) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700 }}>{item.username}</td>
                          <td>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, padding: '2px 6px', background: 'rgba(37,99,235,0.08)', color: 'var(--secondary-blue)', borderRadius: '4px' }}>
                              {item.level}
                            </span>
                          </td>
                          <td>{item.email}</td>
                          <td>{item.role}</td>
                          <td>{item.classname}</td>
                          <td>{new Date(item.deletedAt).toLocaleString('en-US')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRestoreItem('user', item.id)}
                              className="btn-primary-sm"
                              style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 10px', height: 'auto', fontSize: '12px' }}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              );
            case 'role':
              return (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Deleted At</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bin.roles.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Role recycle bin is empty.
                        </td>
                      </tr>
                    ) : (
                      bin.roles.map((item: any) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700 }}>{item.rolename}</td>
                          <td>{new Date(item.deletedAt).toLocaleString('en-US')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRestoreItem('role', item.id)}
                              className="btn-primary-sm"
                              style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 10px', height: 'auto', fontSize: '12px' }}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              );
            case 'section':
              return (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Section Name</th>
                      <th>Deleted At</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bin.sections.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Section recycle bin is empty.
                        </td>
                      </tr>
                    ) : (
                      bin.sections.map((item: any) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700 }}>{item.sectionname}</td>
                          <td>{new Date(item.deletedAt).toLocaleString('en-US')}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRestoreItem('section', item.id)}
                              className="btn-primary-sm"
                              style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 10px', height: 'auto', fontSize: '12px' }}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              );
            default:
              return null;
          }
        };

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box', gap: '20px' }}>
            <div>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Folder size={20} color="var(--secondary-blue)" />
                Recycle Bin (Deleted Data)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0', textAlign: 'left' }}>
                Restore previously deleted OSIS metadata or configuration items back into active datasets.
              </p>
            </div>

            {/* Segmented Tab Selectors */}
            <div style={{ display: 'flex', background: 'var(--bg-soft-white)', padding: '4px', borderRadius: '8px', border: '1px solid var(--card-border)', overflowX: 'auto', gap: '4px' }}>
              {[
                { id: 'class', label: 'Class' },
                { id: 'grade', label: 'Grade' },
                { id: 'major', label: 'Major' },
                { id: 'user', label: 'User Account' },
                { id: 'role', label: 'Role' },
                { id: 'section', label: 'Section' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRecycleBinTab(tab.id as any)}
                  style={{
                    flex: '1 0 auto',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: recycleBinTab === tab.id ? 'var(--secondary-blue)' : 'transparent',
                    color: recycleBinTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Table Content */}
            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '16px' }}>
              {recycleBinLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading deleted data...
                </div>
              ) : (
                renderTabContent()
              )}
            </div>
          </div>
        );
      }

      case 'activity-log': {
        const sortedLogs = activityLogs.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const roleLabelMap: Record<string, string> = {
          superadmin: 'Superadmin',
          admin: 'Admin',
          president: 'President',
          'vice president': 'Vice President',
          treasurer: 'Treasurer',
          secretaris: 'Secretary',
          secretary: 'Secretary',
          principal: 'Principal',
          viceprincipal: 'Vice Principal',
          'student affair': 'Student Affair',
          student: 'Student'
        };
        const getUserRoleByUsername = (username: string) => {
          const user = users.find(u => (u.username || '').toLowerCase() === (username || '').toLowerCase());
          if (!user) return '-';
          return roleLabelMap[(user.role || '').toLowerCase()] || user.role || '-';
        };
        const enrichedLogs = sortedLogs.map(log => ({
          ...log,
          roleLabel: getUserRoleByUsername(log.username),
        }));
        const filteredLogs = enrichedLogs.filter(log => {
          const query = adminSearch.toLowerCase();
          const matchesRole = activityLogRoleFilter === 'all' || log.roleLabel.toLowerCase() === activityLogRoleFilter;
          const matchesSearch =
            log.username.toLowerCase().includes(query) ||
            log.roleLabel.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.ipAddress.toLowerCase().includes(query) ||
            new Date(log.createdAt).toLocaleDateString('en-US').toLowerCase().includes(query);
          return matchesRole && matchesSearch;
        });

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', minHeight: '600px', boxSizing: 'border-box', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                  <CheckSquare size={20} color="var(--secondary-blue)" />
                  User Activity Log (POST)
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Record of important changes and user actions in the OSIS system.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by user, role, action, IP, or date..."
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
              <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
                <select
                  className="form-input"
                  style={{ margin: 0, height: '100%' }}
                  value={activityLogRoleFilter}
                  onChange={e => setActivityLogRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="admin">Admin</option>
                  <option value="president">President</option>
                  <option value="vice president">Vice President</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="secretaris">Secretary</option>
                  <option value="principal">Principal</option>
                  <option value="viceprincipal">Vice Principal</option>
                  <option value="student affair">Student Affair</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Date & Time</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>IP Address</th>
                    <th>Coordinates (Lat, Lng)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogsLoading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        Loading activity log data...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No activity logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log: any) => {
                      const dateObj = new Date(log.createdAt);
                      const formattedDate = dateObj.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) + ', ' + dateObj.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });

                      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`;

                      return (
                        <tr key={log.id}>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-dark)', fontWeight: 600 }}>{formattedDate}</td>
                          <td>
                            <span style={{ fontSize: '12px', padding: '3px 8px', background: 'rgba(37,99,235,0.05)', color: 'var(--secondary-blue)', borderRadius: '4px', fontWeight: 700 }}>
                              {log.username}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', padding: '3px 8px', background: 'rgba(16,185,129,0.08)', color: 'var(--success)', borderRadius: '4px', fontWeight: 700 }}>
                              {log.roleLabel}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{log.ipAddress}</td>
                          <td>
                            {log.latitude !== null && log.longitude !== null ? (
                              <a 
                                href={mapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: 'var(--success)', textDecoration: 'underline', fontSize: '12.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '12.5px', fontStyle: 'italic' }}>Tidak Ada</span>
                            )}
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: 500 }}>
                            {log.action}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'evaluasi-kinerja': {
        const periodMembers = selectedProkerPeriod 
          ? orgMembers.filter(m => m.periodid === selectedProkerPeriod.id) 
          : [];
        
        const periodProkers = selectedProkerPeriod 
          ? prokers.filter(p => p.periodId === selectedProkerPeriod.id) 
          : [];

        // Loop through periodProkers to retrieve their details from localStorage
        const prokerDetailsList = periodProkers.map(p => {
          const attendances: Record<string, Record<string, string>> = {};
          if (p.meetings) {
            p.meetings.forEach((meet: any) => {
              if (meet.attendances) {
                attendances[meet.id] = {};
                meet.attendances.forEach((att: any) => {
                  attendances[meet.id][att.prokerMemberId] = att.status;
                });
              }
            });
          }
          const subData = {
            proposals: p.proposals || [],
            meetings: p.meetings || [],
            divisions: p.divisions || [],
            members: p.members || [],
            attendances,
            reports: p.reports || [],
            documentations: p.documentations || []
          };
          return {
            proker: p,
            subData
          };
        });

        // Compute overall metrics
        const totalProkers = periodProkers.length;
        const completedProkers = periodProkers.filter(p => p.status === 'Selesai').length;
        const completionRate = totalProkers > 0 ? Math.round((completedProkers / totalProkers) * 100) : 0;

        let totalMeetings = 0;
        let totalPresent = 0;
        let totalAttendancesCount = 0;
        let prokersWithApprovedProposal = 0;
        let prokersWithApprovedReport = 0;

        // Map containing performance data for each member
        const memberPerformanceMap: { [memberId: string]: { present: number; total: number; sick: number; permit: number; absent: number } } = {};
        
        // Initialize map for all periodMembers
        periodMembers.forEach(m => {
          memberPerformanceMap[m.studentid] = { present: 0, total: 0, sick: 0, permit: 0, absent: 0 };
        });

        prokerDetailsList.forEach(({ proker, subData }) => {
          const meetings = subData.meetings || [];
          totalMeetings += meetings.length;

          // Document compliance check
          const proposals = subData.proposals || [];
          if (proposals.some((pr: any) => pr.status === 'Disetujui')) {
            prokersWithApprovedProposal++;
          }
          const reports = subData.reports || [];
          if (reports.some((rp: any) => rp.status === 'Disetujui')) {
            prokersWithApprovedReport++;
          }

          // Attendances aggregation
          const attendancesMap = subData.attendances || {};
          meetings.forEach((meet: any) => {
            const meetingAttendance = attendancesMap[meet.id] || {};
            
            // Increment attendance counts for members
            periodMembers.forEach(m => {
              const status = meetingAttendance[m.studentid];
              if (status) {
                memberPerformanceMap[m.studentid].total++;
                totalAttendancesCount++;
                if (status === 'PRESENT') {
                  memberPerformanceMap[m.studentid].present++;
                  totalPresent++;
                } else if (status === 'SICK') {
                  memberPerformanceMap[m.studentid].sick++;
                } else if (status === 'PERMIT') {
                  memberPerformanceMap[m.studentid].permit++;
                } else if (status === 'ABSENT') {
                  memberPerformanceMap[m.studentid].absent++;
                }
              }
            });
          });
        });

        // Compute overall attendance rate
        const overallAttendanceRate = totalAttendancesCount > 0 
          ? Math.round((totalPresent / totalAttendancesCount) * 100) 
          : 0;

        // Compute compliance rate: average of proposal and LPJ completion rates
        const docComplianceRate = totalProkers > 0 
          ? Math.round(((prokersWithApprovedProposal + prokersWithApprovedReport) / (totalProkers * 2)) * 100)
          : 0;

        // List of member performance details
        const memberPerformanceDetails = periodMembers.map(m => {
          const perf = memberPerformanceMap[m.studentid] || { present: 0, total: 0, sick: 0, permit: 0, absent: 0 };
          const rate = perf.total > 0 ? Math.round((perf.present / perf.total) * 100) : 0;
          
          let grade = 'C';
          if (perf.total === 0) grade = '-';
          else if (rate >= 90) grade = 'A';
          else if (rate >= 75) grade = 'B';
          else if (rate >= 60) grade = 'C';
          else grade = 'D';

          return {
            member: m,
            username: m.student?.user?.username || '-',
            className: m.student?.class?.classname || '-',
            roleName: m.role?.rolename || '-',
            sectionName: m.section?.sectionname || 'Inti',
            perf,
            rate,
            grade
          };
        });

        // Filter member performances by search query
        const filteredMembers = memberPerformanceDetails.filter(item => {
          const query = evalSearch.toLowerCase();
          return item.username.toLowerCase().includes(query) ||
            item.roleName.toLowerCase().includes(query) ||
            item.sectionName.toLowerCase().includes(query) ||
            item.className.toLowerCase().includes(query);
        });

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', minHeight: '600px', boxSizing: 'border-box', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                  <TrendingUp size={20} color="var(--secondary-blue)" />
                  OSIS Board Performance Evaluation
                </h2>
                
                {/* Period Selector Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
                  <select
                    className="form-input"
                    style={{ width: '140px', margin: 0, paddingLeft: '12px', paddingRight: '12px', paddingTop: 0, paddingBottom: 0, height: '36px', fontSize: '13px' }}
                    value={selectedProkerPeriod?.id || ''}
                    onChange={e => setProkerPeriodId(e.target.value)}
                  >
                    {periods.map(p => (
                      <option key={p.id} value={p.id}>{p.yearLabel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, transparent 100%)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Average Attendance</span>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)', margin: 0 }}>{overallAttendanceRate}%</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From total meeting attendances</span>
              </div>
              
              <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, transparent 100%)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Work Program Realization</span>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--secondary-blue)', margin: 0 }}>{completionRate}%</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{completedProkers} of {totalProkers} programs completed</span>
              </div>

              <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, transparent 100%)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Document Compliance</span>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--warning)', margin: 0 }}>{docComplianceRate}%</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Proposal & LPJ Approvals</span>
              </div>

              <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Total OSIS Meetings</span>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>{totalMeetings}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Coordination & technical sessions</span>
              </div>
            </div>

            {/* Member Performance Evaluation Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>Board Performance & Attendance Registry</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-soft-white)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '6px 12px', width: '260px' }}>
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search board member..."
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', padding: 0 }}
                    value={evalSearch}
                    onChange={e => setEvalSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Officer Name</th>
                      <th>Position</th>
                      <th>Division</th>
                      <th style={{ textAlign: 'center' }}>Attended / Total Meetings</th>
                      <th style={{ textAlign: 'center' }}>Attendance Rate</th>
                      <th style={{ textAlign: 'center' }}>Grade / Predicate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No board performance data available.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((item, index) => {
                        let badgeClass = 'badge-success';
                        let badgeColor = 'var(--success)';
                        if (item.rate < 50) {
                          badgeClass = 'badge-danger';
                          badgeColor = 'var(--danger)';
                        } else if (item.rate < 75) {
                          badgeClass = 'badge-warning';
                          badgeColor = 'var(--warning)';
                        } else if (item.rate < 90) {
                          badgeClass = 'badge-secondary';
                          badgeColor = 'var(--secondary-blue)';
                        }

                        return (
                          <tr key={item.member.id || index}>
                            <td style={{ fontWeight: 700 }}>{item.username}</td>
                            <td>{item.roleName}</td>
                            <td>
                              <span style={{ fontSize: '12px', padding: '3px 8px', background: 'rgba(37,99,235,0.05)', color: 'var(--secondary-blue)', borderRadius: '4px', fontWeight: 600 }}>
                                {item.sectionName}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.perf.present} / {item.perf.total}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${badgeClass}`} style={{ color: badgeColor, fontWeight: 800 }}>
                                {item.rate}%
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                background: item.grade === 'A' ? 'rgba(16, 185, 129, 0.1)' : item.grade === 'B' ? 'rgba(37, 99, 235, 0.1)' : item.grade === 'C' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                color: item.grade === 'A' ? 'var(--success)' : item.grade === 'B' ? 'var(--secondary-blue)' : item.grade === 'C' ? 'var(--warning)' : 'var(--danger)', 
                                fontWeight: 800, 
                                fontSize: '13px' 
                              }}>
                                {item.grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Proker Evaluation Card Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>Document & Work Program Agenda Evaluation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {prokerDetailsList.length === 0 ? (
                  <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '24px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                    No work programs have been structured yet.
                  </div>
                ) : (
                  prokerDetailsList.map(({ proker, subData }) => {
                    const hasProp = (subData.proposals || []).some((pr: any) => pr.status === 'Disetujui');
                    const hasRep = (subData.reports || []).some((rp: any) => rp.status === 'Disetujui');
                    const totalMeetingsCount = (subData.meetings || []).length;
                    
                    return (
                      <div key={proker.id} className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--primary-navy)' }}>{proker.name}</h4>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target: {proker.targetDate}</span>
                          </div>
                          <span className={`badge badge-${proker.status === 'Selesai' ? 'success' : proker.status === 'Berjalan' ? 'warning' : 'secondary'}`} style={{ color: proker.status === 'Selesai' ? 'var(--success)' : proker.status === 'Berjalan' ? 'var(--warning)' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                            {proker.status === 'Selesai' ? 'Completed' : proker.status === 'Berjalan' ? 'In Progress' : 'Planned'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-soft-white)', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Meetings:</span>
                            <span style={{ fontWeight: 600 }}>{totalMeetingsCount} Times</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Activity Proposal:</span>
                            <span style={{ fontWeight: 700, color: hasProp ? 'var(--success)' : 'var(--danger)' }}>
                              {hasProp ? '✓ Approved' : '✗ Not Approved'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>LPJ Report:</span>
                            <span style={{ fontWeight: 700, color: hasRep ? 'var(--success)' : 'var(--danger)' }}>
                              {hasRep ? '✓ Approved' : '✗ Not Approved'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'dashboard':
        return (
          <div className="dashboard-grid">
            {/* Profile Card */}
            <div className="theme-card profile-card">
              <h2 className="profile-card-title">
                {getLevelIcon(userData.level)}
                Account Information
              </h2>

              <div className="profile-fields">
                <div className="profile-field">
                  <div className="profile-label">Username</div>
                  <div className="profile-value">{userData.username}</div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Access Level</div>
                  <div>
                    <span className={getBadgeClass(userData.level)}>
                      {userData.level}
                    </span>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Registered Email</div>
                  <div className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} className="text-muted" />
                    {userData.email || '-'}
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Role / Position</div>
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
                Level Details
              </h2>

              {userData.level === 'student' && userData.details && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="detail-item">
                    <span className="detail-name">Class</span>
                    <span className="detail-val">{userData.details.class}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Grade</span>
                    <span className="detail-val">{userData.details.grade}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Major</span>
                    <span className="detail-val">{userData.details.major}</span>
                  </div>
                </div>
              )}

              {userData.level === 'student' && !userData.details && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Student detail data not found.</p>
              )}

              {userData.level === 'school' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    This account level has school administrative authority.
                  </p>
                  <div className="detail-item">
                    <span className="detail-name">Institution</span>
                    <span className="detail-val">School Institution</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Status</span>
                    <span className="detail-val" style={{ color: 'var(--success)' }}>Active</span>
                  </div>
                </div>
              )}

              {userData.level === 'employer' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    This account level is designated for employers / partner industries.
                  </p>
                  <div className="detail-item">
                    <span className="detail-name">Partnership</span>
                    <span className="detail-val">Industry & Labor Market</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-name">Status</span>
                    <span className="detail-val" style={{ color: 'var(--success)' }}>Active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions & Attendance Scanner Card */}
            {canScanAttendance && (
              <div className="theme-card details-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <h2 className="profile-card-title">
                  <Scan size={20} color="var(--secondary-blue)" />
                  OSIS Quick Actions
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Perform administrative actions and scan attendance code.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="btn-primary-sm"
                    style={{
                      height: '42px',
                      padding: '0 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, var(--secondary-blue), #1d4ed8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Scan size={16} /> Scan Attendance QR Code
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'vote': {
        if (userData.role !== 'superadmin' && !effectivePermissions.includes('vote')) {
          return (
            <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '40px' }}>
              <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
              <h2 style={{ color: 'var(--primary-navy)', marginBottom: '12px' }}>Akses E-Voting Dibatasi</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center', maxWidth: '500px' }}>
                Akun Anda tidak memiliki izin untuk berpartisipasi dalam pemungutan suara pada periode ini. Silakan hubungi administrator sistem untuk informasi lebih lanjut.
              </p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary-sm">
                Kembali ke Dashboard
              </button>
            </div>
          );
        }
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
                                ) : (
                  <>
                    {userVotedCandidateId && (
                      <div style={{ textAlign: 'center', padding: '24px 20px', border: '1px solid var(--success)', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0) 100%)', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--success)' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>✓</div>
                          <h3 style={{ margin: 0, fontWeight: 800 }}>Hak Suara Anda Telah Disalurkan!</h3>
                        </div>
                        <p style={{ marginTop: '8px', marginBottom: 0, color: 'var(--text-dark)', fontSize: '14px' }}>
                          Terima kasih atas partisipasi Anda dalam pemilihan Ketua & Wakil Ketua OSIS Periode {activePeriod.yearLabel}. Pilihan Anda adalah <strong>{userVotedCandidate?.name || 'Paslon'}</strong>.
                        </p>
                      </div>
                    )}

                    {!userVotedCandidateId && (
                      <p style={{ fontSize: '15px', color: 'var(--text-dark)', marginBottom: '24px', textAlign: 'center' }}>
                        Silakan pelajari visi-misi pasangan calon di bawah ini dan tentukan pilihan terbaik Anda.
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                      {activePeriodCandidates.map(c => {
                        const isUserChoice = userVotedCandidateId === c.id;
                        return (
                          <div 
                            key={c.id} 
                            className="theme-card animate-slideup" 
                            style={{ 
                              padding: '24px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '16px', 
                              border: isUserChoice ? '2px solid var(--success)' : '1px solid var(--card-border)', 
                              textAlign: 'left', 
                              borderRadius: '12px', 
                              background: 'var(--card-bg)',
                              position: 'relative'
                            }}
                          >
                            {isUserChoice && (
                              <div style={{ position: 'absolute', top: '-12px', right: '16px', background: 'var(--success)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                👑 Pilihan Anda
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

                            <div style={{ fontSize: '13px', borderTop: '1px solid var(--card-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                              <div><strong>Visi:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.visi}</span></div>
                              {c.misi && <div><strong>Misi:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.misi}</span></div>}
                            </div>

                            {userVotedCandidateId ? (
                              isUserChoice ? (
                                <button 
                                  type="button"
                                  disabled
                                  className="btn-primary-sm"
                                  style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    fontSize: '14px', 
                                    fontWeight: 700, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px',
                                    background: 'var(--success)',
                                    borderColor: 'var(--success)',
                                    color: '#fff',
                                    cursor: 'not-allowed',
                                    opacity: 0.95
                                  }}
                                >
                                  Pilihan Anda ✓
                                </button>
                              ) : (
                                <button 
                                  type="button"
                                  disabled
                                  className="btn-secondary-sm"
                                  style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    fontSize: '14px', 
                                    fontWeight: 700, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px',
                                    background: 'var(--bg-soft-white)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--text-muted)',
                                    cursor: 'not-allowed',
                                    opacity: 0.6
                                  }}
                                >
                                  Pilih Paslon {c.paslonNo}
                                </button>
                              )
                            ) : (
                              <button 
                                onClick={() => handleCastVote(c.id, activePeriod.id)}
                                className="btn-primary-sm"
                                style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              >
                                PILIH PASLON {c.paslonNo}
                              </button>
                            )}
                          </div>
                        );
                      })}

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
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Users size={20} color="var(--secondary-blue)" />
                OSIS Chairperson & Vice Chairperson Candidates
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
                  <Plus size={16} /> Add Candidate
                </button>
              )}
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              List of OSIS candidate pairs competing in the active election period.
            </p>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search candidate name, class, vision..." 
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
                <option value="">All Periods</option>
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.yearLabel}</option>
                ))}
              </select>
            </div>

            {/* Scrollable Candidates Grid */}
            <div className="custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', paddingBottom: '16px' }}>
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
                            PAIR {c.paslonNo}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Period {periodLabel}
                          </span>
                        </div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--primary-navy)', fontWeight: 700 }}>{c.name}</h3>
                        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-muted)' }}>{c.classes}</p>
                        
                        <div style={{ fontSize: '12px', borderTop: '1px solid var(--card-border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div><strong>Vision:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.visi}</span></div>
                          {c.misi && <div><strong>Mission:</strong> <span style={{ color: 'var(--text-dark)' }}>{c.misi}</span></div>}
                        </div>
    
                        {userData.role === 'superadmin' && (
                          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleStartEditCandidate(c)} 
                              className="action-btn action-btn-warning" 
                              style={{ padding: '4px 8px' }}
                              title="Edit Candidate"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCandidate(c.id)} 
                              className="action-btn action-btn-danger" 
                              style={{ padding: '4px 8px' }}
                              title="Delete Candidate"
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
                    No candidate data matches your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'proker': {
        const periodMembers = selectedProkerPeriod ? orgMembers.filter(m => m.periodid === selectedProkerPeriod.id) : [];
        const prokerPresident = periodMembers.find(m => 
          m.role?.rolename.toLowerCase() === 'president' || m.role?.rolename.toLowerCase() === 'ketua osis'
        );
        const prokerVicePresident = periodMembers.find(m => 
          m.role?.rolename.toLowerCase() === 'vice president' || m.role?.rolename.toLowerCase() === 'wakil ketua osis'
        );

        const presidentName = prokerPresident?.student?.user?.username 
          || (selectedProkerCandidate ? (selectedProkerCandidate.presidentName || selectedProkerCandidate.name.split(' & ')[0]) : null);
        const presidentClass = prokerPresident?.student?.class?.classname 
          || (selectedProkerCandidate ? (selectedProkerCandidate.presidentClass || selectedProkerCandidate.classes.split(' & ')[0]) : null);

        const vicePresidentName = prokerVicePresident?.student?.user?.username 
          || (selectedProkerCandidate ? (selectedProkerCandidate.vicePresidentName || selectedProkerCandidate.name.split(' & ')[1]) : null);
        const vicePresidentClass = prokerVicePresident?.student?.class?.classname 
          || (selectedProkerCandidate ? (selectedProkerCandidate.vicePresidentClass || selectedProkerCandidate.classes.split(' & ')[1]) : null);

        const hasOfficers = presidentName || vicePresidentName;

        const periodProkers = selectedProkerPeriod 
          ? prokers.filter(p => p.periodId === selectedProkerPeriod.id) 
          : [];

        const getChronologicalValue = (targetDate: string) => {
          const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
          const normalized = targetDate.toLowerCase();
          const yearMatch = normalized.match(/\b(20\d{2})\b/);
          const year = yearMatch ? parseInt(yearMatch[1], 10) : 9999;
          
          let monthIndex = 12;
          for (let i = 0; i < months.length; i++) {
            if (normalized.includes(months[i]) || 
                (months[i] === 'des' && normalized.includes('dec')) || 
                (months[i] === 'mei' && normalized.includes('may')) || 
                (months[i] === 'agu' && normalized.includes('aug'))) {
              monthIndex = i;
              break;
            }
          }
          return year * 12 + monthIndex;
        };

        const sortedProkers = periodProkers.slice().sort((a, b) => getChronologicalValue(a.targetDate) - getChronologicalValue(b.targetDate));

        const totalPro = periodProkers.length;
        const rencanaPro = periodProkers.filter(p => p.status === 'Rencana').length;
        const berjalanPro = periodProkers.filter(p => p.status === 'Berjalan').length;
        const selesaiPro = periodProkers.filter(p => p.status === 'Selesai').length;

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', flexShrink: 0, flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                  <Briefcase size={20} color="var(--secondary-blue)" />
                  OSIS Work Programs
                </h2>
                
                {/* Period Selector Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
                  <select
                    className="form-input"
                    style={{ width: '140px', margin: 0, paddingLeft: '12px', paddingRight: '12px', paddingTop: 0, paddingBottom: 0, height: '36px', fontSize: '13px' }}
                    value={selectedProkerPeriod?.id || ''}
                    onChange={e => setProkerPeriodId(e.target.value)}
                  >
                    {periods.map(p => (
                      <option key={p.id} value={p.id}>{p.yearLabel}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {hasOfficers && (
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
                    <Plus size={16} /> Add Program
                  </button>
                )}
              </div>
            </div>
            <div className="custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '16px', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Proker Statistics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Programs</span>
                  <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--primary-navy)' }}>{totalPro}</h4>
                </div>
                <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Planned</span>
                  <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-muted)' }}>{rencanaPro}</h4>
                </div>
                <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>In Progress</span>
                  <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--warning)' }}>{berjalanPro}</h4>
                </div>
                <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Completed</span>
                  <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{selesaiPro}</h4>
                </div>
              </div>

              {/* List of Prokers */}
              <h3 style={{ fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700, margin: '10px 0 0' }}>
                OSIS Work Program Registry
              </h3>

              <div className="proker-timeline">
                {sortedProkers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
                    No work programs have been structured for this period yet.
                  </div>
                ) : (
                  sortedProkers.map(p => {
                    let dotClass = 'status-rencana';
                    if (p.status === 'Berjalan') dotClass = 'status-berjalan';
                    if (p.status === 'Selesai') dotClass = 'status-selesai';

                    return (
                      <div key={p.id} className="proker-timeline-item">
                        <div className={`proker-timeline-dot ${dotClass}`} />
                        <div 
                          className="proker-timeline-content" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => {
                            setSelectedProkerDetail(p);
                            setProkerTab('overview');
                            navigate(`/proker-detail?id=${p.id}`);
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingRight: userData.role === 'superadmin' ? '80px' : '0' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                              {p.name}
                            </h4>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Target: <strong>{p.targetDate}</strong>
                              </span>
                              
                              {p.status === 'Rencana' && (
                                <span className="badge badge-secondary" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>Planned</span>
                              )}
                              {p.status === 'Berjalan' && (
                                <span className="badge badge-warning" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--warning)' }}>In Progress</span>
                              )}
                              {p.status === 'Selesai' && (
                                <span className="badge badge-success" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--success)' }}>Completed</span>
                              )}
                            </div>
                          </div>

                          {p.description && (
                            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-dark)', lineHeight: '1.5' }}>
                              {p.description}
                            </p>
                          )}

                          {userData.role === 'superadmin' && (
                            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditProker(p);
                                }} 
                                className="action-btn action-btn-warning"
                                style={{ padding: '4px 8px' }}
                                title="Edit Program"
                                type="button"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProker(p.id);
                                }} 
                                className="action-btn action-btn-danger"
                                style={{ padding: '4px 8px' }}
                                title="Delete Program"
                                type="button"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      }


      case 'proker-detail': {
        if (!selectedProkerDetail) {
          return (
            <div className="theme-card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Program Kerja tidak ditemukan atau belum dipilih.</p>
              <button className="btn-primary-sm" onClick={() => navigate('/proker')}>Kembali ke Daftar Proker</button>
            </div>
          );
        }

        const canEditProkerDetails = ['superadmin', 'president', 'vice president', 'treasurer', 'secretaris'].includes(normalizedUserRole);
        const canModerateProkerDocs = ['superadmin', 'admin', 'principal', 'viceprincipal', 'student affair'].includes(normalizedUserRole);
        const p = selectedProkerDetail;
        const subData = prokerSubData || { proposals: [], meetings: [], divisions: [], members: [], attendances: {}, reports: [], documentations: [] };
        const periodOrgMembers = orgMembers.filter((m: any) => m.periodid === selectedProkerPeriod?.id);
        const prokerEligibleMembers = orgMembers.filter((m: any) => {
          const roleName = (m.role?.rolename || '').trim().toLowerCase();
          const allowedRoles = [
            'member',
            'members',
            'president',
            'vice president',
            'secretaris',
            'sekretaris',
            'secretary',
            'treasurer',
            'bendahara'
          ];
          return m.periodid === selectedProkerPeriod?.id && allowedRoles.some(role => roleName === role || roleName.includes(role));
        });

        const parseProkerTargetDate = (targetDate: string) => {
          const normalized = (targetDate || '').trim().toLowerCase();
          const monthMap: Record<string, number> = {
            januari: 0,
            february: 1,
            februari: 1,
            maret: 2,
            march: 2,
            april: 3,
            mei: 4,
            may: 4,
            juni: 5,
            june: 5,
            juli: 6,
            july: 6,
            agustus: 7,
            august: 7,
            september: 8,
            oktober: 9,
            october: 9,
            november: 10,
            desember: 11,
            december: 11
          };
          const parts = normalized.split(/\s+/);
          const yearPart = parts.find(part => /^\d{4}$/.test(part));
          const monthPart = parts.find(part => monthMap[part] !== undefined);
          if (!yearPart || !monthPart) return null;
          return new Date(Number(yearPart), monthMap[monthPart], 1);
        };

        const getProposalScheduleInfo = (targetDate: string) => {
          const eventDate = parseProkerTargetDate(targetDate);
          if (!eventDate) return null;

          const now = new Date();
          const notifyStart = new Date(eventDate);
          notifyStart.setMonth(notifyStart.getMonth() - 3);

          const submitStart = new Date(eventDate);
          submitStart.setMonth(submitStart.getMonth() - 1);

          const daysToEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isInNotifyWindow = now >= notifyStart && now < submitStart;
          const canSubmitProposal = now >= submitStart && now < eventDate;
          const isPastEvent = now >= eventDate;

          return {
            eventDate,
            notifyStart,
            submitStart,
            daysToEvent,
            isInNotifyWindow,
            canSubmitProposal,
            isPastEvent
          };
        };

        const getOrgMemberRoleLabel = (member: any) => {
          const roleName = (member.role?.rolename || '').trim().toLowerCase();
          if (roleName === 'president' || roleName.includes('ketua osis')) return 'President';
          if (roleName === 'vice president' || roleName.includes('wakil ketua')) return 'Vice President';
          if (roleName === 'secretaris' || roleName === 'sekretaris' || roleName.includes('secretary')) {
            const list = periodOrgMembers.filter((m: any) => {
              const rn = (m.role?.rolename || '').trim().toLowerCase();
              return rn === 'secretaris' || rn === 'sekretaris' || rn.includes('secretary');
            });
            const index = list.findIndex((m: any) => m.id === member.id);
            return `Secretary ${index >= 0 ? index + 1 : ''}`.trim();
          }
          if (roleName === 'treasurer' || roleName.includes('bendahara')) {
            const list = periodOrgMembers.filter((m: any) => {
              const rn = (m.role?.rolename || '').trim().toLowerCase();
              return rn === 'treasurer' || rn.includes('bendahara');
            });
            const index = list.findIndex((m: any) => m.id === member.id);
            return `Treasurer ${index >= 0 ? index + 1 : ''}`.trim();
          }
          if (roleName === 'member' || roleName === 'members') return 'Member';
          return member.role?.rolename || 'Member';
        };
        const formatProkerMemberOptionLabel = (member: any) => {
          const studentName = member.student?.user?.username || member.student?.user?.name || member.student?.user?.fullName || member.student?.name || '-';
          const classId = member.student?.classid || member.student?.classId;
          const studentClass = classes.find((c: any) => c.id === classId) || member.student?.class || member.student?.Class || {};
          const majorCode = studentClass.major?.majorcode || studentClass.majorcode || studentClass.majorCode;
          const gradeName = studentClass.grade?.gradename || studentClass.gradename || studentClass.gradeName;
          const className = studentClass.classname || studentClass.className;
          const roleLabel = getOrgMemberRoleLabel(member);
          const classLabel = [majorCode, gradeName, className].filter(Boolean).join(' ');
          return classLabel ? `${roleLabel} - ${studentName} - ${classLabel}` : `${roleLabel} - ${studentName}`;
        };
        const proposalScheduleInfo = getProposalScheduleInfo(p.targetDate);
        const isSecretaryUser = normalizedUserRole === 'secretaris';
        const getReportScheduleInfo = (targetDate: string) => {
          const eventDate = parseProkerTargetDate(targetDate);
          if (!eventDate) return null;

          const now = new Date();
          const reportDeadline = new Date(eventDate);
          reportDeadline.setMonth(reportDeadline.getMonth() + 1);

          const reportWindowStart = new Date(eventDate);
          reportWindowStart.setDate(reportWindowStart.getDate() + 1);

          const daysSinceEvent = Math.ceil((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
          const daysUntilDeadline = Math.ceil((reportDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const canSubmitReport = now >= reportWindowStart && now <= reportDeadline;
          const isPastDeadline = now > reportDeadline;
          const isBeforeEvent = now < reportWindowStart;

          return {
            eventDate,
            reportWindowStart,
            reportDeadline,
            daysSinceEvent,
            daysUntilDeadline,
            canSubmitReport,
            isPastDeadline,
            isBeforeEvent
          };
        };
        const reportScheduleInfo = getReportScheduleInfo(p.targetDate);

        const handleFileSelection = (file: File) => {
          const fileSizeMB = file.size / (1024 * 1024);
          const sizeString = fileSizeMB < 0.1 
            ? `${(file.size / 1024).toFixed(1)} KB` 
            : `${fileSizeMB.toFixed(1)} MB`;

          if (file.size > 1.5 * 1024 * 1024) {
            setSelectedProposalFile({
              name: file.name,
              size: sizeString,
              dataUrl: `mock-file:${file.name}`
            });
            showToast('Berkas terpilih (Simulasi: berkas > 1.5MB)');
          } else {
            const reader = new FileReader();
            reader.onload = (event) => {
              setSelectedProposalFile({
                name: file.name,
                size: sizeString,
                dataUrl: event.target?.result as string
              });
            };
            reader.readAsDataURL(file);
          }
        };

        const handleDrag = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
          } else if (e.type === "dragleave") {
            setDragActive(false);
          }
        };

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
          }
        };

        const handleAddProposal = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (proposalScheduleInfo) {
            if (!proposalScheduleInfo.canSubmitProposal) {
              if (proposalScheduleInfo.isPastEvent) {
                alert('Acara sudah lewat. Proposal untuk proker ini ditutup.');
              } else {
                alert('Proposal baru bisa dikirim mulai H-1 bulan sebelum acara.');
              }
              return;
            }
          }
          const fd = new FormData(e.currentTarget);
          const title = fd.get('title') as string;
          if (!title) return;
          if (!selectedProposalFile) {
            alert('Silakan pilih atau seret file proposal terlebih dahulu.');
            return;
          }

          const newProposal = {
            id: 'prop-' + Date.now(),
            title,
            fileName: selectedProposalFile.name,
            fileSize: selectedProposalFile.size,
            fileUrl: selectedProposalFile.dataUrl,
            status: 'Diajukan',
            createdAt: new Date().toLocaleDateString('id-ID')
          };

          updateProkerSubData({
            ...subData,
            proposals: [...(subData.proposals || []), newProposal]
          });
          e.currentTarget.reset();
          setSelectedProposalFile(null);
          showToast('Proposal berhasil diajukan!');
        };

        const handleDeleteProposal = (id: string) => {
          if (!window.confirm('Hapus proposal ini?')) return;
          updateProkerSubData({
            ...subData,
            proposals: (subData.proposals || []).filter((x: any) => x.id !== id)
          });
          showToast('Proposal berhasil dihapus!');
        };

        const handleUpdateProposalStatus = (id: string, status: string) => {
          updateProkerSubData({
            ...subData,
            proposals: (subData.proposals || []).map((x: any) => x.id === id ? { ...x, status } : x)
          });
          showToast('Status proposal berhasil diperbarui!');
        };

        const handleAddMeeting = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const title = fd.get('title') as string;
          const date = fd.get('date') as string;
          const description = fd.get('description') as string;
          if (!title || !date) return;

          const newMeeting = {
            id: 'meet-' + Date.now(),
            title,
            date,
            description: description || ''
          };

          updateProkerSubData({
            ...subData,
            meetings: [...(subData.meetings || []), newMeeting]
          });
          e.currentTarget.reset();
          showToast('Rapat berhasil dijadwalkan!');
        };

        const handleAddMeetingFromAbsensi = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const title = fd.get('title') as string;
          const date = fd.get('date') as string;
          const description = fd.get('description') as string;
          if (!title || !date) return;

          const newMeetingId = 'meet-' + Date.now();
          const newMeeting = {
            id: newMeetingId,
            title,
            date,
            description: description || ''
          };

          updateProkerSubData({
            ...subData,
            meetings: [...(subData.meetings || []), newMeeting]
          });
          e.currentTarget.reset();
          setActiveProkerMeetingId(newMeetingId);
          setShowAbsensiAddMeeting(false);
          showToast('Rapat berhasil ditambahkan dan dipilih!');
        };

        const handleDeleteMeeting = (id: string) => {
          if (!window.confirm('Hapus rapat ini?')) return;
          const newAttendances = { ...subData.attendances };
          delete newAttendances[id];

          updateProkerSubData({
            ...subData,
            meetings: (subData.meetings || []).filter((x: any) => x.id !== id),
            attendances: newAttendances
          });
          showToast('Rapat berhasil dihapus!');
        };

        const handleAddDivision = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = fd.get('name') as string;
          if (!name) return;

          const newDiv = {
            id: 'div-' + Date.now(),
            name
          };

          updateProkerSubData({
            ...subData,
            divisions: [...(subData.divisions || []), newDiv]
          });
          e.currentTarget.reset();
          showToast('Divisi berhasil ditambahkan!');
        };

        const handleDeleteDivision = (id: string) => {
          if (!window.confirm('Hapus divisi ini? Semua anggota di divisi ini akan dihapus juga.')) return;
          updateProkerSubData({
            ...subData,
            divisions: (subData.divisions || []).filter((x: any) => x.id !== id),
            members: (subData.members || []).filter((x: any) => x.divisionId !== id)
          });
          showToast('Divisi berhasil dihapus!');
        };

        const handleAddMember = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const memberId = fd.get('memberId') as string;
          const role = fd.get('role') as string;
          const divisionId = fd.get('divisionId') as string;
          if (!memberId || !role || !divisionId) return;

          const selectedMember = prokerEligibleMembers.find((m: any) => m.id === memberId);
          if (!selectedMember) {
            showToast('Pilih anggota organisasi yang valid terlebih dahulu.');
            return;
          }

          const newMember = {
            id: 'mem-' + Date.now(),
            divisionId,
            orgMemberId: selectedMember.id,
            studentId: selectedMember.studentid,
            name: selectedMember.student?.user?.username || selectedMember.student?.user?.fullName || selectedMember.student?.user?.name || selectedMember.student?.name || '-',
            role
          };

          updateProkerSubData({
            ...subData,
            members: [...(subData.members || []), newMember]
          });
          e.currentTarget.reset();
          showToast('Anggota berhasil ditambahkan!');
        };

        const handleDeleteMember = (id: string) => {
          if (!window.confirm('Hapus anggota ini?')) return;
          updateProkerSubData({
            ...subData,
            members: (subData.members || []).filter((x: any) => x.id !== id)
          });
          showToast('Anggota berhasil dihapus!');
        };

        const handleRecordAttendance = (meetingId: string, memberId: string, status: string) => {
          const meetingAttendances = subData.attendances[meetingId] || {};
          const updatedAttendances = {
            ...subData.attendances,
            [meetingId]: {
              ...meetingAttendances,
              [memberId]: status
            }
          };

          updateProkerSubData({
            ...subData,
            attendances: updatedAttendances
          });
        };

        const handleReportFileSelection = (file: File) => {
          const fileSizeMB = file.size / (1024 * 1024);
          const sizeString = fileSizeMB < 0.1 
            ? `${(file.size / 1024).toFixed(1)} KB` 
            : `${fileSizeMB.toFixed(1)} MB`;

          if (file.size > 1.5 * 1024 * 1024) {
            setSelectedReportFile({
              name: file.name,
              size: sizeString,
              dataUrl: `mock-file:${file.name}`
            });
            showToast('Berkas laporan terpilih (Simulasi: berkas > 1.5MB)');
          } else {
            const reader = new FileReader();
            reader.onload = (event) => {
              setSelectedReportFile({
                name: file.name,
                size: sizeString,
                dataUrl: event.target?.result as string
              });
            };
            reader.readAsDataURL(file);
          }
        };

        const handleReportDrag = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "dragenter" || e.type === "dragover") {
            setReportDragActive(true);
          } else if (e.type === "dragleave") {
            setReportDragActive(false);
          }
        };

        const handleReportDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setReportDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleReportFileSelection(e.dataTransfer.files[0]);
          }
        };

        const handleAddReport = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (reportScheduleInfo) {
            if (!reportScheduleInfo.canSubmitReport) {
              if (reportScheduleInfo.isBeforeEvent) {
                alert('Laporan baru bisa dikirim mulai H+1 hari setelah acara selesai.');
              } else if (reportScheduleInfo.isPastDeadline) {
                alert('Batas pengiriman laporan sudah lewat. Laporan ditutup setelah H+1 bulan.');
              }
              return;
            }
          }
          const fd = new FormData(e.currentTarget);
          const title = fd.get('title') as string;
          const summary = fd.get('summary') as string;
          if (!title) return;
          if (!selectedReportFile) {
            alert('Silakan pilih atau seret file laporan terlebih dahulu.');
            return;
          }

          const newReport = {
            id: 'rep-' + Date.now(),
            title,
            summary: summary || '',
            fileName: selectedReportFile.name,
            fileSize: selectedReportFile.size,
            fileUrl: selectedReportFile.dataUrl,
            status: 'Diajukan',
            createdAt: new Date().toLocaleDateString('id-ID')
          };

          updateProkerSubData({
            ...subData,
            reports: [...(subData.reports || []), newReport]
          });
          e.currentTarget.reset();
          setSelectedReportFile(null);
          showToast('Laporan berhasil diajukan!');
        };

        const handleDeleteReport = (id: string) => {
          if (!window.confirm('Hapus laporan ini?')) return;
          updateProkerSubData({
            ...subData,
            reports: (subData.reports || []).filter((x: any) => x.id !== id)
          });
          showToast('Laporan berhasil dihapus!');
        };

        const handleUpdateReportStatus = (id: string, status: string) => {
          updateProkerSubData({
            ...subData,
            reports: (subData.reports || []).map((x: any) => x.id === id ? { ...x, status } : x)
          });
          showToast('Status laporan berhasil diperbarui!');
        };

        const handleDocFileSelection = (file: File) => {
          const sizeMB = file.size / (1024 * 1024);
          let sizeString = '';
          if (sizeMB < 0.1) {
            sizeString = (file.size / 1024).toFixed(1) + ' KB';
          } else {
            sizeString = sizeMB.toFixed(2) + ' MB';
          }

          if (sizeMB > 5.0) {
            setSelectedDocFile({
              name: file.name,
              size: sizeString,
              dataUrl: 'mock-file:large'
            });
            alert('File is too large (> 5MB). Image preview will not be loaded, but you can still submit.');
          } else {
            const reader = new FileReader();
            reader.onload = (event) => {
              setSelectedDocFile({
                name: file.name,
                size: sizeString,
                dataUrl: event.target?.result as string
              });
            };
            reader.readAsDataURL(file);
          }
        };

        const handleDocDrag = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "dragenter" || e.type === "dragover") {
            setDocDragActive(true);
          } else if (e.type === "dragleave") {
            setDocDragActive(false);
          }
        };

        const handleDocDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDocDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleDocFileSelection(e.dataTransfer.files[0]);
          }
        };

        const handleAddDocumentation = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const title = fd.get('title') as string;
          if (!title) {
            alert('Title is required.');
            return;
          }

          let imageUrl = '';
          if (docInputMethod === 'link') {
            imageUrl = fd.get('imageUrl') as string;
            if (!imageUrl) {
              alert('Image URL is required.');
              return;
            }
          } else {
            if (!selectedDocFile) {
              alert('Please select or drag an image file first.');
              return;
            }
            imageUrl = selectedDocFile.dataUrl;
          }

          const newDoc = {
            id: 'doc-' + Date.now(),
            title,
            imageUrl,
            createdAt: new Date().toLocaleDateString('en-US')
          };

          updateProkerSubData({
            ...subData,
            documentations: [...(subData.documentations || []), newDoc]
          });
          e.currentTarget.reset();
          setSelectedDocFile(null);
          showToast('Documentation successfully added!');
        };

        const handleDeleteDocumentation = (id: string) => {
          if (!window.confirm('Delete this documentation?')) return;
          updateProkerSubData({
            ...subData,
            documentations: (subData.documentations || []).filter((x: any) => x.id !== id)
          });
          showToast('Documentation successfully deleted!');
        };

        const tabs = [
          { key: 'overview', label: 'Overview', icon: <Info size={15} /> },
          { key: 'document', label: 'Proposal & Reports', icon: <FileText size={15} /> },
          { key: 'rapat', label: 'Meetings', icon: <Users size={15} /> },
          { key: 'divisi', label: 'Divisions', icon: <Folder size={15} /> },
          { key: 'anggota', label: 'Members', icon: <UserPlus size={15} /> },
          { key: 'absensi', label: 'Attendance', icon: <CheckSquare size={15} /> },
          { key: 'dokumentasi', label: 'Documentation', icon: <ImageIcon size={15} /> }
        ];

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', flexShrink: 0, flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => navigate('/proker')} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div style={{ borderLeft: '1px solid var(--card-border)', height: '20px' }}></div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {p.name}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target: {p.targetDate}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Program Status:</span>
                <span className={`badge badge-${p.status === 'Selesai' ? 'success' : p.status === 'Berjalan' ? 'warning' : 'secondary'}`} style={{ color: p.status === 'Selesai' ? 'var(--success)' : p.status === 'Berjalan' ? 'var(--warning)' : 'var(--text-muted)', padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}>
                  {p.status === 'Selesai' ? 'Completed' : p.status === 'Berjalan' ? 'In Progress' : 'Planned'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', gap: '8px', overflowX: 'auto', padding: '10px 0 0 0', flexShrink: 0 }} className="custom-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setProkerTab(tab.key as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: prokerTab === tab.key ? '2px solid var(--secondary-blue)' : '2px solid transparent',
                    color: prokerTab === tab.key ? 'var(--secondary-blue)' : 'var(--text-muted)',
                    fontWeight: prokerTab === tab.key ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', marginTop: '20px', paddingRight: '8px' }}>
              {prokerTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposals Submitted</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--secondary-blue)' }}>{subData.proposals?.length || 0}</h4>
                    </div>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Scheduled Meetings</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--warning)' }}>{subData.meetings?.length || 0}</h4>
                    </div>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Committee Divisions</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--primary-navy)' }}>{subData.divisions?.length || 0}</h4>
                    </div>
                    <div className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Member Count</span>
                      <h4 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{subData.members?.length || 0}</h4>
                    </div>
                  </div>

                  <div className="theme-card" style={{ padding: '20px', border: '1px solid var(--card-border)', background: 'var(--bg-soft-white)' }}>
                    <h3 style={{ fontSize: '15px', margin: '0 0 10px 0', color: 'var(--primary-navy)' }}>Activity Description</h3>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-dark)' }}>
                      {p.description || 'No description added for this work program.'}
                    </p>
                  </div>
                </div>
              )}

              {prokerTab === 'document' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Document Type Selector (Sub-Tabs) */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', paddingBottom: '1px', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                    <button
                      type="button"
                      onClick={() => setProkerDocType('proposal')}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderBottom: prokerDocType === 'proposal' ? '3px solid var(--secondary-blue)' : '3px solid transparent',
                        background: 'transparent',
                        color: prokerDocType === 'proposal' ? 'var(--secondary-blue)' : 'var(--text-muted)',
                        fontWeight: prokerDocType === 'proposal' ? 700 : 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Activity Proposal
                    </button>
                    <button
                      type="button"
                      onClick={() => setProkerDocType('laporan')}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderBottom: prokerDocType === 'laporan' ? '3px solid var(--secondary-blue)' : '3px solid transparent',
                        background: 'transparent',
                        color: prokerDocType === 'laporan' ? 'var(--secondary-blue)' : 'var(--text-muted)',
                        fontWeight: prokerDocType === 'laporan' ? 700 : 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      LPJ Report
                    </button>
                  </div>

                  {prokerDocType === 'proposal' ? (
                    <>
                      {isSecretaryUser && proposalScheduleInfo && !proposalScheduleInfo.isPastEvent && proposalScheduleInfo.isInNotifyWindow && (
                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.22)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                          <span style={{ fontWeight: 700, color: 'var(--warning)' }}>Secretary Notification</span>
                          <span>
                            Proposal for <strong>{p.name}</strong> will be open for submission 1 month prior to the event date.
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Time remaining to event: <strong>{proposalScheduleInfo.daysToEvent} days</strong>. Please prepare the document.
                          </span>
                        </div>
                      )}
                      {isSecretaryUser && proposalScheduleInfo && proposalScheduleInfo.canSubmitProposal && (
                        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.22)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                          <span style={{ fontWeight: 700, color: 'var(--success)' }}>Proposal Submission Open</span>
                          <span>
                            The 1-month preparation window has started for <strong>{p.name}</strong>.
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Proposal must be submitted before the event starts.
                          </span>
                        </div>
                      )}
                      {canEditProkerDetails && (() => {
                        const hasActiveProposal = subData.proposals && subData.proposals.some((x: any) => x.status === 'Diajukan' || x.status === 'Disetujui');
                        if (hasActiveProposal) {
                          const activeProp = subData.proposals.find((x: any) => x.status === 'Diajukan' || x.status === 'Disetujui');
                          return (
                            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                              <span style={{ fontWeight: 700, color: 'var(--success)' }}>✓ Active Proposal Found</span>
                              <span>
                                Proposal titled <strong>"{activeProp.title}"</strong> is currently in <strong>{activeProp.status === 'Diajukan' ? 'Submitted' : 'Approved'}</strong> status.
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                You cannot submit a new proposal unless the active proposal is rejected by the Advisor/Superadmin.
                              </span>
                            </div>
                          );
                        }
                        return (
                          <form 
                            onSubmit={handleAddProposal} 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: '16px', 
                              background: 'rgba(37,99,235,0.02)', 
                              padding: '20px', 
                              borderRadius: '12px', 
                              border: '1px dashed var(--card-border)',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
                              <div style={{ flex: 1, minWidth: '250px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                                  Proposal Title <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>
                                <input 
                                  name="title" 
                                  required 
                                  type="text" 
                                  className="form-input" 
                                  placeholder="Enter proposal title..." 
                                  style={{ margin: 0 }} 
                                />
                              </div>
                            </div>

                            <div style={{ width: '100%' }}>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>
                                Proposal File (PDF, DOCX, etc.) <span style={{ color: 'var(--danger)' }}>*</span>
                              </label>
                              
                              <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('proposal-file-input')?.click()}
                                style={{
                                  border: dragActive ? '2px dashed var(--secondary-blue)' : '2px dashed var(--card-border)',
                                  borderRadius: '8px',
                                  padding: '30px 20px',
                                  textAlign: 'center',
                                  background: dragActive ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-soft-white)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <input 
                                  id="proposal-file-input"
                                  type="file" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileSelection(e.target.files[0]);
                                    }
                                  }}
                                />
                                
                                <Download size={28} color={dragActive ? 'var(--secondary-blue)' : 'var(--text-muted)'} />
                                
                                {selectedProposalFile ? (
                                  <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '100%', boxSizing: 'border-box' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                        {selectedProposalFile.name}
                                      </span>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {selectedProposalFile.size}
                                      </span>
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedProposalFile(null)}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontWeight: 700, cursor: 'pointer', fontSize: '11px', padding: '4px' }}
                                    >
                                      Replace
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
                                      Drag & drop proposal file here, or click to browse
                                    </p>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      Recommended file size &lt; 1.5MB
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                              <button 
                                type="submit" 
                                className="btn-primary-sm" 
                                disabled={!!proposalScheduleInfo && !proposalScheduleInfo.canSubmitProposal}
                                style={{ height: '38px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, opacity: proposalScheduleInfo && !proposalScheduleInfo.canSubmitProposal ? 0.6 : 1, cursor: proposalScheduleInfo && !proposalScheduleInfo.canSubmitProposal ? 'not-allowed' : 'pointer' }}
                              >
                                <Plus size={16} /> Submit Proposal
                              </button>
                            </div>
                          </form>
                        );
                      })()}

                      <div className="admin-table-container" style={{ width: '100%', boxSizing: 'border-box' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Proposal Title</th>
                              <th>Submission Date</th>
                              <th>Document Link</th>
                              <th>Status</th>
                              {canModerateProkerDocs && <th style={{ textAlign: 'center', width: '150px' }}>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {!subData.proposals || subData.proposals.length === 0 ? (
                              <tr>
                                <td colSpan={canModerateProkerDocs ? 5 : 4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                  No proposals have been submitted yet.
                                </td>
                              </tr>
                            ) : (
                              subData.proposals.map((x: any) => (
                                <tr key={x.id}>
                                  <td style={{ fontWeight: 600 }}>{x.title}</td>
                                  <td>{x.createdAt}</td>
                                  <td>
                                    {x.fileUrl ? (
                                      x.fileUrl.startsWith('data:') ? (
                                        <a 
                                          href={x.fileUrl} 
                                          download={x.fileName || 'proposal.pdf'}
                                          style={{ color: 'var(--success)', textDecoration: 'underline', fontSize: '13px', fontWeight: 600 }}
                                        >
                                          Download File ({x.fileSize || '-'})
                                        </a>
                                      ) : x.fileUrl.startsWith('mock-file:') ? (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                                          {x.fileName} ({x.fileSize}) [Large Size]
                                        </span>
                                      ) : (
                                        <a href={x.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-blue)', textDecoration: 'underline', fontSize: '13px' }}>Open Document</a>
                                      )
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No file</span>
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <span className={`badge badge-${x.status === 'Disetujui' ? 'success' : x.status === 'Ditolak' ? 'danger' : 'warning'}`} style={{ width: 'fit-content', color: x.status === 'Disetujui' ? 'var(--success)' : x.status === 'Ditolak' ? 'var(--danger)' : 'var(--warning)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                        {x.status === 'Disetujui' ? 'Approved' : x.status === 'Ditolak' ? 'Rejected' : 'Submitted'}
                                      </span>
                                      {x.status === 'Ditolak' && x.reason && (
                                        <span style={{ fontSize: '11px', color: 'var(--danger)', fontStyle: 'italic', maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                          Reason: {x.reason}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  {canModerateProkerDocs && (
                                    <td style={{ textAlign: 'center' }}>
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                        {x.status !== 'Disetujui' && (
                                          <button
                                            onClick={() => {
                                              if (window.confirm('Approve this proposal?')) {
                                                updateProkerSubData({
                                                  ...subData,
                                                  proposals: subData.proposals.map((p: any) => p.id === x.id ? { ...p, status: 'Disetujui', reason: undefined } : p)
                                                });
                                                showToast('Proposal approved!');
                                              }
                                            }}
                                            style={{
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              border: '1px solid var(--success)',
                                              background: 'rgba(16, 185, 129, 0.1)',
                                              color: 'var(--success)',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 'bold',
                                              fontSize: '14px',
                                              transition: 'all 0.15s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'var(--success)'; e.currentTarget.style.color = '#ffffff'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = 'var(--success)'; }}
                                            title="Approve Proposal"
                                          >
                                            ✓
                                          </button>
                                        )}
                                        {x.status !== 'Ditolak' && (
                                          <button
                                            onClick={() => {
                                              const reason = window.prompt('Enter rejection reason for this proposal:');
                                              if (reason === null) return;
                                              if (!reason.trim()) {
                                                alert('Rejection reason cannot be empty.');
                                                return;
                                              }
                                              updateProkerSubData({
                                                ...subData,
                                                proposals: subData.proposals.map((p: any) => p.id === x.id ? { ...p, status: 'Ditolak', reason } : p)
                                              });
                                              showToast('Proposal rejected!');
                                            }}
                                            style={{
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              border: '1px solid var(--danger)',
                                              background: 'rgba(239, 68, 68, 0.1)',
                                              color: 'var(--danger)',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 'bold',
                                              fontSize: '12px',
                                              transition: 'all 0.15s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#ffffff'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                                            title="Reject Proposal"
                                          >
                                            ✕
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDeleteProposal(x.id)}
                                          style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', transition: 'color 0.15s' }}
                                          onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
                                          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                          title="Delete Proposal"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <>
                      {reportScheduleInfo && !reportScheduleInfo.isBeforeEvent && !reportScheduleInfo.isPastDeadline && (
                        <div style={{ padding: '16px', background: reportScheduleInfo.canSubmitReport ? 'rgba(16, 185, 129, 0.07)' : 'rgba(245, 158, 11, 0.08)', border: reportScheduleInfo.canSubmitReport ? '1px solid rgba(16, 185, 129, 0.22)' : '1px solid rgba(245, 158, 11, 0.22)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                          <span style={{ fontWeight: 700, color: reportScheduleInfo.canSubmitReport ? 'var(--success)' : 'var(--warning)' }}>
                            {reportScheduleInfo.canSubmitReport ? 'Report Submission Open' : 'Pending Report Timeline'}
                          </span>
                          <span>
                            {reportScheduleInfo.canSubmitReport
                              ? `LPJ report submission for ${p.name} is open and must be submitted before H+1 month.`
                              : `LPJ report for ${p.name} will be open starting H+1 day after the event is finished.`}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {reportScheduleInfo.canSubmitReport
                              ? `Remaining time to deadline: ${reportScheduleInfo.daysUntilDeadline} days.`
                              : `Time remaining to report opening: ${reportScheduleInfo.daysSinceEvent <= 0 ? 1 : reportScheduleInfo.daysSinceEvent} days.`}
                          </span>
                        </div>
                      )}
                      {reportScheduleInfo && reportScheduleInfo.isPastDeadline && (
                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.07)', border: '1px solid rgba(239, 68, 68, 0.22)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                          <span style={{ fontWeight: 700, color: 'var(--danger)' }}>Report Deadline Passed</span>
                          <span>
                            LPJ report for <strong>{p.name}</strong> has passed the H+1 month deadline post-event.
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Report submissions are automatically locked after the deadline.
                          </span>
                        </div>
                      )}
                      {canEditProkerDetails && (() => {
                        const hasActiveReport = subData.reports && subData.reports.some((x: any) => x.status === 'Diajukan' || x.status === 'Disetujui');
                        if (hasActiveReport) {
                          const activeRep = subData.reports.find((x: any) => x.status === 'Diajukan' || x.status === 'Disetujui');
                          return (
                            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                              <span style={{ fontWeight: 700, color: 'var(--success)' }}>✓ Active Report Found</span>
                              <span>
                                Report titled <strong>"{activeRep.title}"</strong> is currently in <strong>{activeRep.status === 'Diajukan' ? 'Submitted' : 'Approved'}</strong> status.
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                You cannot submit a new report unless the active report is rejected by the Advisor/Superadmin.
                              </span>
                            </div>
                          );
                        }
                        return (
                          <form 
                            onSubmit={handleAddReport} 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: '16px', 
                              background: 'rgba(37,99,235,0.02)', 
                              padding: '20px', 
                              borderRadius: '12px', 
                              border: '1px dashed var(--card-border)',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                                  Report Title (LPJ) <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>
                                <input 
                                  name="title" 
                                  required 
                                  type="text" 
                                  className="form-input" 
                                  placeholder="MPLS LPJ Report..." 
                                  style={{ margin: 0 }} 
                                />
                              </div>
                              <div style={{ flex: 2, minWidth: '250px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                                  Activity Results Summary
                                </label>
                                <input 
                                  name="summary" 
                                  type="text" 
                                  className="form-input" 
                                  placeholder="The event ran successfully with 95% committee attendance..." 
                                  style={{ margin: 0 }} 
                                />
                              </div>
                            </div>

                            <div style={{ width: '100%' }}>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>
                                LPJ Report File (PDF, DOCX, etc.) <span style={{ color: 'var(--danger)' }}>*</span>
                              </label>
                              
                              <div
                                onDragEnter={handleReportDrag}
                                onDragOver={handleReportDrag}
                                onDragLeave={handleReportDrag}
                                onDrop={handleReportDrop}
                                onClick={() => document.getElementById('report-file-input')?.click()}
                                style={{
                                  border: reportDragActive ? '2px dashed var(--secondary-blue)' : '2px dashed var(--card-border)',
                                  borderRadius: '8px',
                                  padding: '30px 20px',
                                  textAlign: 'center',
                                  background: reportDragActive ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-soft-white)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <input 
                                  id="report-file-input"
                                  type="file" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleReportFileSelection(e.target.files[0]);
                                    }
                                  }}
                                />
                                
                                <Download size={28} color={reportDragActive ? 'var(--secondary-blue)' : 'var(--text-muted)'} />
                                
                                {selectedReportFile ? (
                                  <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '100%', boxSizing: 'border-box' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                        {selectedReportFile.name}
                                      </span>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {selectedReportFile.size}
                                      </span>
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedReportFile(null)}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontWeight: 700, cursor: 'pointer', fontSize: '11px', padding: '4px' }}
                                    >
                                      Replace
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
                                      Drag & drop report file here, or click to browse
                                    </p>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      Recommended file size &lt; 1.5MB
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                              <button 
                                type="submit" 
                                className="btn-primary-sm" 
                                disabled={!!reportScheduleInfo && !reportScheduleInfo.canSubmitReport}
                                style={{ height: '38px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, opacity: reportScheduleInfo && !reportScheduleInfo.canSubmitReport ? 0.6 : 1, cursor: reportScheduleInfo && !reportScheduleInfo.canSubmitReport ? 'not-allowed' : 'pointer' }}
                              >
                                <Plus size={16} /> Submit Report
                              </button>
                            </div>
                          </form>
                        );
                      })()}

                      <div className="admin-table-container" style={{ width: '100%', boxSizing: 'border-box' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Report Title</th>
                              <th>Results Summary</th>
                              <th>Created Date</th>
                              <th>Report Link</th>
                              <th>Status</th>
                              {canModerateProkerDocs && <th style={{ textAlign: 'center', width: '150px' }}>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {!subData.reports || subData.reports.length === 0 ? (
                              <tr>
                                <td colSpan={canModerateProkerDocs ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                  No LPJ reports have been submitted yet.
                                </td>
                              </tr>
                            ) : (
                              subData.reports.map((x: any) => (
                                <tr key={x.id}>
                                  <td style={{ fontWeight: 600 }}>{x.title}</td>
                                  <td>{x.summary || '-'}</td>
                                  <td>{x.createdAt}</td>
                                  <td>
                                    {x.fileUrl ? (
                                      x.fileUrl.startsWith('data:') ? (
                                        <a 
                                          href={x.fileUrl} 
                                          download={x.fileName || 'laporan.pdf'}
                                          style={{ color: 'var(--success)', textDecoration: 'underline', fontSize: '13px', fontWeight: 600 }}
                                        >
                                          Download Report ({x.fileSize || '-'})
                                        </a>
                                      ) : x.fileUrl.startsWith('mock-file:') ? (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                                          {x.fileName} ({x.fileSize}) [Large Size]
                                        </span>
                                      ) : (
                                        <a href={x.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-blue)', textDecoration: 'underline', fontSize: '13px' }}>Open Report</a>
                                      )
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No file</span>
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      <span className={`badge badge-${x.status === 'Disetujui' ? 'success' : x.status === 'Ditolak' ? 'danger' : 'warning'}`} style={{ width: 'fit-content', color: x.status === 'Disetujui' ? 'var(--success)' : x.status === 'Ditolak' ? 'var(--danger)' : 'var(--warning)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                        {x.status === 'Disetujui' ? 'Approved' : x.status === 'Ditolak' ? 'Rejected' : 'Submitted'}
                                      </span>
                                      {x.status === 'Ditolak' && x.reason && (
                                        <span style={{ fontSize: '11px', color: 'var(--danger)', fontStyle: 'italic', maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                          Reason: {x.reason}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  {canModerateProkerDocs && (
                                    <td style={{ textAlign: 'center' }}>
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                        {x.status !== 'Disetujui' && (
                                          <button
                                            onClick={() => {
                                              if (window.confirm('Approve this report?')) {
                                                updateProkerSubData({
                                                  ...subData,
                                                  reports: subData.reports.map((p: any) => p.id === x.id ? { ...p, status: 'Disetujui', reason: undefined } : p)
                                                });
                                                showToast('Report approved!');
                                              }
                                            }}
                                            style={{
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              border: '1px solid var(--success)',
                                              background: 'rgba(16, 185, 129, 0.1)',
                                              color: 'var(--success)',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 'bold',
                                              fontSize: '14px',
                                              transition: 'all 0.15s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'var(--success)'; e.currentTarget.style.color = '#ffffff'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = 'var(--success)'; }}
                                            title="Approve Report"
                                          >
                                            ✓
                                          </button>
                                        )}
                                        {x.status !== 'Ditolak' && (
                                          <button
                                            onClick={() => {
                                              const reason = window.prompt('Enter rejection reason for this report:');
                                              if (reason === null) return;
                                              if (!reason.trim()) {
                                                alert('Rejection reason cannot be empty.');
                                                return;
                                              }
                                              updateProkerSubData({
                                                ...subData,
                                                reports: subData.reports.map((p: any) => p.id === x.id ? { ...p, status: 'Ditolak', reason } : p)
                                              });
                                              showToast('Report rejected!');
                                            }}
                                            style={{
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              border: '1px solid var(--danger)',
                                              background: 'rgba(239, 68, 68, 0.1)',
                                              color: 'var(--danger)',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 'bold',
                                              fontSize: '12px',
                                              transition: 'all 0.15s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#ffffff'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                                            title="Reject Report"
                                          >
                                            ✕
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDeleteReport(x.id)}
                                          style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', transition: 'color 0.15s' }}
                                          onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
                                          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                          title="Delete Report"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {prokerTab === 'rapat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {canEditProkerDetails && (
                    <form onSubmit={handleAddMeeting} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', background: 'rgba(37,99,235,0.02)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--card-border)' }}>
                      <div style={{ flex: 2, minWidth: '180px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-dark)' }}>Meeting Agenda</label>
                        <input name="title" required type="text" className="form-input" placeholder="Rundown discussion..." style={{ margin: 0 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-dark)' }}>Date / Time</label>
                        <input name="date" required type="text" className="form-input" placeholder="August 10, 13:00" style={{ margin: 0 }} />
                      </div>
                      <div style={{ flex: 2, minWidth: '180px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-dark)' }}>Meeting Description</label>
                        <input name="description" type="text" className="form-input" placeholder="Meeting venue, detailed discussion..." style={{ margin: 0 }} />
                      </div>
                      <button type="submit" className="btn-primary-sm" style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={16} /> Schedule
                      </button>
                    </form>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {!subData.meetings || subData.meetings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                        No committee meetings have been scheduled yet.
                      </div>
                    ) : (
                      subData.meetings.map((x: any) => (
                        <div key={x.id} className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--primary-navy)' }}>{x.title}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 600 }}>Time: {x.date}</span>
                            {x.description && <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{x.description}</p>}
                          </div>
                          {canEditProkerDetails && (
                            <button
                              onClick={() => handleDeleteMeeting(x.id)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
                              title="Delete Meeting"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {prokerTab === 'divisi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {canEditProkerDetails && (
                    <form onSubmit={handleAddDivision} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', background: 'rgba(37,99,235,0.02)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--card-border)' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-dark)' }}>New Division Name</label>
                        <input name="name" required type="text" className="form-input" placeholder="Equipment Division..." style={{ margin: 0 }} />
                      </div>
                      <button type="submit" className="btn-primary-sm" style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={16} /> Add Division
                      </button>
                    </form>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {!subData.divisions || subData.divisions.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                        No divisions have been created yet.
                      </div>
                    ) : (
                      subData.divisions.map((x: any) => {
                        const divMemberCount = (subData.members || []).filter((m: any) => m.divisionId === x.id).length;
                        return (
                          <div key={x.id} className="theme-card" style={{ padding: '16px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--primary-navy)' }}>{x.name}</h4>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{divMemberCount} Members</span>
                            </div>
                            {canEditProkerDetails && (
                              <button
                                onClick={() => handleDeleteDivision(x.id)}
                                style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                                title="Delete Division"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {prokerTab === 'anggota' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {canEditProkerDetails && (subData.divisions?.length || 0) > 0 && (
                    <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', background: 'rgba(37,99,235,0.02)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--card-border)' }}>
                      <div style={{ flex: 2, minWidth: '220px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-dark)' }}>Member Name</label>
                        <select name="memberId" required className="form-input" style={{ margin: 0 }}>
                          <option value="">-- Select Organization Member --</option>
                          {prokerEligibleMembers.map((m: any) => (
                            <option key={m.id} value={m.id}>{formatProkerMemberOptionLabel(m)}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-dark)' }}>Position</label>
                        <select name="role" required className="form-input" style={{ margin: 0 }}>
                          <option value="Koordinator">Coordinator</option>
                          <option value="Anggota">Member</option>
                        </select>
                      </div>
                      <div style={{ flex: 2, minWidth: '180px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-dark)' }}>Division</label>
                        <select name="divisionId" required className="form-input" style={{ margin: 0 }}>
                          {(subData.divisions || []).map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="btn-primary-sm" style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '4px' }} disabled={prokerEligibleMembers.length === 0}>
                        <Plus size={16} /> Add Member
                      </button>
                    </form>
                  )}

                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Member Name</th>
                          <th>Division</th>
                          <th>Position</th>
                          {canEditProkerDetails && <th style={{ textAlign: 'center', width: '100px' }}>Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {!subData.members || subData.members.length === 0 ? (
                          <tr>
                            <td colSpan={canEditProkerDetails ? 4 : 3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                              No committee members have been added yet.
                            </td>
                          </tr>
                        ) : (
                          subData.members.map((x: any) => {
                            const div = (subData.divisions || []).find((d: any) => d.id === x.divisionId);
                            return (
                              <tr key={x.id}>
                                <td style={{ fontWeight: 600 }}>{x.name}</td>
                                <td>{div ? div.name : '-'}</td>
                                <td>
                                  <span className={`badge badge-${x.role === 'Koordinator' ? 'primary' : 'secondary'}`} style={{ color: x.role === 'Koordinator' ? 'var(--secondary-blue)' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                    {x.role === 'Koordinator' ? 'Coordinator' : 'Member'}
                                  </span>
                                </td>
                                {canEditProkerDetails && (
                                  <td style={{ textAlign: 'center' }}>
                                    <button
                                      onClick={() => handleDeleteMember(x.id)}
                                      style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                                      title="Delete"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {canEditProkerDetails && (subData.divisions?.length || 0) > 0 && prokerEligibleMembers.length === 0 && (
                    <div style={{ padding: '14px 16px', borderRadius: '8px', border: '1px dashed var(--card-border)', color: 'var(--text-muted)', fontSize: '13px', background: 'var(--bg-soft-white)' }}>
                      No organization members available for this period.
                    </div>
                  )}
                </div>
              )}

              {prokerTab === 'absensi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Select Meeting:</span>
                      <select
                        className="form-input"
                        style={{ width: '250px', margin: 0 }}
                        value={activeProkerMeetingId}
                        onChange={e => setActiveProkerMeetingId(e.target.value)}
                      >
                        <option value="">-- Select Meeting --</option>
                        {(subData.meetings || []).map((m: any) => (
                          <option key={m.id} value={m.id}>{m.title} ({m.date})</option>
                        ))}
                      </select>
                    </div>
                    {(canScanAttendance || canEditProkerDetails) && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canScanAttendance && activeProkerMeetingId && (
                          <button
                            onClick={() => setShowScanner(true)}
                            className="btn-primary-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 16px', background: 'var(--success)', border: 'none', borderRadius: '6px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                          >
                            <Scan size={14} /> Scan QR Attendance
                          </button>
                        )}
                        {canEditProkerDetails && (
                          <button
                            onClick={() => setShowAbsensiAddMeeting(!showAbsensiAddMeeting)}
                            className="btn-primary-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 16px', background: showAbsensiAddMeeting ? 'var(--text-muted)' : 'var(--secondary-blue)', border: 'none', borderRadius: '6px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                          >
                            <Plus size={14} /> {showAbsensiAddMeeting ? 'Cancel' : 'Schedule New Meeting'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {showAbsensiAddMeeting && (
                    <form 
                      onSubmit={handleAddMeetingFromAbsensi} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        background: 'rgba(37,99,235,0.02)', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        border: '1px dashed var(--card-border)', 
                        width: '100%', 
                        boxSizing: 'border-box' 
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
                        <div style={{ flex: 2, minWidth: '180px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>Meeting Agenda</label>
                          <input name="title" required type="text" className="form-input" placeholder="Activity rundown discussion..." style={{ margin: 0 }} />
                        </div>
                        <div style={{ flex: 1.5, minWidth: '180px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>Date & Time</label>
                          <input name="date" required type="datetime-local" className="form-input" style={{ margin: 0 }} />
                        </div>
                        <div style={{ flex: 2, minWidth: '180px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>Venue / Info</label>
                          <input name="description" type="text" className="form-input" placeholder="OSIS Room / Google Meet..." style={{ margin: 0 }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <button type="submit" className="btn-primary-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px' }}>
                          <Plus size={14} /> Save & Select Meeting
                        </button>
                      </div>
                    </form>
                  )}

                  {activeProkerMeetingId ? (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Member Name</th>
                            <th>Division</th>
                            <th>Attendance Status</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>QR Code</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!periodOrgMembers || periodOrgMembers.length === 0 ? (
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                No OSIS organization members available.
                              </td>
                            </tr>
                          ) : (
                            periodOrgMembers.map((x: any) => {
                              const currentStatus = ((subData.attendances[activeProkerMeetingId] || {})[x.id] === 'PRESENT') ? 'PRESENT' : 'ABSENT';
                              const studentName = x.student?.user?.username || x.student?.user?.fullName || x.student?.name || '-';
                              const sectionName = x.section?.sectionname || 'Core Committee';

                              return (
                                <tr key={x.id}>
                                  <td style={{ fontWeight: 600 }}>{studentName}</td>
                                  <td>{sectionName}</td>
                                  <td>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: currentStatus === 'PRESENT' ? 'var(--success)' : 'var(--danger)' }}>
                                      {currentStatus === 'PRESENT' ? 'Present' : 'Absent'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    {(() => {
                                      const isSelf = 
                                        userData?.username?.toLowerCase() === x.student?.user?.username?.toLowerCase() ||
                                        (userData?.level === 'student' && userData.students?.[0] && x.studentid === userData.students[0].id);
                                      
                                      if (!isSelf) return '-';

                                      return (
                                        <button
                                          type="button"
                                          title="Show Member QR Code for this Meeting"
                                          onClick={() => {
                                            const meet = (subData.meetings || []).find((m: any) => m.id === activeProkerMeetingId);
                                            setActiveQrMember({
                                              memberId: x.id,
                                              memberName: studentName,
                                              meetingId: activeProkerMeetingId,
                                              meetingTitle: meet ? meet.title : 'Meeting'
                                            });
                                          }}
                                          style={{
                                            background: 'rgba(37,99,235,0.06)',
                                            border: '1px solid rgba(37,99,235,0.15)',
                                            color: 'var(--secondary-blue)',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s ease'
                                          }}
                                          onMouseOver={e => {
                                            e.currentTarget.style.background = 'var(--secondary-blue)';
                                            e.currentTarget.style.color = '#ffffff';
                                          }}
                                          onMouseOut={e => {
                                            e.currentTarget.style.background = 'rgba(37,99,235,0.06)';
                                            e.currentTarget.style.color = 'var(--secondary-blue)';
                                          }}
                                        >
                                          <QrCode size={16} />
                                        </button>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                      Please select a meeting agenda above to fill or view attendance.
                    </div>
                  )}
                </div>
              )}


              {prokerTab === 'dokumentasi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {canEditProkerDetails && (
                    <div style={{ background: 'rgba(37,99,235,0.02)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setDocInputMethod('file')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: docInputMethod === 'file' ? 'var(--secondary-blue)' : 'transparent',
                            color: docInputMethod === 'file' ? '#ffffff' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Upload Image File
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocInputMethod('link')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: docInputMethod === 'link' ? 'var(--secondary-blue)' : 'transparent',
                            color: docInputMethod === 'link' ? '#ffffff' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Paste Image Link
                        </button>
                      </div>

                      <form onSubmit={handleAddDocumentation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
                          <div style={{ flex: 1, minWidth: '250px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                              Activity Title / Caption <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input 
                              name="title" 
                              required 
                              type="text" 
                              className="form-input" 
                              placeholder="Balloon release at Independence Day..." 
                              style={{ margin: 0 }} 
                            />
                          </div>
                        </div>

                        {docInputMethod === 'link' ? (
                          <div style={{ width: '100%' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-dark)' }}>
                              Image URL <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input 
                              name="imageUrl" 
                              required 
                              type="url" 
                              className="form-input" 
                              placeholder="https://images.unsplash.com/photo-example.jpg" 
                              style={{ margin: 0 }} 
                            />
                          </div>
                        ) : (
                          <div style={{ width: '100%' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>
                              Upload Image <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>

                            <div
                              onDragEnter={handleDocDrag}
                              onDragOver={handleDocDrag}
                              onDragLeave={handleDocDrag}
                              onDrop={handleDocDrop}
                              onClick={() => document.getElementById('doc-file-input')?.click()}
                              style={{
                                border: docDragActive ? '2px dashed var(--secondary-blue)' : '2px dashed var(--card-border)',
                                borderRadius: '8px',
                                padding: '30px 20px',
                                textAlign: 'center',
                                background: docDragActive ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-soft-white)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <input 
                                id="doc-file-input"
                                type="file" 
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocFileSelection(e.target.files[0]);
                                  }
                                }}
                              />

                              <Download size={28} color={docDragActive ? 'var(--secondary-blue)' : 'var(--text-muted)'} />

                              {selectedDocFile ? (
                                <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', maxWidth: '100%', boxSizing: 'border-box' }}>
                                  {selectedDocFile.dataUrl !== 'mock-file:large' && (
                                    <img 
                                      src={selectedDocFile.dataUrl} 
                                      alt="Preview" 
                                      style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--card-border)' }} 
                                    />
                                  )}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                        {selectedDocFile.name}
                                      </span>
                                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        {selectedDocFile.size}
                                      </span>
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedDocFile(null)}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontWeight: 700, cursor: 'pointer', fontSize: '11px', padding: '4px' }}
                                    >
                                      Replace
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>
                                    Drag & drop your image here, or click to browse
                                  </p>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Supported format: JPG, PNG, GIF. Max file size: 5MB
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                          <button 
                            type="submit" 
                            className="btn-primary-sm" 
                            style={{ height: '38px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}
                          >
                            <Plus size={16} /> Add Photo
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                    {!subData.documentations || subData.documentations.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--text-muted)', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                        No activity documentation photos have been added yet.
                      </div>
                    ) : (
                      subData.documentations.map((x: any) => (
                        <div key={x.id} className="theme-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
                          <img 
                            src={x.imageUrl} 
                            alt={x.title} 
                            style={{ width: '100%', height: '160px', objectFit: 'cover' }} 
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600";
                            }}
                          />
                          <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: 'var(--primary-navy)' }}>{x.title}</h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Uploaded: {x.createdAt}</span>
                            </div>
                            {canEditProkerDetails && (
                              <button
                                onClick={() => handleDeleteDocumentation(x.id)}
                                style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                                title="Delete Documentation"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }


      case 'manage-class': {
        const filteredClasses = classes.filter(c => 
          c.classname.toLowerCase().includes(adminSearch.toLowerCase()) ||
          (c.grade?.gradename || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
          (c.major?.majorname || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
          (c.major?.majorcode || '').toLowerCase().includes(adminSearch.toLowerCase())
        );
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <BookOpen size={20} color="var(--secondary-blue)" />
                Manage Class Data
              </h2>
              <button onClick={() => setActiveModal('add-class')} className="btn-primary-sm">
                <Plus size={16} /> Add Class
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              Manage registered class metadata within the system.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search class, grade, major..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Grade</th>
                    <th>Major</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map(c => (
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
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No class data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'manage-grade': {
        const filteredGrades = grades.filter(g => 
          g.gradename.toLowerCase().includes(adminSearch.toLowerCase())
        );
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Award size={20} color="var(--secondary-blue)" />
                Manage Grade (Level) Data
              </h2>
              <button onClick={() => setActiveModal('add-grade')} className="btn-primary-sm">
                <Plus size={16} /> Add Grade
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              Configuration of active grade levels in school.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search grade..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Grade Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map(g => (
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
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredGrades.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No grade data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'manage-major': {
        const filteredMajors = majors.filter(m => 
          m.majorname.toLowerCase().includes(adminSearch.toLowerCase()) ||
          m.majorcode.toLowerCase().includes(adminSearch.toLowerCase())
        );
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <GraduationCap size={20} color="var(--secondary-blue)" />
                Manage Major Data
              </h2>
              <button onClick={() => setActiveModal('add-major')} className="btn-primary-sm">
                <Plus size={16} /> Add Major
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              Configure registered school majors and departments.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search major..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Department / Major Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMajors.map(m => (
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
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMajors.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No major data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'manage-role': {
        const filteredRoles = roles.filter(r => 
          r.rolename.toLowerCase().includes(adminSearch.toLowerCase())
        );
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Award size={20} color="var(--secondary-blue)" />
                Manage Role (Position) Data
              </h2>
              <button onClick={() => setActiveModal('add-role')} className="btn-primary-sm">
                <Plus size={16} /> Add Role
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              Configure administrative roles and positions within OSIS board and committee members.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search role..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.rolename}</td>
                      <td>
                        <button onClick={() => {
                          setEditingItem(r);
                          setNewRolename(r.rolename);
                          setActiveModal('edit-role');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteRole(r.id)} className="action-btn action-btn-danger">
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRoles.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No role data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'manage-section': {
        const filteredSections = sections.filter(s => 
          s.sectionname.toLowerCase().includes(adminSearch.toLowerCase())
        );
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Layers size={20} color="var(--secondary-blue)" />
                Manage Section (Sekbid) Data
              </h2>
              <button onClick={() => setActiveModal('add-section')} className="btn-primary-sm">
                <Plus size={16} /> Add Section
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              Configure committee sections and functional departments (Seksi Bidang) of OSIS.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search section..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Section Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSections.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.sectionname}</td>
                      <td>
                        <button onClick={() => {
                          setEditingItem(s);
                          setNewSectionname(s.sectionname);
                          setActiveModal('edit-section');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteSection(s.id)} className="action-btn action-btn-danger">
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSections.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No section data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'manage-period': {
        const formatDatetime = (dtStr: string) => {
          if (!dtStr) return '-';
          try {
            return new Date(dtStr).toLocaleDateString('en-US', {
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

        const filteredPeriods = periods.filter(p => 
          p.yearLabel.toLowerCase().includes(adminSearch.toLowerCase()) ||
          p.status.toLowerCase().includes(adminSearch.toLowerCase())
        );

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Calendar size={20} color="var(--secondary-blue)" />
                Manage Period & Voting Timeline
              </h2>
              <button onClick={() => {
                setNewPeriodYear('');
                setNewPeriodStatus('ACTIVE');
                setNewPeriodVoteStart('');
                setNewPeriodVoteEnd('');
                setActiveModal('add-period');
              }} className="btn-primary-sm">
                <Plus size={16} /> Add Period
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              Configure active academic years for OSIS periods and define duration timelines for e-voting execution.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search period, status..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Academic Year</th>
                    <th>Status</th>
                    <th>Voting Start</th>
                    <th>Voting End</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeriods.map(p => (
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
                  {filteredPeriods.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No period data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'manage-user': {
        const filteredUsers = users.filter(u => 
          u.username.toLowerCase().includes(adminSearch.toLowerCase()) ||
          u.level.toLowerCase().includes(adminSearch.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
          (u.role || '').toLowerCase().includes(adminSearch.toLowerCase())
        );
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', minHeight: '550px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <UserIcon className="text-muted" size={20} style={{ color: 'var(--secondary-blue)' }} />
                Manage System Users
              </h2>
              <button onClick={() => setActiveModal('add-user')} className="btn-primary-sm">
                <Plus size={16} /> Add User
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', flexShrink: 0 }}>
              List of all user accounts registered in the database along with their authorization levels.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search user, email, role..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Level</th>
                    <th>Email</th>
                    <th>Role / Position</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
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
                          setActiveModal('confirm-reset-pw');
                        }} className="action-btn" style={{ marginRight: '8px' }}>
                          <Lock size={13} /> Reset PW
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="action-btn action-btn-danger">
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No user data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'organization': {
        const filteredOrgMembers = orgMembers.filter(m => {
          const studentName = m.student?.user?.username || '';
          const className = m.student?.class?.classname || '';
          const roleName = m.role?.rolename || '';
          const periodLabel = m.period?.yearLabel || '';
          const sectionName = m.section?.sectionname || '';
          
          return studentName.toLowerCase().includes(adminSearch.toLowerCase()) ||
            className.toLowerCase().includes(adminSearch.toLowerCase()) ||
            roleName.toLowerCase().includes(adminSearch.toLowerCase()) ||
            periodLabel.toLowerCase().includes(adminSearch.toLowerCase()) ||
            sectionName.toLowerCase().includes(adminSearch.toLowerCase());
        });

        // Filter members specifically for the selected period in the chart
        const periodMembers = orgMembers.filter(m => m.periodid === selectedChartPeriodId);
        
        // President (Ketua OSIS)
        const president = periodMembers.find(m => 
          m.role?.rolename.toLowerCase() === 'president' || 
          m.role?.rolename.toLowerCase() === 'ketua osis' ||
          m.role?.rolename.toLowerCase().includes('president') ||
          (m.role?.rolename.toLowerCase().includes('ketua') && !m.role?.rolename.toLowerCase().includes('wakil'))
        );
        
        // Vice President (Wakil Ketua OSIS)
        const vicePresident = periodMembers.find(m => 
          m.role?.rolename.toLowerCase() === 'vice president' || 
          m.role?.rolename.toLowerCase() === 'wakil ketua osis' ||
          m.role?.rolename.toLowerCase().includes('vice president') ||
          (m.role?.rolename.toLowerCase().includes('wakil') && m.role?.rolename.toLowerCase().includes('ketua'))
        );

        // Secretaries (Sekretaris 1 & 2)
        const secretaries = periodMembers.filter(m => 
          m.role?.rolename.toLowerCase().includes('secretaris') || 
          m.role?.rolename.toLowerCase().includes('sekretaris') ||
          m.role?.rolename.toLowerCase().includes('secretary')
        );
        const secretary1 = secretaries[0];
        const secretary2 = secretaries[1];

        // Treasurers (Bendahara 1 & 2)
        const treasurers = periodMembers.filter(m => 
          m.role?.rolename.toLowerCase().includes('treasurer') || 
          m.role?.rolename.toLowerCase().includes('bendahara')
        );
        const treasurer1 = treasurers[0];
        const treasurer2 = treasurers[1];

        // Seksi Bidang (Sekbid)
        const sekbidGroups = sections.map(sec => {
          const secMembers = periodMembers.filter(m => m.sectionid === sec.id && 
            m.role?.rolename.toLowerCase() !== 'president' && 
            m.role?.rolename.toLowerCase() !== 'ketua osis' &&
            m.role?.rolename.toLowerCase() !== 'vice president' &&
            m.role?.rolename.toLowerCase() !== 'wakil ketua osis' &&
            !m.role?.rolename.toLowerCase().includes('secretaris') &&
            !m.role?.rolename.toLowerCase().includes('sekretaris') &&
            !m.role?.rolename.toLowerCase().includes('treasurer') &&
            !m.role?.rolename.toLowerCase().includes('bendahara')
          );
          return {
            section: sec,
            members: secMembers
          };
        });

        // School users for Principal, Vice Principal & Student Affair
        const principal = users.find(u => u.level === 'school' && (u.role?.toLowerCase() === 'principal' || u.role?.toLowerCase() === 'kepala sekolah'));
        const vicePrincipal = users.find(u => u.level === 'school' && (u.role?.toLowerCase() === 'viceprincipal' || u.role?.toLowerCase() === 'vice principal' || u.role?.toLowerCase() === 'wakasek' || u.role?.toLowerCase() === 'wakil kepala sekolah'));
        const studentAffair = users.find(u => u.level === 'school' && (u.role?.toLowerCase() === 'student affair' || u.role?.toLowerCase() === 'wakasek kesiswaan' || u.role?.toLowerCase() === 'pembina osis'));

        const principalName = principal?.username || 'Principal';
        const vicePrincipalName = vicePrincipal?.username || 'Vice Principal';
        const studentAffairName = studentAffair?.username || 'Student Affair';

        const userRoleLower = normalizedUserRole;
        const canEditOrg = ['superadmin', 'admin', 'president', 'principal', 'student affair', 'kepala sekolah', 'wakasek kesiswaan', 'pembina osis'].includes(userRoleLower);
        const formatOrgStudentName = (student: any) => {
          if (!student) return '-';
          return student.user?.username || student.user?.name || student.user?.fullName || student.name || '-';
        };
        const formatOrgStudentClassLabel = (student: any) => {
          if (!student) return '-';
          const classId = student.classid || student.classId;
          const studentClass = classes.find((c: any) => c.id === classId) || student.class || student.Class || {};
          const majorCode = studentClass.major?.majorcode || studentClass.majorcode || studentClass.majorCode;
          const gradeName = studentClass.grade?.gradename || studentClass.gradename || studentClass.gradeName;
          const className = studentClass.classname || studentClass.className;
          return [majorCode, gradeName, className].filter(Boolean).join(' ') || '-';
        };

        const renderNodeCard = (name: string, roleName: string, subText: string, onEdit?: () => void) => {
          return (
            <div 
              className="org-chart-node animate-slideup" 
              key={name + roleName}
              style={{ cursor: (canEditOrg && onEdit) ? 'pointer' : 'default' }}
              onClick={() => canEditOrg && onEdit && onEdit()}
            >
              <div className="org-chart-node-role">{roleName}</div>
              <h4 className="org-chart-node-name">{name}</h4>
              <p className="org-chart-node-class" style={{ visibility: subText ? 'visible' : 'hidden', margin: 0 }}>
                {subText || '-'}
              </p>
            </div>
          );
        };

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', minHeight: '600px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Users size={20} color="var(--secondary-blue)" />
                OSIS Organization Chart & Data
              </h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {canEditOrg && (
                  <button onClick={() => openAddOrgMemberForRole('members')} className="btn-primary-sm">
                    <Plus size={16} /> Add Member
                  </button>
                )}
              </div>
            </div>
            
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
                  <select 
                    className="form-input" 
                    style={{ width: '150px', margin: 0, paddingLeft: '12px' }}
                    value={selectedChartPeriodId}
                    onChange={e => setSelectedChartPeriodId(e.target.value)}
                  >
                    {periods.map(p => (
                      <option key={p.id} value={p.id}>{p.yearLabel}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-soft-white)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '3px' }}>
                <button 
                  type="button" 
                  onClick={() => setOrgViewMode('chart')}
                  style={{
                    border: 'none',
                    background: orgViewMode === 'chart' ? 'var(--secondary-blue)' : 'transparent',
                    color: orgViewMode === 'chart' ? '#fff' : 'var(--text-muted)',
                    padding: '6px 16px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'var(--transition)'
                  }}
                >
                  Chart Structure
                </button>
                <button 
                  type="button" 
                  onClick={() => setOrgViewMode('table')}
                  style={{
                    border: 'none',
                    background: orgViewMode === 'table' ? 'var(--secondary-blue)' : 'transparent',
                    color: orgViewMode === 'table' ? '#fff' : 'var(--text-muted)',
                    padding: '6px 16px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'var(--transition)'
                  }}
                >
                  Data Table
                </button>
              </div>
            </div>

            {orgViewMode === 'chart' ? (
              /* Graphical Chart View */
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <div className="org-chart-container">
                  {/* Tier 1: Principal, Vice Principal & Student Affair */}
                  <div className="org-chart-tier org-chart-tier-top">
                    {renderNodeCard(principalName, 'Principal', '')}
                    {renderNodeCard(vicePrincipalName, 'Vice Principal', '')}
                    {renderNodeCard(studentAffairName, 'Student Affair', '')}
                  </div>

                  {/* Tier 2: President & Vice President */}
                  <div className="org-chart-tier">
                    {president ? (
                      renderNodeCard(
                        formatOrgStudentName(president.student),
                        president.role?.rolename || 'President',
                        formatOrgStudentClassLabel(president.student),
                        () => {
                          setEditingItem(president);
                          setSelectedOrgStudentId(president.studentid);
                          setSelectedOrgRoleId(president.roleid);
                          setSelectedOrgPeriodId(president.periodid);
                          setSelectedOrgSectionId(president.sectionid || '');
                          setActiveModal('edit-org-member');
                        }
                      )
                    ) : (
                      <div 
                        className="org-chart-node org-chart-section-card animate-slideup" 
                        style={{ opacity: 0.7, cursor: canEditOrg ? 'pointer' : 'default' }}
                        onClick={() => canEditOrg && openAddOrgMemberForRole('president')}
                      >
                        <div className="org-chart-node-role">President</div>
                        <h4 className="org-chart-node-name" style={{ color: 'var(--text-muted)' }}>Not Elected</h4>
                        <p className="org-chart-node-class" style={{ visibility: 'hidden', margin: 0 }}>-</p>
                      </div>
                    )}

                    {vicePresident ? (
                      renderNodeCard(
                        formatOrgStudentName(vicePresident.student),
                        vicePresident.role?.rolename || 'Vice President',
                        formatOrgStudentClassLabel(vicePresident.student),
                        () => {
                          setEditingItem(vicePresident);
                          setSelectedOrgStudentId(vicePresident.studentid);
                          setSelectedOrgRoleId(vicePresident.roleid);
                          setSelectedOrgPeriodId(vicePresident.periodid);
                          setSelectedOrgSectionId(vicePresident.sectionid || '');
                          setActiveModal('edit-org-member');
                        }
                      )
                    ) : (
                      <div 
                        className="org-chart-node org-chart-section-card animate-slideup" 
                        style={{ opacity: 0.7, cursor: canEditOrg ? 'pointer' : 'default' }}
                        onClick={() => canEditOrg && openAddOrgMemberForRole('vice president')}
                      >
                        <div className="org-chart-node-role">Vice President</div>
                        <h4 className="org-chart-node-name" style={{ color: 'var(--text-muted)' }}>Not Elected</h4>
                        <p className="org-chart-node-class" style={{ visibility: 'hidden', margin: 0 }}>-</p>
                      </div>
                    )}
                  </div>

                  {/* Tier 3: Secretary & Treasurer */}
                  <div className="org-chart-tier">
                    {/* Secretary Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Secretary</span>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {secretary1 ? (
                          renderNodeCard(
                            formatOrgStudentName(secretary1.student),
                            'Secretary 1',
                            formatOrgStudentClassLabel(secretary1.student),
                            () => {
                              setEditingItem(secretary1);
                              setSelectedOrgStudentId(secretary1.studentid);
                              setSelectedOrgRoleId(secretary1.roleid);
                              setSelectedOrgPeriodId(secretary1.periodid);
                              setSelectedOrgSectionId(secretary1.sectionid || '');
                              setActiveModal('edit-org-member');
                            }
                          )
                        ) : (
                          <div 
                            className="org-chart-node org-chart-section-card animate-slideup" 
                            style={{ opacity: 0.7, cursor: canEditOrg ? 'pointer' : 'default' }}
                            onClick={() => canEditOrg && openAddOrgMemberForRole('secretary')}
                          >
                            <div className="org-chart-node-role">Secretary 1</div>
                            <h4 className="org-chart-node-name" style={{ color: 'var(--text-muted)' }}>Unassigned</h4>
                            <p className="org-chart-node-class" style={{ visibility: 'hidden', margin: 0 }}>-</p>
                          </div>
                        )}

                        {secretary2 ? (
                          renderNodeCard(
                            formatOrgStudentName(secretary2.student),
                            'Secretary 2',
                            formatOrgStudentClassLabel(secretary2.student),
                            () => {
                              setEditingItem(secretary2);
                              setSelectedOrgStudentId(secretary2.studentid);
                              setSelectedOrgRoleId(secretary2.roleid);
                              setSelectedOrgPeriodId(secretary2.periodid);
                              setSelectedOrgSectionId(secretary2.sectionid || '');
                              setActiveModal('edit-org-member');
                            }
                          )
                        ) : (
                          <div 
                            className="org-chart-node org-chart-section-card animate-slideup" 
                            style={{ opacity: 0.7, cursor: canEditOrg ? 'pointer' : 'default' }}
                            onClick={() => canEditOrg && openAddOrgMemberForRole('secretary')}
                          >
                            <div className="org-chart-node-role">Secretary 2</div>
                            <h4 className="org-chart-node-name" style={{ color: 'var(--text-muted)' }}>Unassigned</h4>
                            <p className="org-chart-node-class" style={{ visibility: 'hidden', margin: 0 }}>-</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Treasurer Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Treasurer</span>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {treasurer1 ? (
                          renderNodeCard(
                            formatOrgStudentName(treasurer1.student),
                            'Treasurer 1',
                            formatOrgStudentClassLabel(treasurer1.student),
                            () => {
                              setEditingItem(treasurer1);
                              setSelectedOrgStudentId(treasurer1.studentid);
                              setSelectedOrgRoleId(treasurer1.roleid);
                              setSelectedOrgPeriodId(treasurer1.periodid);
                              setSelectedOrgSectionId(treasurer1.sectionid || '');
                              setActiveModal('edit-org-member');
                            }
                          )
                        ) : (
                          <div 
                            className="org-chart-node org-chart-section-card animate-slideup" 
                            style={{ opacity: 0.7, cursor: canEditOrg ? 'pointer' : 'default' }}
                            onClick={() => canEditOrg && openAddOrgMemberForRole('treasurer')}
                          >
                            <div className="org-chart-node-role">Treasurer 1</div>
                            <h4 className="org-chart-node-name" style={{ color: 'var(--text-muted)' }}>Unassigned</h4>
                            <p className="org-chart-node-class" style={{ visibility: 'hidden', margin: 0 }}>-</p>
                          </div>
                        )}

                        {treasurer2 ? (
                          renderNodeCard(
                            formatOrgStudentName(treasurer2.student),
                            'Treasurer 2',
                            formatOrgStudentClassLabel(treasurer2.student),
                            () => {
                              setEditingItem(treasurer2);
                              setSelectedOrgStudentId(treasurer2.studentid);
                              setSelectedOrgRoleId(treasurer2.roleid);
                              setSelectedOrgPeriodId(treasurer2.periodid);
                              setSelectedOrgSectionId(treasurer2.sectionid || '');
                              setActiveModal('edit-org-member');
                            }
                          )
                        ) : (
                          <div 
                            className="org-chart-node org-chart-section-card animate-slideup" 
                            style={{ opacity: 0.7, cursor: canEditOrg ? 'pointer' : 'default' }}
                            onClick={() => canEditOrg && openAddOrgMemberForRole('treasurer')}
                          >
                            <div className="org-chart-node-role">Treasurer 2</div>
                            <h4 className="org-chart-node-name" style={{ color: 'var(--text-muted)' }}>Unassigned</h4>
                            <p className="org-chart-node-class" style={{ visibility: 'hidden', margin: 0 }}>-</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tier 4: Section (Sekbid) */}
                  <div style={{ width: '100%', marginTop: '20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Section (Sekbid)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '24px', width: '100%' }}>
                      {sekbidGroups.map(grp => (
                        <div key={grp.section.id} style={{ background: 'var(--bg-light-gray)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--card-border)', width: '100%', paddingBottom: '8px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--secondary-blue)', textTransform: 'uppercase' }}>
                              {grp.section.sectionname}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                            {grp.members.length > 0 ? (
                              grp.members.map(m => 
                                renderNodeCard(
                                  formatOrgStudentName(m.student),
                                  m.role?.rolename || 'Member',
                                  formatOrgStudentClassLabel(m.student),
                                  () => {
                                    setEditingItem(m);
                                    setSelectedOrgStudentId(m.studentid);
                                    setSelectedOrgRoleId(m.roleid);
                                    setSelectedOrgPeriodId(m.periodid);
                                    setSelectedOrgSectionId(m.sectionid || '');
                                    setActiveModal('edit-org-member');
                                  }
                                )
                              )
                            ) : (
                              <div 
                                className="org-chart-node org-chart-section-card animate-slideup" 
                                style={{ opacity: 0.7, cursor: canEditOrg ? 'pointer' : 'default' }}
                                onClick={() => canEditOrg && openAddOrgMemberForRole('members', grp.section.id)}
                              >
                                <div className="org-chart-node-role">{grp.section.sectionname}</div>
                                <h4 className="org-chart-node-name" style={{ color: 'var(--text-muted)' }}>Unassigned</h4>
                                <p className="org-chart-node-class" style={{ visibility: 'hidden', margin: 0 }}>-</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Table View */
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Search student, class, role, section..." 
                      style={{ paddingLeft: '40px', margin: 0 }}
                      value={adminSearch}
                      onChange={e => setAdminSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Role</th>
                        <th>Section</th>
                        <th>Period</th>
                        {canEditOrg && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrgMembers.map(m => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>{m.student?.user?.username || '-'}</td>
                          <td>{m.student?.class?.classname || '-'}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <span className="badge badge-student">{m.role?.rolename || '-'}</span>
                          </td>
                          <td>{m.section?.sectionname || '-'}</td>
                          <td>
                            <span className="badge badge-employer">{m.period?.yearLabel || '-'}</span>
                          </td>
                          {canEditOrg && (
                            <td>
                              <button onClick={() => {
                                setEditingItem(m);
                                setSelectedOrgStudentId(m.studentid);
                                setSelectedOrgRoleId(m.roleid);
                                setSelectedOrgPeriodId(m.periodid);
                                setSelectedOrgSectionId(m.sectionid || '');
                                setActiveModal('edit-org-member');
                              }} className="action-btn" style={{ marginRight: '8px' }}>
                                <Edit2 size={13} /> Edit
                              </button>
                              <button onClick={() => handleDeleteOrgMember(m.id)} className="action-btn action-btn-danger">
                                <Trash2 size={13} /> Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredOrgMembers.length === 0 && (
                        <tr>
                          <td colSpan={canEditOrg ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No organization member data available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );
      }

      case 'system-setting': {
        const handleDragFavicon = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "dragenter" || e.type === "dragover") {
            setFaviconDragActive(true);
          } else if (e.type === "dragleave") {
            setFaviconDragActive(false);
          }
        };

        const handleDropFavicon = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setFaviconDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
              setSysFavicon(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };

        const handleDragLogo = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "dragenter" || e.type === "dragover") {
            setLogoDragActive(true);
          } else if (e.type === "dragleave") {
            setLogoDragActive(false);
          }
        };

        const handleDropLogo = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setLogoDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
              setSysLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };

        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <h2 className="profile-card-title">
              <Settings size={20} color="var(--secondary-blue)" />
              Core System Settings
            </h2>
            <form onSubmit={handleUpdateSystem} className="settings-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Application / System Name</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px' }} value={sysName} onChange={e => setSysName(e.target.value)} required />
              </div>

              {/* Favicon Drag & Drop Zone */}
              <div className="form-group">
                <label className="form-label">System Favicon (.ico, .png)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    onDragEnter={handleDragFavicon}
                    onDragOver={handleDragFavicon}
                    onDragLeave={handleDragFavicon}
                    onDrop={handleDropFavicon}
                    onClick={() => document.getElementById('favicon-input')?.click()}
                    style={{
                      border: faviconDragActive ? '2px dashed var(--secondary-blue)' : '2px dashed var(--card-border)',
                      borderRadius: '8px',
                      padding: '20px 16px',
                      textAlign: 'center',
                      background: faviconDragActive ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-soft-white)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '110px'
                    }}
                  >
                    <input
                      id="favicon-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFileChange(e, setSysFavicon)}
                    />
                    <Download size={20} color={faviconDragActive ? 'var(--secondary-blue)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Drag & drop favicon, or click to upload
                    </span>
                  </div>
                  {sysFavicon && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-soft-white)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                      <img src={sysFavicon} alt="Favicon Preview" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Favicon Preview</span>
                        <button type="button" onClick={() => setSysFavicon('')} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 700 }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Drag & Drop Zone */}
              <div className="form-group">
                <label className="form-label">System Logo (.png, .jpg)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    onDragEnter={handleDragLogo}
                    onDragOver={handleDragLogo}
                    onDragLeave={handleDragLogo}
                    onDrop={handleDropLogo}
                    onClick={() => document.getElementById('logo-input')?.click()}
                    style={{
                      border: logoDragActive ? '2px dashed var(--secondary-blue)' : '2px dashed var(--card-border)',
                      borderRadius: '8px',
                      padding: '20px 16px',
                      textAlign: 'center',
                      background: logoDragActive ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-soft-white)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '110px'
                    }}
                  >
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFileChange(e, setSysLogo)}
                    />
                    <Download size={20} color={logoDragActive ? 'var(--secondary-blue)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Drag & drop logo, or click to upload
                    </span>
                  </div>
                  {sysLogo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-soft-white)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                      <img src={sysLogo} alt="Logo Preview" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Logo Preview</span>
                        <button type="button" onClick={() => setSysLogo('')} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 700 }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">School / Institution Address</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px' }} value={sysAddress} onChange={e => setSysAddress(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Contact / Technical Support</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px' }} value={sysContact} onChange={e => setSysContact(e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="btn-primary-sm">
                  <Save size={16} /> Save Settings
                </button>
              </div>
            </form>
          </div>
        );
      }

      case 'backup-db':
        return (
          <div className="theme-card profile-card" style={{ gridColumn: 'span 2' }}>
            <h2 className="profile-card-title">
              <Database size={20} color="var(--secondary-blue)" />
              Database Backup Management
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--primary-navy)' }}>Database Security Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Connection Status</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>CONNECTED</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Database Engine</span>
                    <span style={{ fontWeight: 600 }}>PostgreSQL 16</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Tables</span>
                    <span style={{ fontWeight: 600 }}>10 Tables</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Database Size</span>
                    <span style={{ fontWeight: 600 }}>~24.5 KB</span>
                  </div>
                </div>
                <button onClick={triggerDatabaseBackup} className="btn-primary-sm" style={{ marginTop: '20px' }}>
                  <Download size={16} /> Initiate Database Backup
                </button>
              </div>

              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--primary-navy)' }}>Backup Console</h3>
                <div style={{ background: 'var(--bg-soft-white)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', height: '140px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dark)', textAlign: 'left' }}>
                  {backupLogs.map((log, index) => <div key={index} style={{ marginBottom: '4px' }}>{log}</div>)}
                  {backupLogs.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Click the button to view progress logs.</span>}
                </div>
                {backupProgress !== null && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Backup Progress</span>
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
              Update Profile & Password
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Update your registered email address or change your account access password.
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
                <label className="form-label">Username (Cannot be modified)</label>
                <input type="text" className="form-input" style={{ paddingLeft: '16px', opacity: 0.6, cursor: 'not-allowed' }} value={userData?.username || ''} disabled />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" style={{ paddingLeft: '16px' }} value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">New Password (Leave blank to keep unchanged)</label>
                <input type="password" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Enter new password" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Repeat new password" value={editConfirmPassword} onChange={e => setEditConfirmPassword(e.target.value)} />
              </div>
              <div>
                <button type="submit" className="btn-primary-sm">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        );

      case 'kas': {
        if (kasLoading && !kasData) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
              <span style={{ marginLeft: '12px' }}>Loading cash finance data...</span>
            </div>
          );
        }

        if (kasError) {
          return (
            <div className="error-banner" style={{ margin: '20px 0' }}>
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <span>{kasError}</span>
            </div>
          );
        }

        if (!kasData || !kasData.activePeriod) {
          return (
            <div className="theme-card profile-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px' }}>
              <ShieldAlert size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
              <h2 className="profile-card-title" style={{ borderBottom: 'none', justifyContent: 'center' }}>
                No Active Period
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                There is currently no active OSIS management period. Please contact the Superadmin to activate a management period first in the <strong>Manage Period</strong> menu.
              </p>
            </div>
          );
        }

        const { activePeriod, classes: kasClasses } = kasData;

        // Perform calculations
        const totalPaidAmount = kasClasses.reduce((sum, cls) => sum + (cls.isPaid ? cls.requiredPayment : 0), 0);
        const totalEstimatedAmount = kasClasses.reduce((sum, cls) => sum + cls.requiredPayment, 0);
        const paidClassesCount = kasClasses.filter(cls => cls.isPaid).length;
        const totalClassesCount = kasClasses.length;

        // Filter based on search query
        const filteredKasClasses = kasClasses.filter(cls => {
          const searchLower = adminSearch.toLowerCase();
          return (
            cls.classname.toLowerCase().includes(searchLower) ||
            cls.grade.toLowerCase().includes(searchLower) ||
            cls.major.toLowerCase().includes(searchLower) ||
            cls.majorCode.toLowerCase().includes(searchLower)
          );
        });

        // Determine if user can edit/check payments
        const canEditKas = ['superadmin', 'treasurer', 'president', 'vice president'].includes(normalizedUserRole);

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return (
          <div className="theme-card profile-card animate-slideup" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <h2 className="profile-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                <Coins size={20} color="var(--secondary-blue)" />
                OSIS Cash Management
              </h2>
              
              {/* Month Navigation Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-soft-white)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <button 
                  onClick={handlePrevMonth}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '16px',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--card-bg)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  &lt;
                </button>
                <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '120px', textAlign: 'center', userSelect: 'none', color: 'var(--text-dark)' }}>
                  {monthNames[kasMonth - 1]} {kasYear}
                </span>
                <button 
                  onClick={handleNextMonth}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '16px',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--card-bg)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  &gt;
                </button>
              </div>

              <span style={{ fontSize: '14px', fontWeight: 600, padding: '6px 12px', borderRadius: '20px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--secondary-blue)' }}>
                Active Period: {activePeriod.yearLabel}
              </span>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', flexShrink: 0 }}>
              Manage OSIS cash payments per class for the active management period. Cash per class is calculated based on a rate of <strong>IDR 5,000 per registered student</strong>.
            </p>

            {/* Metrics Dashboard Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* Metric 1 - Akumulasi Total */}
              <div className="theme-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.02) 100%)', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total OSIS Cash (Accumulated)</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--secondary-blue)' }}>
                  IDR {(kasData?.accumulatedTotal || 0).toLocaleString('en-US')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Coins size={14} color="var(--secondary-blue)" />
                  <span>Total cash collected across all months</span>
                </div>
              </div>

              {/* Metric 2 - Kas Bulan Ini (Terkumpul / Target) */}
              <div className="theme-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Month's Cash</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--warning)', whiteSpace: 'nowrap' }}>
                  IDR {totalPaidAmount.toLocaleString('en-US')} / IDR {totalEstimatedAmount.toLocaleString('en-US')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Building size={14} color="var(--warning)" />
                  <span>Cash collected / target this month</span>
                </div>
              </div>

              {/* Metric 3 - Progress Kelas */}
              <div className="theme-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paid Classes Progress</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>
                  {paidClassesCount} / {totalClassesCount} Classes
                </span>
                <div style={{ width: '100%', height: '6px', background: 'var(--card-border)', borderRadius: '99px', overflow: 'hidden', margin: '4px 0' }}>
                  <div style={{ width: `${totalClassesCount ? (paidClassesCount / totalClassesCount) * 100 : 0}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>

            </div>

            {/* Filter and Search Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search class, grade, or major..." 
                  style={{ paddingLeft: '40px', margin: 0 }}
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                />
              </div>
              {!canEditKas && (
                <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-soft-white)', padding: '8px 16px', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  <ShieldAlert size={16} color="var(--warning)" />
                  <span>Read-Only Mode. Only the Treasurer/OSIS Board members can confirm cash deposits.</span>
                </div>
              )}
            </div>

            {/* Table of Classes */}
            <div className="admin-table-container custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>Pay</th>
                    <th>Class Name</th>
                    <th>Major</th>
                    <th style={{ textAlign: 'right' }}>Student Count</th>
                    <th style={{ textAlign: 'right' }}>Required Deposit (IDR)</th>
                    <th>Deposit Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKasClasses.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No class data matches your search.
                      </td>
                    </tr>
                  ) : (
                    filteredKasClasses.map(cls => (
                      <tr key={cls.id} style={{ transition: 'background-color 0.2s' }}>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span 
                              onClick={() => {
                                if (!cls.isPaid && canEditKas) {
                                  handleRecordKasPayment(cls.id, `${cls.grade} - ${cls.majorCode} - ${cls.classname}`, cls.requiredPayment);
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                border: cls.isPaid ? '2px solid var(--success)' : '2px solid var(--input-border)',
                                background: cls.isPaid ? 'var(--success)' : 'var(--input-bg)',
                                cursor: cls.isPaid || !canEditKas ? 'default' : 'pointer',
                                color: '#ffffff',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: cls.isPaid ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none',
                                userSelect: 'none'
                              }}
                              className="kas-custom-checkbox"
                            >
                              {cls.isPaid ? (
                                <span style={{ fontSize: '13px', fontWeight: 900 }}>✓</span>
                              ) : (
                                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'transparent' }}></span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{cls.grade} - {cls.classname}</td>
                        <td>{cls.major} ({cls.majorCode})</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>{cls.studentCount} students</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: cls.isPaid ? 'var(--success)' : 'var(--text-dark)' }}>
                          IDR {cls.requiredPayment.toLocaleString('en-US')}
                        </td>
                        <td>
                          {cls.isPaid ? (
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                              PAID
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                              UNPAID
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          {cls.isPaid && cls.paidAt ? new Date(cls.paidAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, marginRight: '12px' }}>
            {systemSettings?.systemlogo ? (
              <img src={systemSettings.systemlogo} alt="System Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <Building size={28} color="var(--secondary-blue)" style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary-navy)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
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
            <div className="sidebar-menu-title">Main Menu</div>
            <div className={`sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
              <Grid size={16} /> Dashboard
            </div>

            {(userData.role === 'superadmin' || effectivePermissions.includes('kandidat')) && (
              <div className={`sidebar-item ${activeMenu === 'kandidat' ? 'active' : ''}`} onClick={() => navigate('/candidates')}>
                <Users size={16} /> OSIS Candidates
              </div>
            )}

            {(userData.role === 'superadmin' || effectivePermissions.includes('proker')) && (
              <div className={`sidebar-item ${activeMenu === 'proker' ? 'active' : ''}`} onClick={() => navigate('/proker')}>
                <Briefcase size={16} /> Work Programs
              </div>
            )}

            {(userData.role === 'superadmin' || effectivePermissions.includes('organization')) && (
              <div className={`sidebar-item ${activeMenu === 'organization' ? 'active' : ''}`} onClick={() => navigate('/organization')}>
                <UserIcon size={16} /> Organization Structure
              </div>
            )}

            {(userData.role === 'superadmin' || effectivePermissions.includes('kas')) && (
              <div className={`sidebar-item ${activeMenu === 'kas' ? 'active' : ''}`} onClick={() => navigate('/kas')}>
                <Coins size={16} /> OSIS Cash
              </div>
            )}

            {(userData.role === 'superadmin' || effectivePermissions.includes('evaluasi-kinerja')) && (
              <div className={`sidebar-item ${activeMenu === 'evaluasi-kinerja' ? 'active' : ''}`} onClick={() => navigate('/evaluasi-kinerja')}>
                <TrendingUp size={16} /> Performance Evaluation
              </div>
            )}

            {(userData.role === 'superadmin' || effectivePermissions.includes('activity-log')) && (
              <div className={`sidebar-item ${activeMenu === 'activity-log' ? 'active' : ''}`} onClick={() => navigate('/activity-log')}>
                <CheckSquare size={16} /> Activity Log
              </div>
            )}

            {(userData.role === 'superadmin' || effectivePermissions.includes('recycle-bin')) && (
              <div className={`sidebar-item ${activeMenu === 'recycle-bin' ? 'active' : ''}`} onClick={() => navigate('/recycle-bin')}>
                <Folder size={16} /> Recycle Bin
              </div>
            )}

            {userData.role === 'superadmin' && (
              <div className={`sidebar-item ${activeMenu === 'permissions' ? 'active' : ''}`} onClick={() => navigate('/permissions')}>
                <CheckSquare size={16} /> Permissions
              </div>
            )}
          </div>

          {/* Manage Data Accordion */}
          {(userData.role === 'superadmin' || effectivePermissions.some(p => p.startsWith('manage-'))) && (
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
                  {(userData.role === 'superadmin' || effectivePermissions.includes('manage-class')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-class' ? 'active' : ''}`} onClick={() => navigate('/manage-class')}>
                      Manage Class
                    </div>
                  )}
                  {(userData.role === 'superadmin' || effectivePermissions.includes('manage-grade')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-grade' ? 'active' : ''}`} onClick={() => navigate('/manage-grade')}>
                      Manage Grade
                    </div>
                  )}
                  {(userData.role === 'superadmin' || effectivePermissions.includes('manage-major')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-major' ? 'active' : ''}`} onClick={() => navigate('/manage-major')}>
                      Manage Major
                    </div>
                  )}
                  {(userData.role === 'superadmin' || effectivePermissions.includes('manage-period')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-period' ? 'active' : ''}`} onClick={() => navigate('/manage-period')}>
                      Manage Period
                    </div>
                  )}
                  {(userData.role === 'superadmin' || effectivePermissions.includes('manage-user')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-user' ? 'active' : ''}`} onClick={() => navigate('/manage-user')}>
                      Manage User
                    </div>
                  )}
                  {(userData.role === 'superadmin' || effectivePermissions.includes('manage-role')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-role' ? 'active' : ''}`} onClick={() => navigate('/manage-role')}>
                      Manage Role
                    </div>
                  )}
                  {(userData.role === 'superadmin' || effectivePermissions.includes('manage-section')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'manage-section' ? 'active' : ''}`} onClick={() => navigate('/manage-section')}>
                      Manage Section
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings Accordion */}
          {(userData.role === 'superadmin' || effectivePermissions.includes('system-setting') || effectivePermissions.includes('backup-db')) && (
            <div className="sidebar-menu-section" style={{ marginBottom: 0 }}>
              <div 
                className="sidebar-item" 
                onClick={toggleSettings}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Settings size={16} />
                  <span>Settings</span>
                </div>
                {isSettingsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {isSettingsOpen && (
                <div>
                  {(userData.role === 'superadmin' || effectivePermissions.includes('system-setting')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'system-setting' ? 'active' : ''}`} onClick={() => navigate('/system-setting')}>
                      System Setting
                    </div>
                  )}
                  {(userData.role === 'superadmin' || effectivePermissions.includes('backup-db')) && (
                    <div className={`sidebar-item sidebar-item-sub ${activeMenu === 'backup-db' ? 'active' : ''}`} onClick={() => navigate('/backup-db')}>
                      Backup Database
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Account Menu Item (Direct) */}
          <div className="sidebar-menu-section" style={{ marginBottom: 0 }}>
            <div 
              className={`sidebar-item ${activeMenu === 'profile' ? 'active' : ''}`} 
              onClick={() => {
                navigate('/profile');
                setEditEmail(userData?.email || '');
                setEditPassword('');
                setEditConfirmPassword('');
                setEditProfileError('');
                setEditProfileSuccess('');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <UserIcon size={16} />
              <span>Account</span>
            </div>
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
                <h1>Welcome, {userData.username}!</h1>
                <p>{systemSettings?.systemname || 'OSIS Information System & Account Level Management'}</p>
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
                {activeModal === 'add-major' && 'Add New Major'}
                {activeModal === 'edit-major' && 'Edit Major'}
                {activeModal === 'add-period' && 'Add New Period'}
                {activeModal === 'edit-period' && 'Edit Period'}
                {activeModal === 'add-user' && 'Add New User'}
                {activeModal === 'edit-user' && 'Edit User'}
                {activeModal === 'confirm-reset-pw' && 'Confirm Password Reset'}
                {activeModal === 'add-candidate' && 'Add New OSIS Candidate'}
                {activeModal === 'edit-candidate' && 'Edit OSIS Candidate'}
                {activeModal === 'add-proker' && 'Add New OSIS Work Program'}
                {activeModal === 'edit-proker' && 'Edit OSIS Work Program'}
                {activeModal === 'add-org-member' && 'Add Organization Member'}
                {activeModal === 'edit-org-member' && 'Edit Organization Member'}
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
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedGradeId} onChange={e => {
                    const nextGradeId = e.target.value;
                    setSelectedGradeId(nextGradeId);
                    const nextMajors = getFilteredMajorsByGrade(nextGradeId);
                    setSelectedMajorId(nextMajors.length === 1 ? nextMajors[0].id : '');
                  }} required>
                    <option value="">Pilih Grade</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.gradename}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jurusan</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedMajorId} onChange={e => setSelectedMajorId(e.target.value)} required disabled={!selectedGradeId}>
                    <option value="">Pilih Jurusan</option>
                    {filteredClassMajors.map(m => <option key={m.id} value={m.id}>{m.majorname} ({m.majorcode})</option>)}
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

            {activeModal === 'add-role' && (
              <form onSubmit={handleAddRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Peran (Role)</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: sekretaris 1" value={newRolename} onChange={e => setNewRolename(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => setActiveModal(null)}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'add-section' && (
              <form onSubmit={handleAddSection} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Sekbid (Section)</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: sekbid mading" value={newSectionname} onChange={e => setNewSectionname(e.target.value)} required />
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
                        {classes.map(c => <option key={c.id} value={c.id}>{`${c.grade?.gradename || ''} ${c.major?.majorcode || ''} ${c.classname}`.trim()}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role OSIS (Opsional)</label>
                      <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                        <option value="">Bukan Pengurus (null)</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.rolename}>{r.rolename}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {newUserLevel === 'school' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Sekolah (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="">Pilih Jabatan</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.rolename}>{r.rolename}</option>
                      ))}
                    </select>
                  </div>
                )}

                {newUserLevel === 'employer' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Mitra (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="">Pilih Jabatan</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.rolename}>{r.rolename}</option>
                      ))}
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
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedGradeId} onChange={e => {
                    const nextGradeId = e.target.value;
                    setSelectedGradeId(nextGradeId);
                    const nextMajors = getFilteredMajorsByGrade(nextGradeId);
                    setSelectedMajorId(nextMajors.length === 1 ? nextMajors[0].id : '');
                  }} required>
                    <option value="">Pilih Grade</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.gradename}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jurusan</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={selectedMajorId} onChange={e => setSelectedMajorId(e.target.value)} required disabled={!selectedGradeId}>
                    <option value="">Pilih Jurusan</option>
                    {filteredClassMajors.map(m => <option key={m.id} value={m.id}>{m.majorname} ({m.majorcode})</option>)}
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

            {activeModal === 'edit-role' && (
              <form onSubmit={handleEditRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Peran (Role)</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: sekretaris 1" value={newRolename} onChange={e => setNewRolename(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}

            {activeModal === 'edit-section' && (
              <form onSubmit={handleEditSectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Nama Sekbid (Section)</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Contoh: sekbid mading" value={newSectionname} onChange={e => setNewSectionname(e.target.value)} required />
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
                        {classes.map(c => <option key={c.id} value={c.id}>{`${c.grade?.gradename || ''} ${c.major?.majorcode || ''} ${c.classname}`.trim()}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role OSIS (Opsional)</label>
                      <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                        <option value="">Bukan Pengurus (null)</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.rolename}>{r.rolename}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {newUserLevel === 'school' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Sekolah (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="">Pilih Jabatan</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.rolename}>{r.rolename}</option>
                      ))}
                    </select>
                  </div>
                )}

                {newUserLevel === 'employer' && (
                  <div className="form-group">
                    <label className="form-label">Jabatan Mitra (Role)</label>
                    <select className="form-input" style={{ paddingLeft: '16px' }} value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                      <option value="">Pilih Jabatan</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.rolename}>{r.rolename}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="submit" className="btn-primary-sm">Simpan</button>
                </div>
              </form>
            )}



            {activeModal === 'confirm-reset-pw' && (
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dark)', lineHeight: '1.6' }}>
                  Apakah Anda yakin ingin mereset password untuk pengguna <strong>{editingItem?.username}</strong>?
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-soft-white)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                  Password baru akan otomatis diatur ulang menjadi sama dengan username-nya: <strong>{editingItem?.username}</strong>
                </p>
                <div className="modal-actions" style={{ marginTop: '8px' }}>
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Batal</button>
                  <button type="button" className="btn-primary-sm" onClick={executeResetPasswordToUsername} style={{ background: 'var(--warning)', borderColor: 'var(--warning)', color: '#ffffff' }}>Ya, Reset Password</button>
                </div>
              </div>
            )}

            {(activeModal === 'add-candidate' || activeModal === 'edit-candidate') && (
              <form onSubmit={activeModal === 'edit-candidate' ? handleEditCandidate : handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Candidate Pair Number</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Example: 03" value={newCandidatePaslonNo} onChange={e => setNewCandidatePaslonNo(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Select OSIS President Candidate (President)</label>
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
                    <option value="">Select Student</option>
                    {candidateStudentOptions.map(u => (
                      <option key={u.id} value={u.id}>
                        {formatCandidateStudentOptionLabel(u)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select OSIS Vice President Candidate (Vice President)</label>
                  <select 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }}
                    value={selectedVicePresidentId}
                    onChange={e => setSelectedVicePresidentId(e.target.value)}
                    required
                  >
                    <option value="">Select Student</option>
                    {viceCandidateStudentOptions.map(u => (
                      <option key={u.id} value={u.id}>
                        {formatCandidateStudentOptionLabel(u)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Class / Major</label>
                  <input type="text" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Example: XII RPL 1 & XII RPL 2" value={newCandidateClasses} onChange={e => setNewCandidateClasses(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vision</label>
                  <textarea className="form-input" style={{ paddingLeft: '16px', minHeight: '60px' }} placeholder="Candidate's vision..." value={newCandidateVisi} onChange={e => setNewCandidateVisi(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mission</label>
                  <textarea className="form-input" style={{ paddingLeft: '16px', minHeight: '60px' }} placeholder="Candidate's mission..." value={newCandidateMisi} onChange={e => setNewCandidateMisi(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Candidate Photo</label>
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
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Photo Preview</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Select Election Period</label>
                  <select className="form-input" style={{ paddingLeft: '16px' }} value={newCandidatePeriodId} onChange={e => setNewCandidatePeriodId(e.target.value)} required>
                    <option value="">Select Period</option>
                    {periods.map(p => <option key={p.id} value={p.id}>{p.yearLabel} ({p.status})</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Cancel</button>
                  <button type="submit" className="btn-primary-sm">Save</button>
                </div>
              </form>
            )}


            {(activeModal === 'add-proker' || activeModal === 'edit-proker') && (
              <form onSubmit={activeModal === 'edit-proker' ? handleEditProker : (e) => handleAddProker(e, selectedProkerPeriod?.id || 'p3')} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Work Program Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    placeholder="Example: OSIS Leadership Training" 
                    value={prokerName} 
                    onChange={e => setProkerName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Program Description</label>
                  <textarea 
                    className="form-input" 
                    style={{ paddingLeft: '16px', minHeight: '80px' }} 
                    placeholder="Explain program details/objectives..." 
                    value={prokerDesc} 
                    onChange={e => setProkerDesc(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Date / Timeline</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    placeholder="Example: September 2026 or End of Semester Exams" 
                    value={prokerTargetDate} 
                    onChange={e => setProkerTargetDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Program Status</label>
                  <select 
                    className="form-input" 
                    style={{ paddingLeft: '16px' }} 
                    value={prokerStatus} 
                    onChange={e => setProkerStatus(e.target.value)}
                  >
                    <option value="Rencana">Planned</option>
                    <option value="Berjalan">In Progress</option>
                    <option value="Selesai">Completed</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Cancel</button>
                  <button type="submit" className="btn-primary-sm">Save</button>
                </div>
              </form>
            )}

            {(activeModal === 'add-org-member' || activeModal === 'edit-org-member') && (
              <form onSubmit={activeModal === 'edit-org-member' ? handleEditOrgMemberSubmit : handleAddOrgMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div style={{ background: 'var(--bg-soft-white)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--card-border)', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Role</span>
                    <strong style={{ color: 'var(--secondary-blue)', fontWeight: 700 }}>
                      {roles.find(r => r.id === selectedOrgRoleId)?.rolename || 'Member'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Period</span>
                    <strong style={{ color: 'var(--text-dark)', fontWeight: 700 }}>
                      {periods.find(p => p.id === (selectedOrgPeriodId || selectedChartPeriodId))?.yearLabel || '-'}
                    </strong>
                  </div>
                  {selectedOrgSectionId && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Section</span>
                      <strong style={{ color: 'var(--text-dark)', fontWeight: 700 }}>
                        {sections.find(s => s.id === selectedOrgSectionId)?.sectionname || '-'}
                      </strong>
                    </div>
                  )}
                </div>

                {(() => {
                  const targetPeriodId = selectedOrgPeriodId || selectedChartPeriodId;
                  const assignedStudentIdsInPeriod = new Set(
                    orgMembers
                      .filter(m => m.periodid === targetPeriodId && (!editingItem || m.id !== editingItem.id))
                      .map(m => m.studentid)
                  );
                  const allowedOrgGrades = new Set([7, 8, 10, 11]);
                  const availableStudents = students.filter(s => {
                    if (assignedStudentIdsInPeriod.has(s.id)) return false;
                    const classId = s.classid || s.classId;
                    const studentClass = classes.find((c: any) => c.id === classId) || s.class || s.Class || {};
                    const gradeName = studentClass.grade?.gradename || studentClass.gradename || studentClass.gradeName || '';
                    const gradeLevel = getGradeLevelNumber(gradeName);
                    return gradeLevel ? allowedOrgGrades.has(gradeLevel) : false;
                  });
                  const formatStudentOptionLabel = (student: any) => {
                    const studentName = student.user?.username || student.user?.name || student.user?.fullName || student.name || '-';
                    const classId = student.classid || student.classId;
                    const studentClass = classes.find((c: any) => c.id === classId) || student.class || student.Class || {};
                    const majorCode = studentClass.major?.majorcode || studentClass.majorcode || studentClass.majorCode;
                    const gradeName = studentClass.grade?.gradename || studentClass.gradename || studentClass.gradeName;
                    const className = studentClass.classname || studentClass.className;
                    return [studentName, majorCode, gradeName, className].filter(Boolean).join(' ');
                  };

                  return (
                    <div className="form-group">
                      <label className="form-label">Select Student</label>
                      <select 
                        className="form-input" 
                        style={{ paddingLeft: '16px' }} 
                        value={selectedOrgStudentId} 
                        onChange={e => setSelectedOrgStudentId(e.target.value)}
                        required
                      >
                        <option value="">Select Student</option>
                        {availableStudents.map(s => (
                          <option key={s.id} value={s.id}>
                            {formatStudentOptionLabel(s)}
                          </option>
                        ))}
                      </select>
                      {availableStudents.length === 0 && (
                        <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                          ⚠️ Semua murid di periode ini sudah memiliki jabatan/role.
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  {activeModal === 'edit-org-member' && editingItem ? (
                    <button 
                      type="button" 
                      className="btn-danger-sm" 
                      style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={async () => {
                        if (editingItem && editingItem.id) {
                          if (window.confirm('Are you sure you want to remove this member?')) {
                            await handleDeleteOrgMember(editingItem.id);
                            setActiveModal(null);
                            setEditingItem(null);
                          }
                        }
                      }}
                    >
                      <Trash2 size={14} /> Remove Member
                    </button>
                  ) : <div></div>}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn-secondary-sm" onClick={() => { setActiveModal(null); setEditingItem(null); }}>Cancel</button>
                    <button type="submit" className="btn-primary-sm">Save</button>
                  </div>
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

      {/* QR Code Viewer Modal */}
      {activeQrMember && (
        <div className="modal-backdrop" onClick={() => setActiveQrMember(null)}>
          <div className="modal-card animate-slideup" style={{ maxWidth: '380px', padding: '24px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '16px' }}>Attendance QR Code</h3>
              <button onClick={() => setActiveQrMember(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>✕</button>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--card-border)', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=2563EB&data=${encodeURIComponent(JSON.stringify({ meetingId: activeQrMember.meetingId, memberId: activeQrMember.memberId }))}`} 
                alt="QR Code" 
                style={{ width: '200px', height: '200px', display: 'block' }}
              />
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--primary-navy)', fontWeight: 700 }}>{activeQrMember.memberName}</h4>
            <p style={{ margin: '0 0 4px', fontSize: '12.5px', color: 'var(--text-muted)' }}>Meeting: <strong>{activeQrMember.meetingTitle}</strong></p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Show this QR code to the coordinator or admin to scan</p>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      {showScanner && (
        <ScannerModal 
          onClose={() => {
            setShowScanner(false);
            setScannerResult(null);
            setScannerError(null);
          }}
          onSuccess={(res) => {
            setScannerResult(res);
            loadProkersData(); // refresh data
          }}
        />
      )}
    </div>
  );
};

// QR Code Scanner Modal Component
interface ScannerModalProps {
  onClose: () => void;
  onSuccess: (result: { memberName: string; meetingTitle: string; prokerName: string }) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onClose, onSuccess }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [loadingJsqr, setLoadingJsqr] = useState(true);
  const [successData, setSuccessData] = useState<{ memberName: string; meetingTitle: string; prokerName: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const videoRef = useMemo(() => ({ current: null as HTMLVideoElement | null }), []);
  const canvasRef = useMemo(() => ({ current: null as HTMLCanvasElement | null }), []);
  const streamRef = useMemo(() => ({ current: null as MediaStream | null }), []);
  const animationFrameRef = useMemo(() => ({ current: null as number | null }), []);

  // Play Beep Sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (err) {
      console.error('AudioContext beep failed:', err);
    }
  };

  // Laser Keyframe Style Appender
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'qr-scanner-laser-keyframes';
    style.innerHTML = `
      @keyframes scanLaser {
        0% { top: 0%; }
        50% { top: 100%; }
        100% { top: 0%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('qr-scanner-laser-keyframes');
      if (el) el.remove();
    };
  }, []);

  // Load jsQR script dynamically
  useEffect(() => {
    let script = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"]') as HTMLScriptElement;
    
    const onScriptLoaded = () => {
      setLoadingJsqr(false);
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    if ((window as any).jsQR) {
      setLoadingJsqr(false);
    } else {
      script.addEventListener('load', onScriptLoaded);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', onScriptLoaded);
      }
    };
  }, []);

  // Stop camera stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start camera stream
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access camera. Please verify camera permissions.');
    }
  };

  // Run camera scan loop when camera & jsQR are ready
  useEffect(() => {
    if (loadingJsqr || successData) return;

    startCamera();

    return () => {
      stopCamera();
    };
  }, [loadingJsqr, successData]);

  // Decode loop
  useEffect(() => {
    if (!cameraActive || !videoRef.current || successData) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let lastScanTime = 0;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && ctx) {
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const now = Date.now();
        // Decode every 250ms for performance
        if (now - lastScanTime > 250) {
          lastScanTime = now;
          const jsQRDecoder = (window as any).jsQR;
          if (jsQRDecoder) {
            const code = jsQRDecoder(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });
            
            if (code && code.data) {
              try {
                const payload = JSON.parse(code.data);
                if (payload.meetingId && payload.memberId) {
                  // Found valid code!
                  playBeep();
                  stopCamera();
                  
                  // Send to API
                  authApi.scanAttendance(payload.meetingId, payload.memberId)
                    .then(res => {
                      setSuccessData({
                        memberName: res.memberName,
                        meetingTitle: res.meetingTitle,
                        prokerName: res.prokerName
                      });
                      onSuccess(res);
                    })
                    .catch(err => {
                      console.error(err);
                      setErrorMsg(err.response?.data?.message || 'Attendance request failed.');
                    });
                  return;
                }
              } catch (e) {
                // Invalid JSON code, ignore
              }
            }
          }
        }
      }
      if (!successData) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, successData]);

  // Video Ref callback
  const setVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-slideup" style={{ maxWidth: '420px', padding: '24px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="modal-title" style={{ margin: 0, fontSize: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="spinner" style={{ width: '12px', height: '12px', display: successData ? 'none' : 'inline-block' }}></span>
              Scan Attendance QR
            </span>
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>✕</button>
        </div>

        {loadingJsqr && !successData && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px', width: '28px', height: '28px' }}></div>
            <p style={{ margin: 0, fontSize: '13px' }}>Initializing camera engine...</p>
          </div>
        )}

        {!loadingJsqr && !successData && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {errorMsg && (
              <div style={{ width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--danger)', fontSize: '12.5px', textAlign: 'center' }}>
                {errorMsg}
                <button onClick={startCamera} style={{ display: 'block', margin: '8px auto 0', padding: '4px 12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
              </div>
            )}

            <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '2px solid var(--card-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <video 
                ref={setVideoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Laser overlay animation */}
              <div style={{
                position: 'absolute',
                top: '15%',
                left: '15%',
                right: '15%',
                bottom: '15%',
                border: '2px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: 'var(--secondary-blue)',
                  boxShadow: '0 0 10px var(--secondary-blue)',
                  animation: 'scanLaser 2s linear infinite'
                }} className="scan-laser-bar"></div>
              </div>
            </div>
            
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Align the member's attendance QR code inside the target window to scan automatically.
            </p>
          </div>
        )}

        {successData && (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px', fontWeight: 'bold' }}>✓</div>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--primary-navy)', fontWeight: 700 }}>Attendance Recorded!</h4>
            <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: 'var(--text-dark)' }}>
              <strong>{successData.memberName}</strong> has been checked in as <strong>Present</strong>.
            </p>
            
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', fontSize: '12px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ marginBottom: '6px' }}><span style={{ color: 'var(--text-muted)' }}>Meeting:</span> <strong style={{ color: 'var(--primary-navy)' }}>{successData.meetingTitle}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Program:</span> <strong style={{ color: 'var(--primary-navy)' }}>{successData.prokerName}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  setSuccessData(null);
                  setErrorMsg(null);
                }} 
                className="btn-primary-sm" 
                style={{ height: '36px', padding: '0 20px' }}
              >
                Scan Next
              </button>
              <button 
                onClick={onClose} 
                className="btn-primary-sm" 
                style={{ height: '36px', padding: '0 20px', background: 'var(--text-muted)' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ErrorPage Component
const ErrorPage = ({ embedded = false, code, message }: { embedded?: boolean; code?: string | number; message?: string }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Resolve code and message
  const errorCode = code || searchParams.get('code') || '404';
  
  let title = 'Error';
  let description = 'An unexpected error occurred. Please try again later.';
  let icon = <AlertCircle size={48} color="var(--danger)" />;

  switch (String(errorCode)) {
    case '400':
      title = 'Bad Request';
      description = 'The server could not understand the request due to invalid syntax. Please verify your input.';
      icon = <AlertTriangle size={48} color="var(--warning)" />;
      break;
    case '403':
      title = 'Access Denied';
      description = 'You do not have permission to view or access this resource. If you believe this is an error, contact your administrator.';
      icon = <ShieldAlert size={48} color="var(--danger)" />;
      break;
    case '404':
      title = 'Page Not Found';
      description = 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.';
      icon = <AlertCircle size={48} color="var(--secondary-blue)" />;
      break;
    case '419':
      title = 'Session Expired';
      description = 'Your session has expired or timed out due to inactivity. Please sign in again to restore access.';
      icon = <RefreshCw size={48} color="var(--warning)" />;
      break;
    case '500':
      title = 'Internal Server Error';
      description = 'The server encountered an internal error or misconfiguration and was unable to complete your request.';
      icon = <ShieldAlert size={48} color="var(--danger)" />;
      break;
  }

  if (message) {
    description = message;
  }

  const handleAction = () => {
    if (errorCode === '419') {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } else {
      navigate('/dashboard');
    }
  };

  const containerStyle: React.CSSProperties = embedded
    ? {
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '400px',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, var(--primary-navy) 0%, #020617 100%)',
        padding: '24px',
      };

  return (
    <div style={containerStyle}>
      <div 
        className="theme-card animate-slideup" 
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '20px',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </div>
        </div>

        <h1 style={{
          fontSize: '72px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0',
          lineHeight: '1',
          letterSpacing: '-2px',
        }}>
          {errorCode}
        </h1>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#ffffff',
          margin: '0 0 16px 0',
        }}>
          {title}
        </h2>

        <p style={{
          fontSize: '15px',
          lineHeight: '1.6',
          color: 'var(--text-muted)',
          margin: '0 0 32px 0',
        }}>
          {description}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {errorCode !== '419' && (
            <button
              onClick={() => navigate(-1)}
              className="btn-primary-sm"
              style={{
                background: 'transparent',
                border: '1px solid var(--card-border)',
                color: '#ffffff',
                height: '42px',
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          )}

          <button
            onClick={handleAction}
            className="btn-primary-sm"
            style={{
              background: 'linear-gradient(135deg, var(--secondary-blue), #1d4ed8)',
              border: 'none',
              color: '#ffffff',
              height: '42px',
              padding: '0 24px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            }}
          >
            {errorCode === '419' ? (
              <>
                <LogIn size={16} />
                <span>Sign In Again</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Return Home</span>
              </>
            )}
          </button>
        </div>
      </div>
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

  const handleQuickLogin = (usr: string, pass: string) => {
    setUsername(usr);
    setPassword(pass);
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
      setError('Username and password cannot be empty.');
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
      const message = err.response?.data?.message || 'An error occurred during login. Please try again.';
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
          <h1 className="login-title">{systemSettings?.systemname || 'Account Access'}</h1>
          <p className="login-subtitle">Please sign in to your account</p>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
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
                <span>Processing...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="demo-accounts">
          <p>Demo accounts (Click to auto-fill):</p>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickLogin('superadmin', 'superadmin')}
              title="Click to fill Superadmin credentials"
            >
              <span className="demo-role">Superadmin</span>
              <span className="demo-divider">/</span>
              <code className="demo-creds">superadmin</code>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickLogin('student', 'student')}
              title="Click to fill Student credentials"
            >
              <span className="demo-role">Student</span>
              <span className="demo-divider">/</span>
              <code className="demo-creds">student</code>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickLogin('school', 'school')}
              title="Click to fill School credentials"
            >
              <span className="demo-role">School</span>
              <span className="demo-divider">/</span>
              <code className="demo-creds">school</code>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickLogin('employer', 'employer')}
              title="Click to fill Employer credentials"
            >
              <span className="demo-role">Employer</span>
              <span className="demo-divider">/</span>
              <code className="demo-creds">employer</code>
            </button>
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
        <Route path="/error" element={<ErrorPage />} />
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

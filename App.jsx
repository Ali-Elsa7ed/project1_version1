import React, { useState, useEffect } from 'react';
import { Plus, Bell, User, LogIn, LogOut, Clock, LayoutDashboard, Calendar, MapPin, FileSpreadsheet, Map as MapIcon, Trash2, Edit3, Users, Settings, X, Download, Printer, Languages, Banknote, FileText, Building2, UserCog } from 'lucide-react';
import { translations } from './locales';
import { COLORS, INITIAL_USERS, INITIAL_EXPENSES, INITIAL_DEPTS } from './data/initialData';

function App() {
    // Persistent State
    const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('hayarco_users')) || INITIAL_USERS);
    const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('hayarco_expenses')) || INITIAL_EXPENSES);
    const [attendanceHistory, setAttendanceHistory] = useState(() => JSON.parse(localStorage.getItem('hayarco_attendance')) || []);
    const [departments, setDepartments] = useState(() => JSON.parse(localStorage.getItem('hayarco_depts')) || INITIAL_DEPTS);
    const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('hayarco_notifs')) || []);

    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newExpense, setNewExpense] = useState({ department: '', amount: '', description: '' });
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('Determining location...');
    const [showNotifs, setShowNotifs] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lang, setLang] = useState(() => localStorage.getItem('hayarco_lang') || 'ar');
    const [expenseLimits, setExpenseLimits] = useState(() => JSON.parse(localStorage.getItem('hayarco_expense_limits')) || { min: 0, max: 100000 });
    const [showLimitForm, setShowLimitForm] = useState(false);
    const [newLimits, setNewLimits] = useState({ min: 0, max: 100000 });
    const [workingHours, setWorkingHours] = useState(() => JSON.parse(localStorage.getItem('hayarco_working_hours')) || { start: '09:00', end: '17:00' });
    const [showHoursForm, setShowHoursForm] = useState(false);
    const [newHours, setNewHours] = useState(() => JSON.parse(localStorage.getItem('hayarco_working_hours')) || { start: '09:00', end: '17:00' });

    const [newEmpName, setNewEmpName] = useState('');
    const [newEmpEmail, setNewEmpEmail] = useState('');
    const [newEmpPass, setNewEmpPass] = useState('');
    const [newDeptName, setNewDeptName] = useState('');

    const t = (key) => translations[lang][key] || key;
    const isRtl = lang === 'ar';

    // Clock Updater - Live Ticking
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Sync to LocalStorage
    useEffect(() => { localStorage.setItem('hayarco_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('hayarco_expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('hayarco_attendance', JSON.stringify(attendanceHistory)); }, [attendanceHistory]);
    useEffect(() => { localStorage.setItem('hayarco_depts', JSON.stringify(departments)); }, [departments]);
    useEffect(() => { localStorage.setItem('hayarco_notifs', JSON.stringify(notifications)); }, [notifications]);
    useEffect(() => { localStorage.setItem('hayarco_lang', lang); }, [lang]);
    useEffect(() => { localStorage.setItem('hayarco_expense_limits', JSON.stringify(expenseLimits)); }, [expenseLimits]);
    useEffect(() => { localStorage.setItem('hayarco_working_hours', JSON.stringify(workingHours)); }, [workingHours]);

    useEffect(() => {
        const initLocation = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    setCurrentLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                }, async () => {
                    const loc = await getAutoLocation();
                    setCurrentLocation(loc);
                });
            } else {
                const loc = await getAutoLocation();
                setCurrentLocation(loc);
            }
        };
        initLocation();
    }, [lang]);

    const addNotification = (titleKey, message, type = 'info') => {
        const newNotif = {
            id: Date.now(),
            title: t(titleKey),
            message,
            time: currentTime.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            date: currentTime.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US'),
            read: false,
            type
        };
        setNotifications([newNotif, ...notifications.slice(0, 19)]);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            setView(foundUser.role === 'admin' ? 'dashboard' : 'attendance');
            if (foundUser.role === 'employee') {
                const lastRecord = attendanceHistory.find(h => h.employee === t(foundUser.name));
                setIsClockedIn(lastRecord?.type === t('attendance'));
            }
            addNotification('loginNotif', `${t(foundUser.name)} logged in`, 'login');
        } else {
            setError(isRil ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : RIl ? 'ا email or passwبrd لإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
        }
    };

    const handleLogout = () => {
        addNotification('logoutNotif', `${t(user.name)} logged out`, 'info');
        setUser(null);
        setEmail('');
        setPassword('');
    };

    const timeToMinutes = (hhmm) => {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m;
    };
    const computeStartStatus = () => {
        const now = currentTime.getHours() * 60 + currentTime.getMinutes();
        const start = timeToMinutes(workingHours.start);
        const end = timeToMinutes(workingHours.end);
        if (now < start) return 'early';
        if (now > end) return 'outsideHours';
        if (now <= start + 10) return 'on_time';
        return 'late';
    };
    const formatTime12 = (hhmm) => {
        if (!hhmm) return '';
        const [h, m] = hhmm.split(':').map(Number);
        const d = new Date();
        d.setHours(h);
        d.setMinutes(m);
        return d.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    const getAutoLocation = async () => {
        try {
            const res = await fetch('http://ip-api.com/json/');
            const data = await res.json();
            if (data && data.status === 'success' && data.lat && data.lon) {
                return `${Number(data.lat).toFixed(4)}, ${Number(data.lon).toFixed(4)} (IP)`;
            }
        } catch (e) { }
        return t('ipAuto');
    };
    const parseLatLon = (locStr) => {
        if (!locStr) return null;
        const m = locStr.match(/(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)/);
        if (m) {
            const lat = parseFloat(m[1]);
            const lon = parseFloat(m[3]);
            if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
        }
        return null;
    };
    const [mapOpen, setMapOpen] = useState(false);
    const [mapCoords, setMapCoords] = useState(null);

    const toggleAttendance = async () => {
        if (!isClockedIn) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                    const status = computeStartStatus();
                    saveAttendance(loc, status);
                }, async () => {
                    const loc = await getAutoLocation();
                    const status = computeStartStatus();
                    saveAttendance(loc, status);
                });
            } else {
                const loc = await getAutoLocation();
                const status = computeStartStatus();
                saveAttendance(loc, status);
            }
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                    saveAttendance(loc, 'departed');
                }, async () => {
                    const loc = await getAutoLocation();
                    saveAttendance(loc, 'departed');
                });
            } else {
                const loc = await getAutoLocation();
                saveAttendance(loc, 'departed');
            }
        }
    };

    const saveAttendance = (loc, status) => {
        const type = !isClockedIn ? t('attendance') : t('departure');
        setAttendanceHistory([{
            id: Date.now(),
            employee: t(user.name),
            type,
            time: currentTime.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            date: currentTime.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US'),
            location: loc,
            status: status || null,
        }, ...attendanceHistory]);
        setIsClockedIn(!isClockedIn);
        const statusLabel = status ? (status === 'on_time' ? t('onTime') : status === 'late' ? t('late') : status === 'early' ? t('early') : t('outsideHours')) : '';
        addNotification('attendanceNotif', `${t(user.name)} - ${type} - ${loc}${status ? ' - ' + statusLabel : ''}`, 'attendance');
    };

    const addExpense = (e) => {
        e.preventDefault();
        if (!newExpense.amount || !newExpense.department) return;

        const amount = parseFloat(newExpense.amount);
        const currentTotal = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        if (currentTotal + amount > expenseLimits.max) {
            alert(t('limitExceeded'));
            return;
        }

        setExpenses([{
            id: Date.now(),
            department: newExpense.department,
            amount: amount,
            description: newExpense.description,
            date: currentTime.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')
        }, ...expenses]);
        addNotification('financeNotif', `${newExpense.amount} ${t('currency')} - ${newExpense.department}`, 'finance');
        setShowForm(false);
        setNewExpense({ department: '', amount: '', description: '' });
    };

    const deleteExpense = (id) => {
        if (window.confirm(t('confirmDelete'))) {
            setExpenses(expenses.filter(e => e.id !== id));
            addNotification('deleteNotif', 'Record removed', 'warning');
        }
    };

    const exportToExcel = () => {
        let csvContent = "\uFEFF"; // UTF-8 BOM
        csvContent += `${t('date')},${t('department')},${t('description')},${t('amount')}\n`;
        expenses.forEach(exp => {
            csvContent += `${exp.date},${exp.department},${exp.description},${exp.amount}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `report_${currentTime.toLocaleDateString()}.csv`);
        link.click();
    };

    const currentTotal = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    if (!user) {
        return (
            <div dir={isRtl ? 'rtl' : 'ltr'} style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card glass-morphism" style={{ width: '450px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <img src="/logo.png" alt={t('logoAlt')} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary-glow))' }} />
                        </div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>{t('companyName')}</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{t('tagline')}</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('email')}</label><input type="email" className="input-field" placeholder="admin@system.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div style={{ marginBottom: '2rem' }}><label className="form-label">{t('password')}</label><input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center', fontSize: '1.1rem' }}>{t('login')} <LogIn size={20} /></button>
                    </form>
                </div>
                {/* Floating Language Toggle for Login Screen */}
                <div style={{ position: 'fixed', top: '25px', right: '25px', zIndex: '2000' }}>
                    <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
                        padding: '10px 15px',
                        background: '#1e293b',
                        border: '1px solid var(--primary)',
                        borderRadius: '50px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                        transform: 'none',
                        transition: 'none'
                    }}>
                        <Languages size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{lang === 'ar' ? 'English' : 'العربية'}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" dir={isRtl ? 'rtl' : 'ltr'}>
            <header className="header glass-morphism" dir="ltr" style={{ padding: '0.8rem 2rem', marginBottom: '2rem', zIndex: '1000', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <img src="/logo.png" alt={t('logoAlt')} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                    <h2 style={{ fontSize: '1.2rem', color: 'white' }}>{t('companyName')}</h2>
                </div>

                <nav style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    {user.role === 'admin' ? (
                        <>
                            <button className={`btn ${view === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => setView('dashboard')} style={{ background: view !== 'dashboard' ? 'transparent' : undefined }}><LayoutDashboard size={18} /> {t('dashboard')}</button>
                            <button className={`btn ${view === 'attendance-report' ? 'btn-primary' : ''}`} onClick={() => setView('attendance-report')} style={{ background: view !== 'attendance-report' ? 'transparent' : undefined }}><FileSpreadsheet size={18} /> {t('attendanceReport')}</button>
                            <button className={`btn ${view === 'manage-employees' ? 'btn-primary' : ''}`} onClick={() => setView('manage-employees')} style={{ background: view !== 'manage-employees' ? 'transparent' : undefined }}><UserCog size={18} /> {t('accounts')}</button>
                            <button className={`btn ${view === 'settings' ? 'btn-primary' : ''}`} onClick={() => setView('settings')} style={{ background: view !== 'settings' ? 'transparent' : undefined }}><Building2 size={18} /> {t('departments')}</button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setView('attendance')}><Calendar size={18} /> {t('recordAttendance')}</button>
                    )}

                    <div style={{ position: 'relative' }}>
                        <button className="btn" onClick={() => setView('profile')} style={{ background: view === 'profile' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', padding: '10px' }}>
                            <User size={20} />
                        </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button className="btn" onClick={() => setShowNotifs(!showNotifs)} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px' }}>
                            <Bell size={20} />
                            {notifications.length > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--accent)', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid white' }}></span>}
                        </button>
                        {showNotifs && (
                            <div className="card" style={{
                                position: 'absolute',
                                top: '60px',
                                left: 'auto',
                                right: '0',
                                width: '380px',
                                zIndex: '99999',
                                padding: '1.5rem',
                                maxHeight: '550px',
                                overflowY: 'auto',
                                background: '#111827',
                                border: '2px solid var(--primary)',
                                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.9)',
                                borderRadius: '16px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}><Bell size={18} color="var(--primary)" /> {t('notifications')}</h4>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => setNotifications([])} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', padding: '6px 12px', borderRadius: '10px', fontWeight: 'bold' }}>{t('clearAll')}</button>
                                        <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>
                                </div>
                                {notifications.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>{t('noNotifications')}</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{
                                            marginBottom: '1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            padding: '1.2rem',
                                            borderRadius: '12px',
                                            borderRight: isRtl ? `5px solid ${n.type === 'finance' ? 'var(--primary)' : 'var(--success)'}` : 'none',
                                            borderLeft: !isRtl ? `5px solid ${n.type === 'finance' ? 'var(--primary)' : 'var(--success)'}` : 'none',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                                        }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '6px', color: 'white' }}>{n.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>{n.message}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '10px', display: 'flex', justifyContent: 'flex-end', fontWeight: 'bold' }}>{n.time}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <button className="btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        <Languages size={18} /> {lang === 'ar' ? 'English' : 'العربية'}
                    </button>
                    <button className="btn" onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px' }}><LogOut size={18} /></button>
                </nav>
            </header>

            {view === 'dashboard' && (
                <>
                    <div className="grid">
                        <div className="card stat-card" style={{ borderBottom: '4px solid var(--primary)' }}>
                            <h3><Banknote size={16} color="var(--primary)" style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('totalExpenses')}</h3>
                            <div className="value">{currentTotal.toLocaleString()} {t('currency')}</div>
                        </div>
                        <div className="card stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
                            <h3><FileText size={16} color="var(--success)" style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('totalOperations')}</h3>
                            <div className="value">{expenses.length} {t('operationsCount')}</div>
                        </div>
                        <div className="card stat-card" style={{ borderBottom: '4px solid #3b82f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3><Clock size={16} color="#3b82f6" style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('workHours')}</h3>
                                <button onClick={() => { setNewHours(workingHours); setShowHoursForm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><Edit3 size={16} /></button>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{t('startTime')}:</span>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{formatTime12(workingHours.start)}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                    <span>{t('endTime')}:</span>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{formatTime12(workingHours.end)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="card stat-card" style={{ borderBottom: '4px solid #f59e0b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3><Settings size={16} color="#f59e0b" style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('expenseLimits')}</h3>
                                <button onClick={() => { setNewLimits(expenseLimits); setShowLimitForm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><Edit3 size={16} /></button>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{t('maxLimit')}:</span>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{expenseLimits.max.toLocaleString()}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                    <span>{t('minLimit')}:</span>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{expenseLimits.min.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <button className="card btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
                            <Plus size={32} /> <span>{t('addNewOperation')}</span>
                        </button>
                    </div>

                    {showHoursForm && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div className="card glass-morphism" style={{ width: '400px', background: '#1e293b', border: '1px solid var(--primary)' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>{t('workHours')}</h3>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">{t('startTime')}</label>
                                    <input type="time" className="input-field" value={newHours.start} onChange={e => setNewHours({ ...newHours, start: e.target.value })} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">{t('endTime')}</label>
                                    <input type="time" className="input-field" value={newHours.end} onChange={e => setNewHours({ ...newHours, end: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                                    <button className="btn btn-primary" onClick={() => {
                                        setWorkingHours(newHours);
                                        setShowHoursForm(false);
                                        alert(t('scheduleSaved'));
                                    }} style={{ flex: 1, justifyContent: 'center' }}>{t('saveWorkHours')}</button>
                                    <button className="btn" onClick={() => setShowHoursForm(false)} style={{ background: 'rgba(255,255,255,0.1)' }}><X size={18} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showLimitForm && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div className="card glass-morphism" style={{ width: '400px', background: '#1e293b', border: '1px solid var(--primary)' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>{t('expenseLimits')}</h3>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">{t('maxLimit')}</label>
                                    <input type="number" className="input-field" value={newLimits.max} onChange={e => setNewLimits({ ...newLimits, max: parseFloat(e.target.value) })} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">{t('minLimit')}</label>
                                    <input type="number" className="input-field" value={newLimits.min} onChange={e => setNewLimits({ ...newLimits, min: parseFloat(e.target.value) })} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                                    <button className="btn btn-primary" onClick={() => {
                                        setExpenseLimits(newLimits);
                                        setShowLimitForm(false);
                                        alert(t('limitsSaved'));
                                    }} style={{ flex: 1, justifyContent: 'center' }}>{t('saveLimits')}</button>
                                    <button className="btn" onClick={() => setShowLimitForm(false)} style={{ background: 'rgba(255,255,255,0.1)' }}><X size={18} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <div className="card glass-morphism" style={{ marginTop: '2rem' }}>
                            <form onSubmit={addExpense} className="grid" style={{ gridTemplateColumns: isRtl ? '1fr 1fr 1fr auto' : '1fr 1fr 1fr auto', alignItems: 'end' }}>
                                <div><label className="form-label">{t('department')}</label>
                                    <select className="input-field" value={newExpense.department} onChange={e => setNewExpense({ ...newExpense, department: e.target.value })}>
                                        <option value="">{t('department')}</option>
                                        {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div><label className="form-label">{t('amount')}</label><input type="number" className="input-field" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} /></div>
                                <div><label className="form-label">{t('details')}</label><input type="text" className="input-field" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} /></div>
                                <button type="submit" className="btn btn-primary">{t('saveOperation')}</button>
                                <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}><X size={18} /></button>
                            </form>
                        </div>
                    )}

                    <div className="card glass-morphism" style={{ marginTop: '2rem', padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>{t('detailedReport')}</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn" onClick={exportToExcel} style={{ background: 'var(--success)', color: 'white' }}><Download size={18} /> {t('exportExcel')}</button>
                                <button className="btn" onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.05)' }}><Printer size={18} /> {t('print')}</button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ margin: '0' }}>
                                <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    <tr>
                                        <th>{t('date')}</th>
                                        <th>{t('responsibleDept')}</th>
                                        <th>{t('description')}</th>
                                        <th>{t('amount')}</th>
                                        <th>{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(exp => (
                                        <tr key={exp.id}>
                                            <td>{exp.date}</td>
                                            <td><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{exp.department}</span></td>
                                            <td style={{ color: 'var(--text-dim)' }}>{exp.description}</td>
                                            <td style={{ fontWeight: '900', fontSize: '1.1rem' }}>{exp.amount.toLocaleString()} {t('currency')}</td>
                                            <td><button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {view === 'attendance-report' && (
                <div className="card glass-morphism">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3>{t('attendanceReport')}</h3>
                        <button className="btn" onClick={() => window.print()}><Printer size={18} /> {t('print')}</button>
                    </div>
                    <table>
                        <thead><tr><th>{t('employee')}</th><th>{t('operation')}</th><th>{t('status')}</th><th>{t('time')}</th><th>{t('date')}</th><th>{t('gpsLocation')}</th><th>{t('map')}</th></tr></thead>
                        <tbody>
                            {attendanceHistory.map((h, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 'bold' }}>{h.employee}</td>
                                    <td><span style={{ color: h.type === t('attendance') ? 'var(--success)' : 'var(--danger)', background: 'rgba(255,255,255,0.02)', padding: '5px 12px', borderRadius: '8px' }}>{h.type}</span></td>
                                    <td>{h.status ? (h.status === 'on_time' ? t('onTime') : h.status === 'late' ? t('late') : h.status === 'early' ? t('early') : t('outsideHours')) : '-'}</td>
                                    <td>{h.time}</td>
                                    <td>{h.date}</td>
                                    <td style={{ fontSize: '0.85rem' }}><MapPin size={14} /> {h.location}</td>
                                    <td>
                                        <button className="btn" onClick={() => {
                                            const coords = parseLatLon(h.location);
                                            if (!coords) { alert(t('noLocation')); return; }
                                            setMapCoords(coords);
                                            setMapOpen(true);
                                        }} style={{ padding: '6px 10px' }}>
                                            <MapIcon size={16} /> {t('viewOnMap')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'settings' && (
                <div className="card glass-morphism">
                    <h3>{t('manageDepts')}</h3>
                    <div style={{ marginTop: '2rem', maxWidth: '500px' }}>
                        <form onSubmit={(e) => { e.preventDefault(); setDepartments([...departments, newDeptName]); setNewDeptName(''); }} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <input type="text" className="input-field" placeholder={t('newDeptPlaceholder')} value={newDeptName} onChange={e => setNewDeptName(e.target.value)} required />
                            <button type="submit" className="btn btn-primary">{t('add')}</button>
                        </form>
                        {departments.map((d, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                                <span>{d}</span>
                                <button onClick={() => setDepartments(departments.filter(dept => dept !== d))} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'manage-employees' && (
                <div className="card glass-morphism">
                    <h3>{t('accounts')}</h3>
                    <div style={{ marginTop: '2rem' }}>
                        <form onSubmit={(e) => { e.preventDefault(); setUsers([...users, { id: Date.now(), name: newEmpName, email: newEmpEmail, password: newEmpPass, role: 'employee' }]); setNewEmpName(''); setNewEmpEmail(''); setNewEmpPass(''); }} className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'end', marginBottom: '2rem' }}>
                            <div><label className="form-label">{t('employee')}</label><input type="text" className="input-field" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} required /></div>
                            <div><label className="form-label">{t('email')}</label><input type="email" className="input-field" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} required /></div>
                            <div><label className="form-label">{t('password')}</label><input type="text" className="input-field" value={newEmpPass} onChange={e => setNewEmpPass(e.target.value)} required /></div>
                            <button type="submit" className="btn btn-primary">{t('add')}</button>
                        </form>
                        <table>
                            <thead><tr><th>{t('employee')}</th><th>{t('email')}</th><th>{t('password')}</th><th>{t('actions')}</th></tr></thead>
                            <tbody>
                                {users.filter(u => u.role !== 'admin').map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.password}</td>
                                        <td><button onClick={() => setUsers(users.filter(usr => usr.id !== u.id))} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'profile' && (
                <div className="card glass-morphism" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                            {t(user.name).charAt(0).toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', color: 'white' }}>{t(user.name)}</h2>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: 'inline-block' }}>
                            {user.role === 'admin' ? t('adminRole') : t('employeeRole')}
                        </span>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const updatedUsers = users.map(u => u.id === user.id ? user : u);
                        setUsers(updatedUsers);
                        alert(t('saveChanges'));
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">{t('fullName')}</label>
                            <input type="text" className="input-field" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">{t('email')}</label>
                            <input type="email" className="input-field" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">{t('password')}</label>
                            <input type="text" className="input-field" value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            {t('saveChanges')}
                        </button>
                    </form>
                </div>
            )}

            {view === 'attendance' && user.role === 'employee' && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <div className="grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
                        <div className="card glass-morphism" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '5px', background: isClockedIn ? 'var(--success)' : 'var(--primary)' }}></div>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '50px', background: isClockedIn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: isClockedIn ? 'var(--success)' : 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isClockedIn ? 'var(--success)' : '#64748b' }}></span>
                                    {isClockedIn ? t('workingNow') : t('outsideWork')}
                                </div>
                            </div>
                            <Clock size={48} color={isClockedIn ? 'var(--success)' : 'var(--primary)'} style={{ marginBottom: '1.5rem', opacity: '0.8' }} />
                            <h1 style={{ fontSize: '5.5rem', fontWeight: '900', color: 'white' }}>
                                {currentTime.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </h1>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                {t('workHours')}: {t('startTime')} {formatTime12(workingHours.start)} - {t('endTime')} {formatTime12(workingHours.end)}
                            </div>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
                                {currentTime.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <div style={{ margin: '3rem auto', maxWidth: '400px', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px' }}><MapPin size={24} color="white" /></div>
                                <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t('geoTarget')}</div>
                                    <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>{currentLocation}</div>
                                </div>
                            </div>
                            <div>
                                <button className="btn" onClick={() => {
                                    const coords = parseLatLon(currentLocation);
                                    if (!coords) { alert(t('noLocation')); return; }
                                    setMapCoords(coords);
                                    setMapOpen(true);
                                }} style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <MapIcon size={16} /> {t('viewOnMap')}
                                </button>
                            </div>
                            <button className="btn" onClick={toggleAttendance} style={{ padding: '2rem 5rem', fontSize: '2rem', borderRadius: '100px', background: isClockedIn ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
                                {isClockedIn ? t('endWork') : t('startWork')}
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="card glass-morphism" style={{ padding: '1.5rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}><Clock size={20} color="var(--primary)" /> {t('todayRecords')}</h3>
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {attendanceHistory.filter(h => h.employee === t(user.name)).length > 0 ? (
                                        attendanceHistory.filter(h => h.employee === t(user.name)).map((h, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', borderRight: isRtl ? `4px solid ${h.type === t('attendance') ? 'var(--success)' : 'var(--danger)'}` : 'none', borderLeft: !isRtl ? `4px solid ${h.type === t('attendance') ? 'var(--success)' : 'var(--danger)'}` : 'none' }}>
                                                <div><div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{h.type}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{h.date}</div></div>
                                                <div><div style={{ fontWeight: 'black', fontSize: '1.2rem', color: 'white' }}>{h.time}</div></div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>{t('noRecordsToday')}</div>
                                    )}
                                </div>
                            </div>
                            <div className="card glass-morphism" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{t('tipTitle')}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>{t('tipText')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {mapOpen && mapCoords && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card glass-morphism" style={{ width: '700px', maxWidth: '90%', border: '1px solid var(--primary)', background: '#0f172a', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}><MapIcon size={18} color="var(--primary)" /> {t('map')}</h3>
                            <button className="btn" onClick={() => setMapOpen(false)} style={{ background: 'rgba(255,255,255,0.08)' }}><X size={18} /></button>
                        </div>
                        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <iframe
                                title="map"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lon}&z=16&ie=UTF8&iwloc=&output=embed`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

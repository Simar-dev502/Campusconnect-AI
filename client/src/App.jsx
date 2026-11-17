import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  ArrowRight, Bell, BookOpen, BriefcaseBusiness, Check, ChevronDown, CircleHelp, Flag, Pencil,
  Compass, GraduationCap, Heart, LogOut, Menu, MessageCircle, Plus, Search,
  Send, Sparkles, Users, X
} from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
const SERVER_URL = API_URL.replace(/\/api\/?$/, '');
const api = axios.create({ baseURL: API_URL });
const tokenKey = 'campusconnect-token';
const userKey = 'campusconnect-user';
const currentYear = new Date().getFullYear();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: Compass },
  { path: '/community', label: 'Community', icon: MessageCircle },
  { path: '/projects', label: 'Projects', icon: BriefcaseBusiness },
  { path: '/skills', label: 'Skill exchange', icon: Sparkles },
  { path: '/help', label: 'Help & doubts', icon: CircleHelp },
  { path: '/messages', label: 'Messages', icon: Send },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/matcher', label: 'Team matcher', icon: Users },
  { path: '/profile', label: 'My profile', icon: GraduationCap }
];

const errorText = (error) => error.response?.data?.message || error.message || 'Something went wrong.';
const getId = (value) => value?._id || value?.id || value;
const initials = (name = 'Student') => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const dateLabel = (date) => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

function App() {
  return (
    <BrowserRouter>
      <CampusApp />
    </BrowserRouter>
  );
}

function CampusApp() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(userKey) || 'null'); } catch { return null; }
  });
  const [notice, setNotice] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const notify = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(tokenKey)) return;
    api.get('/auth/me').then(({ data }) => {
      setUser(data.user);
      localStorage.setItem(userKey, JSON.stringify(data.user));
    }).catch(() => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      setUser(null);
    });
  }, []);

  const signIn = (data) => {
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(userKey, JSON.stringify(data.user));
    setUser(data.user);
    navigate('/dashboard');
  };
  const signOut = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setUser(null);
    navigate('/');
  };

  return (
    <>
      {notice && <div className="toast" role="status">{notice}</div>}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" onAuth={signIn} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" onAuth={signIn} />} />
        <Route path="/*" element={user ? (
          <AppShell user={user} path={location.pathname} onSignOut={signOut} notify={notify} />
        ) : <Navigate to="/login" replace state={{ from: location.pathname }} />} />
      </Routes>
    </>
  );
}

function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav wrap">
        <Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={21} /></span> campusconnect<span className="brand-ai">.ai</span></Link>
        <div className="landing-links"><a href="#features">Why CampusConnect</a><Link to="/login">Log in</Link><Link className="button button-primary" to="/register">Join the community <ArrowRight size={16} /></Link></div>
      </header>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot" /> THE NETWORK FOR WHAT'S NEXT</div>
            <h1>Your next big idea<br />starts <span>between campuses.</span></h1>
            <p>Meet ambitious students, trade skills, and build projects together. Your people are out there — let’s find them.</p>
            <div className="hero-actions"><Link className="button button-primary button-large" to="/register">Find your people <ArrowRight size={18} /></Link><Link className="button button-quiet button-large" to="/login">I have an account</Link></div>
            <div className="social-proof"><div className="avatar-stack"><span>AS</span><span>MK</span><span>JD</span><span>+</span></div><span>One community. Countless possibilities.</span></div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="art-glow" />
            <div className="art-card art-main"><div className="art-card-top"><span className="mini-icon purple"><Sparkles size={16} /></span><span className="online-label">LIVE MATCH</span></div><h3>Great teams happen<br />by design.</h3><div className="match-row"><div className="avatar">AM</div><div><b>Alex Morgan</b><small>Product design · 94% match</small></div><span className="match-check"><Check size={15} /></span></div><div className="match-row"><div className="avatar avatar-blue">RK</div><div><b>Riya Kapoor</b><small>Machine learning · 87% match</small></div><span className="match-check"><Check size={15} /></span></div></div>
            <div className="art-float float-top"><span className="float-icon"><Users size={16} /></span><div><b>Across every campus</b><small>Find collaborators anywhere</small></div></div>
            <div className="art-float float-bottom"><span className="float-icon yellow"><BookOpen size={16} /></span><div><b>Learn by sharing</b><small>Skills go further together</small></div></div>
          </div>
        </section>
        <section className="feature-section" id="features"><div className="wrap"><div className="section-heading"><span className="eyebrow">A BETTER WAY TO CONNECT</span><h2>Make your campus<br />feel a little bigger.</h2><p>Everything you need to move from “I have an idea” to “we built it.”</p></div><div className="feature-grid">{[
          [Users, 'Meet your people', 'Find students who share your interests, wherever they study.'],
          [Sparkles, 'Trade what you know', 'Teach a skill, learn something new, and grow together.'],
          [BriefcaseBusiness, 'Build something real', 'Find teammates and turn good ideas into great projects.']
        ].map(([Icon, title, copy]) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
        <section className="cta-section wrap"><div><span className="eyebrow">YOUR PEOPLE ARE HERE</span><h2>Good things happen<br />when we build together.</h2><p>Join students connecting across campuses and making their next move.</p><Link className="button button-light button-large" to="/register">Get started — it’s free <ArrowRight size={18} /></Link></div><div className="cta-orb"><GraduationCap size={82} strokeWidth={1} /></div></section>
      </main>
      <footer className="landing-footer wrap"><Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={19} /></span> campusconnect<span className="brand-ai">.ai</span></Link><span>Connect beyond campuses. Collaborate without limits.</span><span>© {currentYear} CampusConnect AI</span></footer>
    </div>
  );
}

function AuthPage({ mode, onAuth }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', course: '', branch: '', currentYear: '1', currentSemester: '1', skills: '', interests: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = isRegister ? {
        ...form, skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
        interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean)
      } : { email: form.email, password: form.password };
      const { data } = await api.post(`/auth/${mode}`, body);
      onAuth(data);
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><Link to="/" className="brand auth-brand"><span className="brand-mark"><GraduationCap size={21} /></span> campusconnect<span className="brand-ai">.ai</span></Link><div className="auth-card"><span className="eyebrow">{isRegister ? 'YOUR NEXT CHAPTER' : 'WELCOME BACK'}</span><h1>{isRegister ? 'Create your account' : 'Good to see you again.'}</h1><p>{isRegister ? 'Tell us a little about yourself to get started.' : 'Log in to pick up where you left off.'}</p>
    {error && <div className="form-error" role="alert">{error}</div>}
    <form onSubmit={submit} className="form-grid">
      {isRegister && <label className="full">Full name<input name="name" value={form.name} onChange={update} required autoComplete="name" placeholder="e.g. Alex Morgan" /></label>}
      <label className="full">Email address<input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" placeholder="you@university.edu" /></label>
      <label className="full">Password<input name="password" type="password" value={form.password} onChange={update} required minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="At least 8 characters" /></label>
      {isRegister && <>
        <label className="full">College / university<input name="college" value={form.college} onChange={update} required placeholder="Your institution" /></label>
        <label>Course<input name="course" value={form.course} onChange={update} required placeholder="e.g. B.Tech" /></label><label>Branch<input name="branch" value={form.branch} onChange={update} required placeholder="e.g. Computer Science" /></label>
        <label>Current year<input name="currentYear" type="number" min="1" max="8" value={form.currentYear} onChange={update} required /></label><label>Semester<input name="currentSemester" type="number" min="1" max="16" value={form.currentSemester} onChange={update} required /></label>
        <label className="full">Skills <small>Separate with commas</small><input name="skills" value={form.skills} onChange={update} required placeholder="React, UI design, Python" /></label>
        <label className="full">Interests <small>Separate with commas</small><input name="interests" value={form.interests} onChange={update} required placeholder="Climate tech, robotics, startups" /></label>
      </>}
      <button className="button button-primary auth-submit full" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'} <ArrowRight size={17} /></button>
    </form><div className="auth-switch">{isRegister ? 'Already a member?' : 'New to CampusConnect?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></div></div><div className="auth-foot">Built for students, wherever you study.</div></div>;
}

function AppShell({ user, path, onSignOut, notify }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const active = navItems.find((item) => item.path === path)?.label || (path === '/admin' ? 'Admin' : 'Overview');
  useEffect(() => {
    api.get('/notifications').then(({ data }) => setUnread(data.unreadCount || 0)).catch(() => {});
  }, [path]);
  return <div className="app-layout"><aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}><Link to="/dashboard" className="brand side-brand"><span className="brand-mark"><GraduationCap size={21} /></span><span>campusconnect<span className="brand-ai">.ai</span></span></Link><div className="workspace-label">YOUR WORKSPACE</div><nav className="side-nav">{navItems.map(({ path: to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={`side-link ${path === to ? 'side-active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && unread > 0 && <span className="nav-count">{unread}</span>}</Link>)}{user.role === 'admin' && <Link to="/admin" className={`side-link ${path === '/admin' ? 'side-active' : ''}`}><Users size={18} /><span>Admin dashboard</span></Link>}</nav><div className="sidebar-bottom"><div className="sidebar-note"><Sparkles size={17} /><div><b>Make your next move</b><small>Great things start with a hello.</small></div></div><button className="profile-mini" onClick={() => navigate('/profile')}><Avatar name={user.name} photo={user.profilePhoto} /><span><b>{user.name}</b><small>{user.college || 'Student account'}</small></span><ChevronDown size={16} /></button><button className="logout-link" onClick={onSignOut}><LogOut size={16} /> Log out</button></div></aside>
    {menuOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    <div className="main-column"><header className="topbar"><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div><div className="topbar-actions"><button className="icon-button" aria-label="Notifications" onClick={() => navigate('/notifications')}><Bell size={19} />{unread > 0 && <i />}</button><button className="top-user" onClick={() => navigate('/profile')}><Avatar name={user.name} photo={user.profilePhoto} /><span>{user.name?.split(' ')[0]}</span></button></div></header>
      <main className="page-content"><Routes>
        <Route path="/dashboard" element={<Dashboard user={user} notify={notify} />} />
        <Route path="/community" element={<Community user={user} notify={notify} />} />
        <Route path="/projects" element={<Projects user={user} notify={notify} />} />
        <Route path="/projects/:projectId" element={<ProjectDetails user={user} notify={notify} />} />
        <Route path="/students/:studentId" element={<StudentDetails user={user} notify={notify} />} />
        <Route path="/skills" element={<Skills user={user} notify={notify} />} />
        <Route path="/help" element={<HelpHub user={user} notify={notify} />} />
        <Route path="/messages" element={<Messages user={user} notify={notify} />} />
        <Route path="/notifications" element={<Notifications notify={notify} />} />
        <Route path="/matcher" element={<Matcher notify={notify} />} />
        <Route path="/profile" element={<Profile user={user} onUpdate={notify} />} />
        <Route path="/admin" element={user.role === 'admin' ? <Admin notify={notify} /> : <Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes></main>
    </div>
  </div>;
}

function Avatar({ name, photo, className = '' }) {
  const src = photo?.startsWith('/') ? `${SERVER_URL}${photo}` : photo;
  return src ? <img className={`avatar-img ${className}`} src={src} alt="" /> : <span className={`avatar ${className}`}>{initials(name)}</span>;
}

async function reportContent(targetType, targetId, notify) {
  const reason = window.prompt(`Why are you reporting this ${targetType}?`);
  if (!reason?.trim()) return;
  try {
    await api.post('/reports', { targetType, targetId, reason: reason.trim() });
    notify('Report submitted for review.');
  } catch (error) {
    notify(errorText(error));
  }
}

function ReportButton({ targetType, targetId, notify }) {
  return <button className="quiet-button" onClick={() => reportContent(targetType, targetId, notify)} aria-label={`Report ${targetType}`}><Flag size={15} /></button>;
}

function StudentRow({ student }) {
  return <Link className="person-row student-row-link" to={`/students/${student._id}`}><Avatar name={student.name} photo={student.profilePhoto} /><div><b>{student.name}</b><small>{student.college} · {student.branch}</small><div className="tag-row">{(student.skills || []).slice(0, 2).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div></div><ArrowRight size={15} /></Link>;
}

function PageTitle({ eyebrow, title, description, action }) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function useResource(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true);
    try { const result = await api.get(url); setData(result.data); setError(''); }
    catch (requestError) { setError(errorText(requestError)); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, setData, loading, error, reload };
}

function Dashboard({ user }) {
  const posts = useResource('/posts');
  const projects = useResource('/projects');
  const skills = useResource('/skills');
  const questions = useResource('/help');
  const [students, setStudents] = useState([]);
  useEffect(() => { api.get('/users/search').then(({ data }) => setStudents(data.students || [])).catch(() => {}); }, []);
  const postList = posts.data?.posts || [];
  return <><PageTitle eyebrow="YOUR CAMPUS, CONNECTED" title={`Good to see you, ${user.name?.split(' ')[0] || 'there'}.`} description="Here’s what’s happening across your community today." action={<Link className="button button-primary" to="/projects"><Plus size={17} /> Start something</Link>} />
    <section className="welcome-card"><div><span className="eyebrow">YOUR NEXT MOVE</span><h2>Big ideas need good people.</h2><p>Meet collaborators, find a project, or share something you’ve been working on.</p><Link to="/matcher" className="text-link">Find your project team <ArrowRight size={16} /></Link></div><div className="welcome-art"><span>✦</span><Users size={44} /></div></section>
    <div className="stat-grid">{[[Users, 'Students nearby', students.length || '—', 'Across your community'], [BriefcaseBusiness, 'Open projects', projects.data?.count ?? projects.data?.projects?.length ?? '—', 'Looking for teammates'], [Sparkles, 'Skill exchanges', skills.data?.count ?? skills.data?.exchanges?.length ?? '—', 'Ways to learn together'], [CircleHelp, 'Questions', questions.data?.count ?? questions.data?.helpRequests?.length ?? '—', 'Waiting for an answer']].map(([Icon, label, value, hint]) => <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small>{hint}</small></div>)}</div>
    <div className="content-grid dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>Community activity</h2><p>Fresh ideas from students like you</p></div><Link className="text-link" to="/community">See all <ArrowRight size={15} /></Link></div>{posts.loading ? <Loading /> : posts.error ? <ErrorMessage message={posts.error} /> : postList.slice(0, 3).map((post) => <PostCard key={post._id} post={post} user={user} onChanged={posts.reload} />)}</section><aside className="panel people-panel"><div className="panel-heading"><div><h2>People to know</h2><p>Find your next collaborator</p></div><Link to="/profile" className="icon-link"><ArrowRight size={17} /></Link></div>{students.slice(0, 4).map((student) => <div className="person-row" key={student._id}><Avatar name={student.name} photo={student.profilePhoto} /><div><b>{student.name}</b><small>{student.college} · {student.branch}</small><div className="tag-row">{(student.skills || []).slice(0, 2).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div></div></div>)}{!students.length && <Empty text="New connections will show up here." />}</aside></div>
  </>;
}

function Community({ user, notify }) {
  const resource = useResource('/posts');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [search, setSearch] = useState('');
  const submit = async (event) => { event.preventDefault(); try { await api.post('/posts', { content, category }); setContent(''); notify('Your post is live.'); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const posts = useMemo(() => (resource.data?.posts || []).filter((post) => !search || `${post.content} ${post.author?.name}`.toLowerCase().includes(search.toLowerCase())), [resource.data, search]);
  return <><PageTitle eyebrow="THE COMMUNITY" title="A good place to share." description="Ideas, questions, small wins — it all belongs here." /><div className="feed-layout"><section><form className="composer panel" onSubmit={submit}><div className="composer-head"><Avatar name={user.name} photo={user.profilePhoto} /><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What are you working on or thinking about?" required maxLength={3000} /></div><div className="composer-actions"><select value={category} onChange={(event) => setCategory(event.target.value)}>{['General', 'Technical', 'Academic', 'Projects', 'Events', 'Resources'].map((item) => <option key={item}>{item}</option>)}</select><button className="button button-primary" disabled={!content.trim()}><Plus size={16} /> Share post</button></div></form><div className="feed-toolbar"><h2>Latest posts</h2><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts" /></div></div>{resource.loading ? <Loading /> : resource.error ? <ErrorMessage message={resource.error} /> : posts.map((post) => <PostCard key={post._id} post={post} user={user} onChanged={resource.reload} notify={notify} />)}{!posts.length && !resource.loading && <Empty text="No posts yet. Start the conversation." />}</section><aside className="panel side-tip"><span className="feature-icon"><Sparkles size={20} /></span><h3>Good conversations start with a share.</h3><p>Share what you’re learning, ask for a different perspective, or celebrate a small win.</p><Link className="text-link" to="/help">Ask the community <ArrowRight size={15} /></Link></aside></div></>;
}

function PostCard({ post, user, onChanged, notify = () => {} }) {
  const [liked, setLiked] = useState((post.likes || []).some((id) => getId(id) === (user.id || user._id)));
  const [likes, setLikes] = useState((post.likes || []).length || post.likesCount || 0);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editCategory, setEditCategory] = useState(post.category);
  const toggleLike = async () => { try { const { data } = await api.post(`/posts/${post._id}/like`); setLiked(data.liked); setLikes(data.likesCount); } catch (error) { notify(errorText(error)); } };
  const loadComments = async () => { const next = !showComments; setShowComments(next); if (next) { try { const { data } = await api.get(`/posts/${post._id}/comments`); setComments(data.comments || []); } catch (error) { notify(errorText(error)); } } };
  const addComment = async (event) => { event.preventDefault(); try { const { data } = await api.post(`/posts/${post._id}/comments`, { content: comment }); setComments([data.comment, ...comments]); setComment(''); } catch (error) { notify(errorText(error)); } };
  const remove = async () => { if (!window.confirm('Delete this post?')) return; try { await api.delete(`/posts/${post._id}`); onChanged(); } catch (error) { notify(errorText(error)); } };
  const saveEdit = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/posts/${post._id}`, { content: editContent, category: editCategory });
      setEditing(false);
      notify('Post updated.');
      onChanged();
    } catch (error) { notify(errorText(error)); }
  };
  const isOwner = getId(post.author) === (user.id || user._id);
  return <article className="post-card panel"><div className="post-head"><Avatar name={post.author?.name} photo={post.author?.profilePhoto} /><div className="post-author"><b>{post.author?.name || 'Student'}</b><small>{[post.author?.college, post.author?.branch].filter(Boolean).join(' · ')} · {dateLabel(post.createdAt)}</small></div><span className="tag">{post.category}</span>{isOwner ? <><button className="quiet-button" onClick={() => setEditing(!editing)} aria-label="Edit post"><Pencil size={15} /></button><button className="quiet-button" onClick={remove} aria-label="Delete post"><X size={16} /></button></> : <ReportButton targetType="post" targetId={post._id} notify={notify} />}</div>{editing ? <form className="post-edit-form" onSubmit={saveEdit}><textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} maxLength={3000} required /><select value={editCategory} onChange={(event) => setEditCategory(event.target.value)}>{['General', 'Technical', 'Academic', 'Projects', 'Events', 'Resources'].map((value) => <option key={value}>{value}</option>)}</select><button className="button button-primary">Save changes</button><button type="button" className="button button-outline" onClick={() => { setEditing(false); setEditContent(post.content); setEditCategory(post.category); }}>Cancel</button></form> : <p className="post-content">{post.content}</p>}<div className="post-actions"><button className={liked ? 'liked' : ''} onClick={toggleLike}><Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {likes} likes</button><button onClick={loadComments}><MessageCircle size={17} /> {post.commentsCount || comments.length || 0} comments</button></div>{showComments && <div className="comments-area">{comments.map((item) => <div className="comment-row" key={item._id}><b>{item.author?.name}</b><span>{item.content}</span>{getId(item.author) !== (user.id || user._id) && <ReportButton targetType="comment" targetId={item._id} notify={notify} />}</div>)}<form onSubmit={addComment}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment…" required /><button className="icon-button" aria-label="Send comment"><Send size={16} /></button></form></div>}</article>;
}

function Projects({ user, notify }) {
  const resource = useResource('/projects');
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState('');
  const [applicationText, setApplicationText] = useState({});
  const [applications, setApplications] = useState({});
  const create = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api.post('/projects', { title: form.get('title'), description: form.get('description'), category: form.get('category'), requiredSkills: form.get('requiredSkills').split(',').map((x) => x.trim()).filter(Boolean), positions: Number(form.get('positions')) }); setShowCreate(false); notify('Project published.'); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const apply = async (projectId) => { try { await api.post(`/applications/project/${projectId}`, { message: applicationText[projectId] || 'I would like to contribute to this project.' }); notify('Application sent to the project owner.'); } catch (error) { notify(errorText(error)); } };
  const review = async (applicationId, status, projectId) => { try { await api.patch(`/applications/${applicationId}/status`, { status }); notify(`Application ${status}.`); openApplications(projectId); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const openApplications = async (id) => { try { const { data } = await api.get(`/applications/project/${id}`); setApplications({ ...applications, [id]: data.applications || [] }); } catch (error) { notify(errorText(error)); } };
  const projects = (resource.data?.projects || []).filter((project) => `${project.title} ${project.description} ${(project.requiredSkills || []).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageTitle eyebrow="MAKE IT HAPPEN" title="Projects worth building." description="Find a team, bring your skills, and make something real." action={<button className="button button-primary" onClick={() => setShowCreate(!showCreate)}><Plus size={17} /> Post a project</button>} />
    {showCreate && <form className="panel create-form" onSubmit={create}><div className="form-title"><h2>Start a project</h2><button type="button" className="quiet-button" onClick={() => setShowCreate(false)}><X size={18} /></button></div><div className="form-grid"><label>Project title<input name="title" required placeholder="What are you building?" /></label><label>Category<select name="category"><option>Other</option>{['Technology', 'Research', 'Design', 'Social Impact', 'Business'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="full">Description<textarea name="description" rows="3" required placeholder="Describe the idea and what you hope to achieve." /></label><label className="full">Skills needed <small>Comma-separated</small><input name="requiredSkills" placeholder="React, Figma, data science" /></label><label>Available teammate positions<input name="positions" type="number" min="1" max="30" defaultValue="3" /></label><div className="form-align-end"><button className="button button-primary">Publish project</button></div></div></form>}
    <div className="search-box project-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or skills" /></div>
    {resource.loading ? <Loading /> : resource.error ? <ErrorMessage message={resource.error} /> : <div className="project-grid">{projects.map((project) => { const isOwner = getId(project.owner) === (user.id || user._id); return <article className="project-card panel" key={project._id}><div className="project-card-top"><span className="tag">{project.category}</span><span className={`status status-${project.status}`}>{project.status}</span>{!isOwner && <ReportButton targetType="project" targetId={project._id} notify={notify} />}</div><h2><Link to={`/projects/${project._id}`}>{project.title}</Link></h2><p>{project.description}</p><div className="tag-row">{(project.requiredSkills || []).map((skill) => <span className="tag tag-soft" key={skill}>{skill}</span>)}</div><div className="project-meta"><span><Users size={15} /> {(project.teamMembers || []).length}/{(project.positions || 1) + 1} teammates</span><span>By {project.owner?.name || 'Student'}</span></div>{project.deadline && <small className="deadline">Deadline {dateLabel(project.deadline)}</small>}{isOwner ? <button className="button button-outline full-button" onClick={() => openApplications(project._id)}>Review applications <ArrowRight size={15} /></button> : <div className="apply-row"><input value={applicationText[project._id] || ''} onChange={(event) => setApplicationText({ ...applicationText, [project._id]: event.target.value })} placeholder="Why are you a good fit?" /><button className="button button-primary" onClick={() => apply(project._id)}>Apply</button></div>}{applications[project._id] && <div className="application-list">{applications[project._id].length ? applications[project._id].map((app) => <div className="application-row" key={app._id}><span><b>{app.applicant?.name}</b><small>{app.message}</small></span>{app.status === 'pending' ? <div><button className="mini-action" onClick={() => review(app._id, 'accepted', project._id)}>Accept</button><button className="mini-action reject" onClick={() => review(app._id, 'rejected', project._id)}>Decline</button></div> : <span className="tag">{app.status}</span>}</div>) : <small>No applications yet.</small>}</div>}</article>; })}</div>}
    {!projects.length && !resource.loading && <Empty text="No projects match that search. Try another keyword or post the first one." />}
  </>;
}

function ProjectDetails({ user, notify }) {
  const { projectId } = useParams();
  const resource = useResource(`/projects/${projectId}`, [projectId]);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [applications, setApplications] = useState([]);
  const project = resource.data?.project;
  const isOwner = getId(project?.owner) === (user.id || user._id);

  const apply = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/applications/project/${projectId}`, { message });
      notify('Application sent to the project owner.');
      setMessage('');
    } catch (error) { notify(errorText(error)); }
  };
  const loadApplications = async () => {
    try {
      const { data } = await api.get(`/applications/project/${projectId}`);
      setApplications(data.applications || []);
    } catch (error) { notify(errorText(error)); }
  };
  const review = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      notify(`Application ${status}.`);
      loadApplications();
      resource.reload();
    } catch (error) { notify(errorText(error)); }
  };

  if (resource.loading) return <Loading />;
  if (resource.error || !project) return <ErrorMessage message={resource.error || 'Project not found.'} />;

  return <>
    <button className="back-link" onClick={() => navigate('/projects')}>← Back to projects</button>
    <PageTitle eyebrow={project.category} title={project.title} description={`Created by ${project.owner?.name || 'a student'} at ${project.owner?.college || 'their campus'}.`} action={!isOwner && <ReportButton targetType="project" targetId={project._id} notify={notify} />} />
    <div className="detail-layout">
      <section className="panel detail-main"><div className="detail-status"><span className={`status status-${project.status}`}>{project.status}</span><span>{project.deadline ? `Deadline ${dateLabel(project.deadline)}` : 'No deadline set'}</span></div><h2>About this project</h2><p className="detail-description">{project.description}</p><h3>Skills the team needs</h3><div className="tag-row">{project.requiredSkills?.length ? project.requiredSkills.map((skill) => <span className="tag tag-soft" key={skill}>{skill}</span>) : <span className="muted-copy">No specific skills listed.</span>}</div><h3>Project team</h3><div className="team-list"><Link className="person-row" to={`/students/${getId(project.owner)}`}><Avatar name={project.owner?.name} photo={project.owner?.profilePhoto} /><span><b>{project.owner?.name} · Project owner</b><small>{project.owner?.college}</small></span></Link>{project.teamMembers?.filter((member) => getId(member) !== getId(project.owner)).map((member) => <Link className="person-row" to={`/students/${getId(member)}`} key={getId(member)}><Avatar name={member.name} photo={member.profilePhoto} /><span><b>{member.name}</b><small>{member.college}</small></span></Link>)}</div></section>
      <aside className="panel detail-sidebar"><div className="detail-stat"><span>Team size</span><strong>{project.teamMembers?.length || 0} / {(project.positions || 1) + 1}</strong></div><div className="detail-stat"><span>Project status</span><strong className="detail-status-text">{project.status}</strong></div>{isOwner ? <><button className="button button-outline full-button" onClick={loadApplications}>Load applications</button>{applications.map((application) => <div className="application-row" key={application._id}><span><b>{application.applicant?.name}</b><small>{application.message}</small></span>{application.status === 'pending' && <div><button className="mini-action" onClick={() => review(application._id, 'accepted')}>Accept</button><button className="mini-action reject" onClick={() => review(application._id, 'rejected')}>Decline</button></div>}</div>)}</> : <form className="detail-apply" onSubmit={apply}><label>Interested in joining?<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell the team how you can help…" required maxLength={1000} /></label><button className="button button-primary full-button">Apply to join <ArrowRight size={15} /></button></form>}</aside>
    </div>
  </>;
}

function StudentDetails({ user, notify }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const resource = useResource(`/users/${studentId}`, [studentId]);
  const student = resource.data?.student;
  const startConversation = async () => {
    try {
      await api.post('/messages', { participantIds: [studentId], type: 'direct' });
      navigate('/messages');
    } catch (error) { notify(errorText(error)); }
  };
  if (resource.loading) return <Loading />;
  if (resource.error || !student) return <ErrorMessage message={resource.error || 'Student not found.'} />;
  return <>
    <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
    <PageTitle eyebrow="STUDENT PROFILE" title={student.name} description={`${student.course || ''} ${student.branch ? `· ${student.branch}` : ''} · ${student.college}`} action={<><button className="button button-primary" onClick={startConversation}><MessageCircle size={16} /> Message</button>{getId(student) !== (user.id || user._id) && <ReportButton targetType="user" targetId={student._id} notify={notify} />}</>} />
    <div className="student-detail-grid"><section className="panel student-detail-card"><Avatar name={student.name} photo={student.profilePhoto} className="student-detail-avatar" /><h2>{student.name}</h2><p>{student.college} · {student.course} · {student.branch}</p><p>Year {student.currentYear} · Semester {student.currentSemester}</p>{student.bio && <div className="detail-description">{student.bio}</div>}<h3>Skills</h3><div className="tag-row">{(student.skills || []).map((skill) => <span className="tag tag-soft" key={skill}>{skill}</span>)}</div><h3>Interests</h3><div className="tag-row">{(student.interests || []).map((interest) => <span className="tag" key={interest}>{interest}</span>)}</div></section></div>
  </>;
}

function Skills({ notify }) {
  const resource = useResource('/skills');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const create = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api.post('/skills', { skill: form.get('skill'), type: form.get('type'), description: form.get('description'), mode: form.get('mode') }); setShowForm(false); notify('Your skill listing is published.'); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const listings = (resource.data?.exchanges || []).filter((item) => (type === 'all' || item.type === type) && `${item.skill} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageTitle eyebrow="GIVE A LITTLE, GAIN A LOT" title="Skills are better shared." description="Offer something you know or find someone to learn from." action={<button className="button button-primary" onClick={() => setShowForm(!showForm)}><Plus size={17} /> Create listing</button>} />
    {showForm && <form className="panel create-form" onSubmit={create}><div className="form-grid"><label>Skill<input name="skill" required placeholder="e.g. Figma prototyping" /></label><label>I'm here to<select name="type"><option value="offer">Teach / offer</option><option value="request">Learn / request</option></select></label><label className="full">Details<textarea name="description" rows="3" required placeholder="What would you like to share or learn?" /></label><label>Format<select name="mode"><option value="both">Online or in person</option><option value="online">Online</option><option value="offline">In person</option></select></label><button className="button button-primary form-align-end">Publish listing</button></div></form>}
    <div className="filter-row"><div className="filter-pills">{['all', 'offer', 'request'].map((value) => <button key={value} className={type === value ? 'filter-active' : ''} onClick={() => setType(value)}>{value === 'all' ? 'All listings' : value === 'offer' ? 'Offering' : 'Looking to learn'}</button>)}</div><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a skill" /></div></div>
    {resource.loading ? <Loading /> : resource.error ? <ErrorMessage message={resource.error} /> : <div className="skill-grid">{listings.map((item) => <article className="skill-card panel" key={item._id}><div className="skill-card-top"><span className={`skill-type ${item.type}`}>{item.type === 'offer' ? 'SHARING A SKILL' : 'WANTS TO LEARN'}</span><span className="tag">{item.mode}</span><ReportButton targetType="skill" targetId={item._id} notify={notify} /></div><h2>{item.skill}</h2><p>{item.description}</p><Link className="person-row compact" to={`/students/${getId(item.student)}`}><Avatar name={item.student?.name} photo={item.student?.profilePhoto} /><div><b>{item.student?.name}</b><small>{item.student?.college}</small></div><span className="tag">{item.type === 'offer' ? 'Teach' : 'Learn'}</span></Link><Link to="/messages" className="button button-outline full-button">Connect with {item.student?.name?.split(' ')[0] || 'student'} <ArrowRight size={15} /></Link></article>)}</div>}
    {!listings.length && !resource.loading && <Empty text="No listings found. Be the first to share a skill." />}
  </>;
}

function HelpHub({ user, notify }) {
  const resource = useResource('/help');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const ask = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api.post('/help', { title: form.get('title'), description: form.get('description'), category: form.get('category'), tags: form.get('tags').split(',').map((x) => x.trim()).filter(Boolean) }); setFormOpen(false); notify('Your question is posted.'); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const answer = async (event, question) => { event.preventDefault(); try { await api.post(`/help/${question._id}/answers`, { content: answers[question._id] }); setAnswers({ ...answers, [question._id]: '' }); notify('Answer added.'); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const accept = async (questionId, answerId) => { try { await api.patch(`/help/${questionId}/answers/${answerId}/accept`); notify('Answer accepted.'); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const questions = (resource.data?.helpRequests || []).filter((item) => `${item.title} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageTitle eyebrow="LEARN OUT LOUD" title="Questions welcome." description="Ask a question, share what you know, and help someone get unstuck." action={<button className="button button-primary" onClick={() => setFormOpen(!formOpen)}><Plus size={17} /> Ask a question</button>} />
    {formOpen && <form className="panel create-form" onSubmit={ask}><div className="form-grid"><label className="full">Question title<input name="title" required placeholder="What do you need help with?" /></label><label>Topic<select name="category">{['Programming', 'Computer Science', 'Mathematics', 'Projects', 'Career', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Tags <small>Comma-separated</small><input name="tags" placeholder="React, algorithms" /></label><label className="full">Details<textarea rows="3" name="description" required placeholder="Add context so others can help." /></label><button className="button button-primary form-align-end">Post question</button></div></form>}
    <div className="search-box question-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions, topics, or tags" /></div>
    {resource.loading ? <Loading /> : resource.error ? <ErrorMessage message={resource.error} /> : <div className="question-list">{questions.map((question) => <article className="panel question-card" key={question._id}><div className="question-title-row"><div><span className="tag">{question.category}</span><span className={`status ${question.status === 'resolved' ? 'status-complete' : ''}`}>{question.status}</span><h2>{question.title}</h2></div><span className="answer-count">{question.answers?.length || 0}<small>answers</small></span>{getId(question.author) !== (user.id || user._id) && <ReportButton targetType="help" targetId={question._id} notify={notify} />}</div><p>{question.description}</p><div className="post-head question-author"><Avatar name={question.author?.name} photo={question.author?.profilePhoto} /><small>{question.author?.name} · {question.author?.college} · {dateLabel(question.createdAt)}</small></div>{(question.answers || []).map((item) => <div className={`answer-card ${getId(question.acceptedAnswer) === item._id ? 'answer-accepted' : ''}`} key={item._id}><div><b>{item.author?.name}</b>{getId(question.acceptedAnswer) === item._id && <span className="accepted-label"><Check size={13} /> Accepted answer</span>}</div><p>{item.content}</p>{getId(question.author) === (user.id || user._id) && question.status !== 'resolved' && <button className="mini-action" onClick={() => accept(question._id, item._id)}>Accept answer</button>}</div>)}{question.status !== 'resolved' && getId(question.author) !== (user.id || user._id) && <form className="answer-form" onSubmit={(event) => answer(event, question)}><input value={answers[question._id] || ''} onChange={(event) => setAnswers({ ...answers, [question._id]: event.target.value })} placeholder="Share an answer…" required /><button className="button button-outline">Answer</button></form>}</article>)}</div>}
    {!questions.length && !resource.loading && <Empty text="No questions found. Ask the first one." />}
  </>;
}

function Messages({ user, notify }) {
  const resource = useResource('/messages');
  const [current, setCurrent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [socket, setSocket] = useState(null);
  const selected = current || resource.data?.conversations?.[0];
  const conversationId = selected?._id;
  const other = selected?.participants?.find((person) => getId(person) !== (user.id || user._id));
  const loadMessages = useCallback(async () => { if (!conversationId) return; try { const { data } = await api.get(`/messages/${conversationId}/messages`); setMessages(data.messages || []); await api.patch(`/messages/${conversationId}/read`); } catch (error) { notify(errorText(error)); } }, [conversationId, notify]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return undefined;
    const client = io(API_URL.replace(/\/api\/?$/, ''), { auth: { token } });
    client.on('new_message', (message) => { if (getId(message.conversation) === conversationId) setMessages((items) => [...items, message]); });
    setSocket(client);
    return () => client.disconnect();
  }, [conversationId]);
  useEffect(() => {
    if (!studentSearch.trim()) { setStudents([]); return; }
    const timer = window.setTimeout(() => api.get('/users/search', { params: { search: studentSearch } }).then(({ data }) => setStudents(data.students || [])).catch((error) => notify(errorText(error))), 250);
    return () => window.clearTimeout(timer);
  }, [studentSearch, notify]);
  useEffect(() => {
    if (!conversationId || !socket) return;
    socket.emit('join_conversation', conversationId, (result) => { if (!result?.success) notify(result?.message || 'Could not join conversation.'); });
  }, [conversationId, socket, notify]);
  const send = async (event) => { event.preventDefault(); if (!content.trim() || !conversationId) return; try { const { data } = await api.post(`/messages/${conversationId}/messages`, { content }); setMessages((items) => [...items, data.data]); setContent(''); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const start = async (studentId) => { try { const { data } = await api.post('/messages', { participantIds: [studentId], type: 'direct' }); setCurrent(data.conversation); setStudentSearch(''); resource.reload(); } catch (error) { notify(errorText(error)); } };
  return <><PageTitle eyebrow="A LITTLE LESS DISTANT" title="Your conversations." description="Good ideas get better when you talk them through." /><div className="messaging panel"><aside className="conversation-sidebar"><div className="conversation-search"><Search size={16} /><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Find a student" /></div>{students.map((student) => <button className="conversation-item" onClick={() => start(student._id)} key={student._id}><Avatar name={student.name} photo={student.profilePhoto} /><span><b>{student.name}</b><small>{student.college}</small></span></button>)}{resource.data?.conversations?.map((conversation) => { const person = conversation.participants?.find((item) => getId(item) !== (user.id || user._id)); return <button className={`conversation-item ${getId(selected) === conversation._id ? 'conversation-active' : ''}`} onClick={() => setCurrent(conversation)} key={conversation._id}><Avatar name={person?.name} photo={person?.profilePhoto} /><span><b>{person?.name || conversation.name || 'Conversation'}</b><small>{conversation.lastMessage?.content || 'Start a conversation'}</small></span></button>; })}</aside><section className="chat-panel">{selected ? <><div className="chat-head"><Avatar name={other?.name} photo={other?.profilePhoto} /><span><b>{other?.name || 'Conversation'}</b><small>{other?.college || 'CampusConnect student'}</small></span></div><div className="chat-messages">{messages.map((message) => <div className={`message-bubble ${getId(message.sender) === (user.id || user._id) ? 'message-own' : ''}`} key={message._id}><p>{message.content}</p><small>{dateLabel(message.createdAt)}</small></div>)}</div><form className="chat-compose" onSubmit={send}><input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a message…" required /><button className="button button-primary" aria-label="Send message"><Send size={17} /></button></form></> : <Empty text="Choose a conversation or find a student to say hello." />}</section></div></>;
}

function Notifications({ notify }) {
  const resource = useResource('/notifications');
  const items = resource.data?.notifications || [];
  const markAll = async () => { try { await api.patch('/notifications/read-all'); notify('All notifications marked as read.'); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const markRead = async (id) => { try { await api.patch(`/notifications/${id}/read`); resource.reload(); } catch (error) { notify(errorText(error)); } };
  const remove = async (id) => { try { await api.delete(`/notifications/${id}`); resource.reload(); } catch (error) { notify(errorText(error)); } };
  return <><PageTitle eyebrow="STAY IN THE LOOP" title="Notifications" description={`${resource.data?.unreadCount || 0} unread updates from your community.`} action={<button className="button button-outline" onClick={markAll}>Mark all as read</button>} />{resource.loading ? <Loading /> : resource.error ? <ErrorMessage message={resource.error} /> : <div className="notification-list">{items.map((item) => <article className={`notification-card panel ${item.isRead ? '' : 'notification-unread'}`} key={item._id}><span className="notification-icon"><Bell size={18} /></span><div><b>{item.title}</b><p>{item.message}</p><small>{dateLabel(item.createdAt)}</small></div><div className="notification-actions">{!item.isRead && <button className="mini-action" onClick={() => markRead(item._id)}>Mark read</button>}<button className="quiet-button" onClick={() => remove(item._id)} aria-label="Delete notification"><X size={17} /></button></div></article>)}</div>}{!items.length && !resource.loading && <Empty text="You're all caught up. New updates will appear here." />}</>;
}

function Matcher({ notify }) {
  const projects = useResource('/projects');
  const [projectId, setProjectId] = useState('');
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async (event) => { event.preventDefault(); if (!projectId) return; setLoading(true); try { const { data } = await api.post('/ai/team-match', { projectId }); setMatches(data); } catch (error) { notify(errorText(error)); } finally { setLoading(false); } };
  return <><PageTitle eyebrow="SMART TEAM MATCHER" title="Find the right teammates." description="Skill-based recommendations from real student profiles and project requirements." /><div className="matcher-intro panel"><span className="feature-icon"><Sparkles size={21} /></span><div><h2>Explainable recommendations</h2><p>Matches are ranked by overlapping skills with your chosen project. Each score is calculated from profile data — no trained AI model is claimed.</p></div></div><form className="panel matcher-form" onSubmit={run}><label>Select a project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} required><option value="">Choose a project…</option>{(projects.data?.projects || []).map((project) => <option key={project._id} value={project._id}>{project.title}</option>)}</select></label><button className="button button-primary" disabled={loading}>{loading ? 'Finding matches…' : 'Find teammates'} <ArrowRight size={16} /></button></form>{matches && <><div className="match-summary"><span><b>{matches.totalMatches || 0}</b> candidates match <strong>{matches.project}</strong></span><span>{matches.availablePositions} open position{matches.availablePositions === 1 ? '' : 's'}</span></div><div className="match-grid">{(matches.matches || []).map((match) => <article className="panel match-card" key={match.student._id}><div className="match-person"><Avatar name={match.student.name} photo={match.student.profilePhoto} /><div><h3>{match.student.name}</h3><p>{match.student.college} · {match.student.branch}</p></div><strong>{match.score}%<small>skill match</small></strong></div><p className="match-reason">{match.matchedSkills?.length ? `Matches on ${match.matchedSkills.join(', ')}` : 'Relevant collaborator for this project'}</p><div className="tag-row">{(match.matchedSkills || []).map((skill) => <span className="tag tag-match" key={skill}><Check size={12} /> {skill}</span>)}</div><Link className="text-link" to="/messages">Start a conversation <ArrowRight size={15} /></Link></article>)}</div>{!matches.matches?.length && <Empty text="No matches yet. Try a project with required skills or invite more students." />}</>}</>;
}

function Profile({ user, onUpdate }) {
  const [profile, setProfile] = useState(user);
  const [photoUrl, setPhotoUrl] = useState(user.profilePhoto || '');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  useEffect(() => { api.get('/users/me').then(({ data }) => { setProfile(data.user); setPhotoUrl(data.user.profilePhoto || ''); }).catch((error) => setStatus(errorText(error))); }, []);
  useEffect(() => { if (search.trim().length < 2) { setStudents([]); return; } const timer = window.setTimeout(() => api.get('/users/search', { params: { search } }).then(({ data }) => setStudents(data.students || [])).catch((error) => setStatus(errorText(error))), 250); return () => window.clearTimeout(timer); }, [search]);
  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('photo', file);
    setUploading(true);
    try {
      const { data } = await api.post('/users/me/photo', form);
      setProfile(data.user);
      setPhotoUrl(data.user.profilePhoto);
      localStorage.setItem(userKey, JSON.stringify(data.user));
      setStatus('Profile photo uploaded.');
      onUpdate('Your profile photo was updated.');
    } catch (error) {
      setStatus(errorText(error));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };
  const save = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = { name: form.get('name'), college: form.get('college'), course: form.get('course'), branch: form.get('branch'), currentYear: form.get('currentYear'), currentSemester: form.get('currentSemester'), bio: form.get('bio'), profilePhoto: photoUrl, skills: form.get('skills').split(',').map((x) => x.trim()).filter(Boolean), interests: form.get('interests').split(',').map((x) => x.trim()).filter(Boolean) };
    try {
      const { data } = await api.put('/users/me', body);
      setProfile(data.user);
      setPhotoUrl(data.user.profilePhoto || '');
      localStorage.setItem(userKey, JSON.stringify(data.user));
      setStatus('Profile saved.');
      onUpdate('Your profile was updated.');
    } catch (error) { setStatus(errorText(error)); }
  };
  return <><PageTitle eyebrow="YOUR PROFILE" title="Put your best self forward." description="Help other students understand what you’re into and what you can bring." /><div className="profile-layout"><form className="panel profile-form" onSubmit={save}><div className="profile-cover"><Avatar name={profile.name} photo={profile.profilePhoto} className="profile-avatar" /><span>{profile.college}</span></div><div className="form-grid"><label>Name<input name="name" defaultValue={profile.name} required /></label><label>College / university<input name="college" defaultValue={profile.college} required /></label><label>Course<input name="course" defaultValue={profile.course} /></label><label>Branch<input name="branch" defaultValue={profile.branch} /></label><label>Year<input name="currentYear" type="number" min="1" max="8" defaultValue={profile.currentYear} /></label><label>Semester<input name="currentSemester" type="number" min="1" max="16" defaultValue={profile.currentSemester} /></label><label className="full">Profile photo URL<input name="profilePhoto" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} placeholder="https://… or upload below" /></label><label className="full">Upload profile photo <small>JPEG, PNG or WebP · up to 2 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={uploading} /></label><label className="full">About you<textarea name="bio" rows="3" defaultValue={profile.bio} placeholder="A little about what you’re learning or building." /></label><label className="full">Skills <small>Comma-separated</small><input name="skills" defaultValue={(profile.skills || []).join(', ')} required /></label><label className="full">Interests <small>Comma-separated</small><input name="interests" defaultValue={(profile.interests || []).join(', ')} required /></label><button className="button button-primary form-align-end" disabled={uploading}>Save profile</button>{status && <span className="form-status">{status}</span>}</div></form><aside className="panel discover-panel"><h2>Discover students</h2><p>Search across campuses by name, college, or branch.</p><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" /></div>{students.map((student) => <StudentRow key={student._id} student={student} />)}</aside></div></>;
}

function Admin({ notify }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const load = useCallback(async () => { try { const [statsResult, reportsResult, usersResult] = await Promise.all([api.get('/admin/stats'), api.get('/admin/reports'), api.get('/admin/users')]); setStats(statsResult.data.stats); setReports(reportsResult.data.reports || []); setUsers(usersResult.data.users || []); setError(''); } catch (requestError) { setError(errorText(requestError)); } }, []);
  useEffect(() => { load(); }, [load]);
  const review = async (id, status) => { try { await api.patch(`/admin/reports/${id}`, { status }); notify('Report updated.'); load(); } catch (requestError) { notify(errorText(requestError)); } };
  const toggleUser = async (target) => { try { await api.patch(`/admin/users/${target._id}/status`, { isActive: !target.isActive }); notify(`Account ${target.isActive ? 'deactivated' : 'activated'}.`); load(); } catch (requestError) { notify(errorText(requestError)); } };
  return <><PageTitle eyebrow="ADMINISTRATION" title="Platform overview." description="Review reports and keep the student community healthy." />{error && <ErrorMessage message={error} />}{stats && <div className="stat-grid">{[['Total users', stats.totalUsers], ['Active users', stats.activeUsers], ['Posts', stats.totalPosts], ['Projects', stats.totalProjects], ['Pending reports', stats.pendingReports]].map(([label, value]) => <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><Users size={18} /></div><strong>{value}</strong></div>)}</div>}<section className="panel admin-reports"><div className="panel-heading"><div><h2>Reported content</h2><p>Reports submitted by community members</p></div></div>{reports.map((report) => <div className="report-row" key={report._id}><div><span className="tag">{report.targetType} · {report.status}</span><b>Reason: {report.reason}</b><small>Reported by {report.reporter?.name} · {dateLabel(report.createdAt)}</small></div>{report.status === 'pending' && <div><button className="mini-action" onClick={() => review(report._id, 'reviewed')}>Reviewed</button><button className="mini-action reject" onClick={() => review(report._id, 'dismissed')}>Dismiss</button><button className="mini-action reject" onClick={() => review(report._id, 'action_taken')}>Take action</button></div>}</div>)}{!reports.length && <Empty text="No reports to review." />}</section><section className="panel admin-reports"><div className="panel-heading"><div><h2>Student accounts</h2><p>Activate or deactivate accounts; administrators cannot be disabled here.</p></div></div>{users.map((target) => <div className="report-row user-admin-row" key={target._id}><div><b>{target.name}</b><small>{target.email} · {target.college}</small></div><div><span className={`status ${target.isActive ? '' : 'status-closed'}`}>{target.isActive ? 'active' : 'inactive'}</span>{target.role !== 'admin' && <button className={`mini-action ${target.isActive ? 'reject' : ''}`} onClick={() => toggleUser(target)}>{target.isActive ? 'Deactivate' : 'Activate'}</button>}</div></div>)}{!users.length && <Empty text="No student accounts found." />}</section></>;
}

function Loading() { return <div className="loading-state"><span className="spinner" /> Loading community data…</div>; }
function ErrorMessage({ message }) { return <div className="form-error" role="alert">{message}</div>; }
function Empty({ text }) { return <div className="empty-state"><span className="empty-icon"><Search size={19} /></span><p>{text}</p></div>; }

export default App;

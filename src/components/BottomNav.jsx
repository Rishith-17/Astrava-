import './BottomNav.css';

function BottomNav({ activeScreen, onNavigate }) {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'market', icon: '📈', label: 'Market' },
    { id: 'history', icon: '📊', label: 'History' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activeScreen === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;

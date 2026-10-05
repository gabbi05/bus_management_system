export default function Header({ title }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-right">
        <span className="header-date">{dateStr}</span>
        <div className="user-info">
          <div className="user-avatar">{(user.username || 'A')[0].toUpperCase()}</div>
          <span className="user-name">{user.username || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}

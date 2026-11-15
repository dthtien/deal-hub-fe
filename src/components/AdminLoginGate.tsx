import { useEffect, useState, type ReactNode } from 'react';
import { ADMIN_AUTH_EVENT, hasAdminLogin, saveAdminLogin } from '../utils/adminAuth';

// Shows a login form until the admin has entered a username and password,
// then renders the admin page. If the API later answers 401, the stored login
// is cleared and the form comes back.
export default function AdminLoginGate({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(hasAdminLogin);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [wasRejected, setWasRejected] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const now = hasAdminLogin();
      setLoggedIn(prev => {
        if (prev && !now) setWasRejected(true);
        return now;
      });
    };
    window.addEventListener(ADMIN_AUTH_EVENT, onChange);
    return () => window.removeEventListener(ADMIN_AUTH_EVENT, onChange);
  }, []);

  if (loggedIn) return <>{children}</>;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    saveAdminLogin(username, password);
    setPassword('');
    setWasRejected(false);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4"
      >
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin login</h1>
        {wasRejected && (
          <p className="text-sm text-red-600 dark:text-red-400">That username or password was not accepted.</p>
        )}
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={!username || !password}
          className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2"
        >
          Log in
        </button>
      </form>
    </div>
  );
}

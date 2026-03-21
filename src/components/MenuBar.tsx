"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from '/logo.png';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { useDarkMode } from '../hooks/useDarkMode';

const STORES = [
  { name: 'The Iconic', icon: '👠' },
  { name: 'ASOS', icon: '👗' },
  { name: 'JD Sports', icon: '👟' },
  { name: 'Nike', icon: '✔️' },
  { name: 'Kmart', icon: '🏪' },
  { name: 'JB Hi-Fi', icon: '💻' },
  { name: 'Myer', icon: '🛍️' },
  { name: 'Culture Kings', icon: '👑' },
  { name: 'Big W', icon: '🛒' },
  { name: 'The Good Guys', icon: '📺' },
];

export default function MenuBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useAuth();


  return (
    <>
      {/* Main nav */}
      <header className="bg-red-600 dark:bg-red-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="OzVFY" className="w-10 h-10 rounded-xl object-contain" />
              <span className="font-bold text-lg text-white hidden sm:block">OzVFY</span>
            </Link>

            {/* Right: dark mode + auth + mobile toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDark}
                className="p-2 rounded-xl text-white hover:bg-red-500 dark:hover:bg-red-600 transition-colors"
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? '☀️' : '🌙'}
              </button>
              {user ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                      {user.email[0].toUpperCase()}
                    </div>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-white/70 hidden sm:block" />
                  </Menu.Button>
                  <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <Menu.Item>{({ active }) => (
                        <Link to="/saved" className={`flex items-center gap-2 px-4 py-2.5 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                          <span>❤️</span> Saved Deals
                        </Link>
                      )}</Menu.Item>
                      <Menu.Item>{({ active }) => (
                        <button onClick={logout} className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                          <span>↩️</span> Log out
                        </button>
                      )}</Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="hidden sm:flex items-center gap-1.5 bg-white text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Log in
                </button>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 rounded-lg text-white hover:bg-red-500">
                {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden bg-red-600 dark:bg-red-700 px-4 pb-4">
            {!user && (
              <button onClick={() => { setShowAuth(true); setMobileOpen(false); }} className="w-full mt-3 bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm">
                Log in / Sign up
              </button>
            )}
            <Link to="/saved" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 mt-3 text-sm text-white py-2">
              ❤️ Saved Deals
            </Link>
          </div>
        )}
      </header>

      {/* Store strip */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto scrollbar-hide gap-0 py-0">
            {STORES.map(s => (
              <Link
                key={s.name}
                to={`/stores/${encodeURIComponent(s.name)}`}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 px-3 py-3 border-b-2 border-transparent hover:border-orange-500 transition-all whitespace-nowrap"
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

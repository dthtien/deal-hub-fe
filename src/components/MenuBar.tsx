"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon, Bars3Icon, XMarkIcon, SunIcon, MoonIcon, HeartIcon, ArrowUturnLeftIcon, CalendarIcon, TagIcon, SparklesIcon, ArrowTrendingDownIcon, ClockIcon, TrophyIcon, MagnifyingGlassIcon, BoltIcon } from "@heroicons/react/24/outline";
import logo from '/logo.png';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { useDarkMode } from '../hooks/useDarkMode';
import PushNotificationBell from './PushNotificationBell';

const STORES = [
  { name: 'The Iconic' },
  { name: 'ASOS' },
  { name: 'JD Sports' },
  { name: 'Nike' },
  { name: 'Kmart' },
  { name: 'JB Hi-Fi' },
  { name: 'Myer' },
  { name: 'Culture Kings' },
  { name: 'Big W' },
  { name: 'The Good Guys' },
  { name: 'Good Buyz' },
  { name: 'Beginning Boutique' },
  { name: 'Universal Store' },
];

export default function MenuBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        navigate(`/?query=${encodeURIComponent(value.trim())}`);
      } else {
        navigate('/');
      }
    }, 400);
  }, [navigate]);

  useEffect(() => {
    if (mobileSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [mobileSearchOpen]);


  return (
    <>
      {/* Main nav */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="OzVFY" className="w-10 h-10 rounded-xl object-contain" />
              <span className="font-bold text-lg text-white hidden sm:block">OzVFY</span>
            </Link>

            {/* Desktop search bar */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Search deals..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Right: dark mode + auth + mobile toggle */}
            <div className="flex items-center gap-2">
              <PushNotificationBell />
              <button
                onClick={toggleDark}
                className="p-2 rounded-xl text-white hover:bg-white/20 transition-colors"
                aria-label="Toggle dark mode"
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
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
                        <Link to="/profile" className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                          <ArrowUturnLeftIcon className="w-4 h-4 text-gray-400" /> My Profile
                        </Link>
                      )}</Menu.Item>
                      <Menu.Item>{({ active }) => (
                        <Link to="/saved" className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                          <HeartIcon className="w-4 h-4 text-rose-400" /> Saved Deals
                        </Link>
                      )}</Menu.Item>
                      <Menu.Item>{({ active }) => (
                        <button onClick={logout} className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                          <ArrowUturnLeftIcon className="w-4 h-4" /> Log out
                        </button>
                      )}</Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="hidden sm:flex items-center gap-1.5 bg-white/20 text-white hover:bg-white/30 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Log in
                </button>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileSearchOpen(o => !o)} aria-label="Search deals" className="md:hidden p-2 rounded-lg text-white hover:bg-white/20">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 rounded-lg text-white hover:bg-white/20">
                {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden bg-gradient-to-r from-orange-500 to-red-500 px-4 pb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search deals..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/30 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden bg-gradient-to-r from-orange-500 to-red-500 px-4 pb-4">
            {!user && (
              <button onClick={() => { setShowAuth(true); setMobileOpen(false); }} className="w-full mt-3 bg-white text-orange-600 hover:bg-orange-50 dark:bg-white dark:text-orange-600 dark:hover:bg-orange-100 font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                Log in / Sign up
              </button>
            )}
            <Link to="/saved" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 mt-3 text-sm text-white py-2">
              <HeartIcon className="w-4 h-4 text-rose-400 inline mr-1.5" />Saved Deals
            </Link>
          </div>
        )}
      </header>

      {/* Store strip */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 border-b border-red-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto scrollbar-hide gap-0 py-0">
            {STORES.map(s => (
              <Link
                key={s.name}
                to={`/stores/${encodeURIComponent(s.name)}`}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
              >
                <span>{s.name}</span>
              </Link>
            ))}
            <Link
              to="/deals/flash"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-yellow-200 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <BoltIcon className="w-4 h-4" />
              <span>Flash Deals</span>
            </Link>
            <Link
              to="/deals/new"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>New Today</span>
            </Link>
            <Link
              to="/deals/this-week"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>This Week</span>
            </Link>
            <Link
              to="/best-drops"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <ArrowTrendingDownIcon className="w-4 h-4" />
              <span>Price Drops</span>
            </Link>
            <Link
              to="/deals/expiring"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <ClockIcon className="w-4 h-4" />
              <span>Expiring Soon</span>
            </Link>
            <Link
              to="/coupons"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <TagIcon className="w-4 h-4" />
              <span>Coupons</span>
            </Link>
            <Link
              to="/sales-calendar"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Sales</span>
            </Link>
            <Link
              to="/stores"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>All Stores</span>
            </Link>
            <Link
              to="/leaderboard"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <TrophyIcon className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            <Link
              to="/collections"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-3 border-b-2 border-transparent hover:border-white transition-all whitespace-nowrap"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Collections</span>
            </Link>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

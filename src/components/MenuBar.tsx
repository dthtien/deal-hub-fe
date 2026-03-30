"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Menu } from "@headlessui/react";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  ArrowUturnLeftIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import logo from "/logo.png";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { useDarkMode } from "../hooks/useDarkMode";
import PushNotificationBell from "./PushNotificationBell";
import CurrencySelector from "./CurrencySelector";

const STORES = [
  { name: "The Iconic", slug: "the-iconic" },
  { name: "ASOS", slug: "asos" },
  { name: "JD Sports", slug: "jd-sports" },
  { name: "Nike", slug: "nike" },
  { name: "Kmart", slug: "kmart" },
  { name: "JB Hi-Fi", slug: "jb-hi-fi" },
  { name: "Myer", slug: "myer" },
  { name: "Culture Kings", slug: "culture-kings" },
  { name: "Big W", slug: "big-w" },
  { name: "The Good Guys", slug: "the-good-guys" },
  { name: "Beginning Boutique", slug: "beginning-boutique" },
  { name: "Universal Store", slug: "universal-store" },
  { name: "Lorna Jane", slug: "lorna-jane" },
];

const DEALS_MENU = [
  { label: "All Deals", to: "/", icon: TagIcon },
  { label: "🔥 Popular Now", to: "/deals/popular", icon: SparklesIcon },
  { label: "Best Drops 📉", to: "/best-drops", icon: ArrowTrendingDownIcon },
  { label: "Deals Under $50", to: "/deals/under-50", icon: CurrencyDollarIcon },
  { label: "Deals Under $100", to: "/deals/under-100", icon: CurrencyDollarIcon },
  { label: "Deals Under $200", to: "/deals/under-200", icon: CurrencyDollarIcon },
  { label: "Expiring Soon ⏰", to: "/deals/expiring", icon: ClockIcon },
  { label: "This Week 📅", to: "/deals/this-week", icon: CalendarIcon },
  { label: "✅ Verified Deals", to: "/deals/verified", icon: ShieldCheckIcon },
  { label: "👁 Price Watch", to: "/deals/price-watch", icon: EyeIcon },
  { label: "❤️ Community Picks", to: "/deals/community-picks", icon: HeartIcon },
];

function getFaviconUrl(slug: string) {
  const domainMap: Record<string, string> = {
    "the-iconic": "theiconic.com.au",
    asos: "asos.com",
    "jd-sports": "jdsports.com.au",
    nike: "nike.com",
    kmart: "kmart.com.au",
    "jb-hi-fi": "jbhifi.com.au",
    myer: "myer.com.au",
    "culture-kings": "culturekings.com.au",
    "big-w": "bigw.com.au",
    "the-good-guys": "thegoodguys.com.au",
    "beginning-boutique": "beginningboutique.com.au",
    "universal-store": "universalstore.com",
    "lorna-jane": "lornajane.com.au",
  };
  const domain = domainMap[slug] || `${slug}.com`;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export default function MenuBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileStoresOpen, setMobileStoresOpen] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value.trim()) {
          navigate(`/?query=${encodeURIComponent(value.trim())}`);
        } else {
          navigate("/");
        }
      }, 400);
    },
    [navigate]
  );

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
          <div className="flex items-center justify-between h-16 gap-2">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="OzVFY" className="w-10 h-10 rounded-xl object-contain" />
              <span className="font-bold text-lg text-white hidden sm:block">OzVFY</span>
            </Link>

            {/* Desktop nav links: Deals▾ Stores▾ Flash New */}
            <nav className="hidden md:flex items-center gap-1 flex-shrink-0">

              {/* Deals dropdown — HeroUI */}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="ghost"
                    aria-expanded={undefined}
                    aria-haspopup="true"
                    className="text-white font-semibold hover:bg-white/20 px-3"
                  >
                    Deals <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Deals menu"
                  items={DEALS_MENU}
                  onAction={(key) => navigate(key as string)}
                >
                  {(item) => (
                    <DropdownItem key={item.to} textValue={item.label}>
                      <span className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-gray-400" />
                        {item.label}
                      </span>
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>

              {/* Stores dropdown — HeroUI */}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="ghost"
                    aria-expanded={undefined}
                    aria-haspopup="true"
                    className="text-white font-semibold hover:bg-white/20 px-3"
                  >
                    Stores <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Stores menu"
                  items={[...STORES.map(s => ({ ...s, id: s.name })), { name: 'View all stores →', slug: '__all__', id: '__all__' }]}
                  onAction={(key) => {
                    if (key === '__all__') navigate('/stores');
                    else navigate(`/stores/${encodeURIComponent(key as string)}`);
                  }}
                >
                  {(store) => (
                    <DropdownItem key={store.id} textValue={store.name}>
                      {store.id === '__all__' ? (
                        <span className="text-orange-500 font-semibold">{store.name}</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <img
                            src={getFaviconUrl(store.slug)}
                            alt=""
                            className="w-4 h-4 rounded flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          {store.name}
                        </span>
                      )}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>

              {/* Flash Deals pill */}
              <Link
                to="/deals/flash"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400/30 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <BoltIcon className="w-3.5 h-3.5" />
                Flash
              </Link>

              {/* New Today pill */}
              <Link
                to="/deals/new"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                New
              </Link>

              {/* My Feed pill */}
              <Link
                to="/feed"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-500/30 text-white hover:bg-violet-500/50 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                🎯 My Feed
              </Link>
            </nav>

            {/* Desktop search bar */}
            <div className="hidden md:flex flex-1 max-w-sm mx-2">
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

            {/* Right: currency, bell, dark mode, auth, mobile toggle */}
            <div className="flex items-center gap-1">
              <CurrencySelector />
              <PushNotificationBell />
              <Button
                variant="ghost"
                isIconOnly
                onClick={toggleDark}
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                className="text-white hover:bg-white/20"
              >
                {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </Button>

              {user ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                      {user.email[0].toUpperCase()}
                    </div>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-white/70 hidden sm:block" />
                  </Menu.Button>
                    <Menu.Items
                      transition
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 py-2 overflow-hidden origin-top-right transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                    >
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 ${active ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                          >
                            <ArrowUturnLeftIcon className="w-4 h-4 text-gray-400" /> My Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/saved"
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 ${active ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                          >
                            <HeartIcon className="w-4 h-4 text-rose-400" /> Saved Deals
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 ${active ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                          >
                            <ArrowUturnLeftIcon className="w-4 h-4" /> Log out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                </Menu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex bg-white/20 text-white hover:bg-white/30 border-white/30 font-semibold"
                  onClick={() => setShowAuth(true)}
                >
                  Log in
                </Button>
              )}

              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                isIconOnly
                aria-label="Search deals"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setMobileSearchOpen(o => !o)}
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                isIconOnly
                className="sm:hidden text-white hover:bg-white/20"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </Button>
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
          <div className="sm:hidden bg-gradient-to-r from-orange-500 to-red-500 px-4 pb-4 space-y-1">
            {!user && (
              <Button
                variant="outline"
                fullWidth
                className="mt-3 bg-white text-orange-600 hover:bg-orange-50 border-white font-semibold"
                onClick={() => { setShowAuth(true); setMobileOpen(false); }}
              >
                Log in / Sign up
              </Button>
            )}

            {/* Deals section */}
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1 px-1">Deals</p>
              {DEALS_MENU.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm text-white py-2 px-1 hover:text-yellow-200 transition-colors"
                >
                  <item.icon className="w-4 h-4 opacity-70" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Flash / New pills */}
            <div className="flex gap-2 pt-1 pb-1">
              <Link
                to="/deals/flash"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-400/25 text-yellow-100 text-xs font-semibold"
              >
                <BoltIcon className="w-3.5 h-3.5" /> Flash Deals
              </Link>
              <Link
                to="/deals/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold"
              >
                <SparklesIcon className="w-3.5 h-3.5" /> New Today
              </Link>
            </div>

            {/* Browse Stores section */}
            <div className="mt-2">
              <button
                className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-white/60 mb-1 px-1"
                onClick={() => setMobileStoresOpen(o => !o)}
              >
                <span className="flex items-center gap-1">
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  Browse Stores
                </span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${mobileStoresOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileStoresOpen && (
                <div className="grid grid-cols-2 gap-0.5 mt-1">
                  {STORES.map(store => (
                    <Link
                      key={store.slug}
                      to={`/stores/${encodeURIComponent(store.name)}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm text-white py-2 px-2 hover:text-yellow-200 transition-colors"
                    >
                      <img
                        src={getFaviconUrl(store.slug)}
                        alt=""
                        className="w-4 h-4 rounded flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="truncate text-xs">{store.name}</span>
                    </Link>
                  ))}
                  <Link
                    to="/stores"
                    onClick={() => setMobileOpen(false)}
                    className="col-span-2 flex items-center gap-1 text-xs font-semibold text-yellow-200 hover:text-white py-2 px-2 transition-colors"
                  >
                    View all stores <ChevronRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/saved"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 mt-2 text-sm text-white py-2 px-1"
            >
              <HeartIcon className="w-4 h-4 text-rose-400" /> Saved Deals
            </Link>
          </div>
        )}
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

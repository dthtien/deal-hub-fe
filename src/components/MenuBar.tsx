"use client";

import { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import logo from '/logo.png';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const STORES = [
  { name: 'The Iconic', icon: '👠' },
  { name: 'ASOS', icon: '👗' },
  { name: 'JD Sports', icon: '👟' },
  { name: 'Kmart', icon: '🏪' },
  { name: 'JB Hi-Fi', icon: '💻' },
  { name: 'Myer', icon: '🛍️' },
  { name: 'Nike', icon: '✔️' },
  { name: 'Culture Kings', icon: '👑' },
];

export default function MenuBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Deals", href: "/" },
    { name: "Car Insurances", href: "/quotes/new" },
    { name: "Cars Check", href: "/cars/check" },
    {
      name: "More",
      dropdown: [
        { name: "Terms & Conditions", href: "/terms_and_conditions" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
      ],
    },
  ];

  return (
    <>
    <nav className="bg-white shadow-sm w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="mr-4 cursor-pointer py-1.5 lg:ml-2"
            >
              <img src={logo} alt="logo-ct" className="w-14 rounded"/>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {navItems.map((item, index) =>
              item.dropdown ? (
                <Menu as="div" key={index} className="relative inline-block">
                  <Menu.Button className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none">
                    {item.name}
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                      {item.dropdown.map((subItem, subIndex) => (
                        <Menu.Item key={subIndex}>
                          {({ active }) => (
                            <Link
                              to={subItem.href}
                              className={`block px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <Link
                  key={index}
                  to={item.href}
                  className="text-gray-700 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                  <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {user.email[0].toUpperCase()}
                  </span>
                  <ChevronDownIcon className="w-3 h-3" />
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-50 py-1">
                    <Menu.Item>{({ active }) => <Link to="/saved" className={`block px-4 py-2 text-sm ${active ? 'bg-gray-50' : ''}`}>❤️ Saved Deals</Link>}</Menu.Item>
                    <Menu.Item>{({ active }) => <button onClick={logout} className={`w-full text-left px-4 py-2 text-sm text-red-500 ${active ? 'bg-gray-50' : ''}`}>Log out</button>}</Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button onClick={() => setShowAuth(true)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                Log in
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="p-4 space-y-2">
            {navItems.map((item, index) =>
              item.dropdown ? (
                <Menu key={index} as="div" className="relative">
                  <Menu.Button className="w-full text-left flex justify-between items-center py-2 text-gray-700 hover:text-gray-900">
                    {item.name}
                    <ChevronDownIcon className="w-4 h-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items className="mt-2 bg-white border rounded-md shadow-lg">
                      {item.dropdown.map((subItem, subIndex) => (
                        <Menu.Item key={subIndex}>
                          {({ active }) => (
                            <Link
                              to={subItem.href}
                              className={`block px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <Link
                  key={index}
                  to={item.href}
                  className="block py-2 text-gray-700 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>

    {/* Store quick-links strip */}
    <div className="bg-gray-50 border-b border-gray-100 overflow-x-auto scrollbar-hide mb-3">
      <div className="flex items-center gap-1 px-4 py-1.5 max-w-7xl mx-auto">
        {STORES.map(s => (
          <Link
            key={s.name}
            to={`/stores/${encodeURIComponent(s.name)}`}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-orange-500 hover:bg-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <span>{s.icon}</span>
            <span>{s.name}</span>
          </Link>
        ))}
      </div>
    </div>

    {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

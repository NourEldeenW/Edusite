"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, LogOut } from "lucide-react";

interface linkitemdata {
  href: string;
  key: string;
  name: string;
  icon: React.ReactNode;
}

interface NavbarProps {
  links: linkitemdata[];
  logo: string;
}

const api = process.env.NEXT_PUBLIC_localurl;

export default function Navbar({ links, logo }: NavbarProps) {
  const current = usePathname();
  const [wid, setWid] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [logoOverflow, setLogoOverflow] = useState(false);
  const logoRef = useRef<HTMLSpanElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const mobileLogoRef = useRef<HTMLSpanElement>(null);
  const mobileLogoContainerRef = useRef<HTMLDivElement>(null);
  const [mobileLogoOverflow, setMobileLogoOverflow] = useState(false);

  useEffect(() => {
    const handleResize = () => setWid(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (wid !== null) {
      setIsOpen(wid > 640);
    }
  }, [wid]);

  // Check if logo overflows and needs scrolling animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (logoRef.current && logoContainerRef.current && !isOpen) {
        const logoWidth = logoRef.current.scrollWidth;
        const containerWidth = logoContainerRef.current.clientWidth;
        setLogoOverflow(logoWidth > containerWidth);
      } else {
        setLogoOverflow(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, logo, wid]);

  // Check mobile logo overflow
  useEffect(() => {
    if (
      mobileLogoRef.current &&
      mobileLogoContainerRef.current &&
      wid !== null &&
      wid <= 640
    ) {
      const logoWidth = mobileLogoRef.current.scrollWidth;
      const containerWidth = mobileLogoContainerRef.current.clientWidth;
      setMobileLogoOverflow(logoWidth > containerWidth);
    } else {
      setMobileLogoOverflow(false);
    }
  }, [logo, wid]);

  // Reset loading when route changes
  useEffect(() => {
    setLoadingKey(null);
  }, [current]);

  const handleLogout = async () => {
    setLoadingKey("logout");
    await fetch(`${api}auth/logout`);
    window.location.href = "/login";
  };

  const closeMobileMenu = () => {
    if (wid !== null && wid <= 640) {
      setIsOpen(false);
    }
  };

  const handleLinkClick = (key: string) => {
    setLoadingKey(key);
  };

  if (wid === null) return null;
  const isMobile = wid <= 640;

  // Enhanced spinner with better animation
  const Spinner = () => (
    <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
  );

  const isActiveLink = (href: string, currentPath: string) => {
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  // Scrolling logo component
  const ScrollingLogo = () => (
    <div
      ref={logoContainerRef}
      className={`relative overflow-hidden transition-all duration-1000 ease-out ${
        isOpen ? "w-0 opacity-0" : "flex-1 opacity-100"
      }`}>
      <span
        ref={logoRef}
        className={`inline-block whitespace-nowrap transition-transform duration-1000 ease-linear ${
          logoOverflow ? "animate-scroll" : ""
        }`}>
        {logo}
      </span>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-scroll {
          animation: scroll 8s linear infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }

        .animate-pulse-subtle {
          animation: pulse 2s ease-in-out infinite;
        }

        .sidebar-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item:hover {
          transform: translateX(4px);
        }

        .sidebar-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 0;
          background: linear-gradient(to bottom, #ffffff, #e0e7ff);
          border-radius: 0 2px 2px 0;
          transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item:hover::before,
        .sidebar-item.active::before {
          height: 60%;
        }

        .glass-effect {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>

      {!isMobile ? (
        <nav
          className={`sticky h-[100dvh] bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 p-6 top-0 self-start overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "w-27" : "w-[260px]"
          } shadow-2xl border-r border-white/10`}>
          <ul className="h-full flex flex-col">
            {/* Logo Section */}
            <li className="mb-7 font-pacifico text-2xl text-white flex justify-between items-center relative">
              <ScrollingLogo />
              <button
                className={`hover:bg-white/20 active:bg-white/30 p-3 rounded-xl flex items-center active:scale-95 transition-all duration-300 ease-out hover:shadow-xl ${
                  isOpen ? "rotate-90" : "rotate-0"
                } backdrop-blur-sm`}
                onClick={() => setIsOpen(!isOpen)}>
                <Menu
                  size={28}
                  color="#ffffff"
                  strokeWidth={2.5}
                  className="drop-shadow-sm"
                />
              </button>
            </li>

            {/* Navigation Links */}
            <div className="flex-1 space-y-2">
              {links.map((l, index) => (
                <li
                  key={l.key}
                  className={`sidebar-item group relative hover:bg-white/15 rounded-2xl transition-all duration-300 animate-fadeInUp ${
                    isActiveLink(l.href, current)
                      ? "bg-white/20 active shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <Link
                    href={l.href}
                    className="block"
                    onClick={() => handleLinkClick(l.key)}>
                    <span className="flex items-center gap-4 text-lg font-semibold text-white font-[lato] p-4 relative z-10">
                      <span
                        className={`flex items-center justify-center min-w-[28px] transition-all duration-300 ${
                          loadingKey === l.key ? "animate-pulse-subtle" : ""
                        }`}>
                        {loadingKey === l.key && l.href !== current ? (
                          <Spinner />
                        ) : (
                          <span className="drop-shadow-sm">{l.icon}</span>
                        )}
                      </span>
                      <span
                        className={`whitespace-nowrap transition-all duration-300 ease-out ${
                          isOpen
                            ? "opacity-0 translate-x-6 pointer-events-none"
                            : "opacity-100 translate-x-0"
                        } ${
                          loadingKey === l.key ? "text-white/80" : "text-white"
                        }`}>
                        {l.name}
                      </span>
                    </span>
                  </Link>

                  {/* Hover indicator */}
                  <div
                    className={`${
                      isOpen ? "hidden" : "absolute"
                    } right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100`}
                  />
                </li>
              ))}
            </div>

            {/* Logout Button */}
            <li className="mt-6 group relative hover:bg-red-500/90 rounded-2xl transition-all duration-300 bg-red-500/70 shadow-lg hover:shadow-xl">
              <button
                onClick={handleLogout}
                className="w-full text-left disabled:opacity-50 transition-opacity duration-300"
                disabled={loadingKey === "logout"}>
                <span className="flex items-center gap-4 text-lg font-semibold text-white font-[lato] p-4">
                  <span
                    className={`flex items-center justify-center min-w-[28px] transition-all duration-300 ${
                      loadingKey === "logout" ? "animate-pulse-subtle" : ""
                    }`}>
                    {loadingKey === "logout" ? (
                      <Spinner />
                    ) : (
                      <LogOut
                        size={24}
                        color="#ffffff"
                        strokeWidth={2.5}
                        className="drop-shadow-sm"
                      />
                    )}
                  </span>
                  <span
                    className={`whitespace-nowrap transition-all duration-500 ease-out ${
                      isOpen
                        ? "opacity-0 translate-x-6 pointer-events-none"
                        : "opacity-100 translate-x-0"
                    } ${
                      loadingKey === "logout" ? "text-white/80" : "text-white"
                    }`}>
                    {loadingKey === "logout" ? "Logging out..." : "Logout"}
                  </span>
                </span>
              </button>

              {/* Hover indicator */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
            </li>
          </ul>
        </nav>
      ) : (
        <div className="sticky h-fit top-0 w-full z-50">
          {/* Mobile Header */}
          <div className="bg-primary/90 glass-effect h-16 flex items-center justify-between px-6 shadow-lg border-b border-white/10">
            <div
              ref={mobileLogoContainerRef}
              className="overflow-hidden flex-1 mr-4">
              <span
                ref={mobileLogoRef}
                className={`font-['Pacifico'] text-2xl text-white inline-block whitespace-nowrap ${
                  mobileLogoOverflow ? "animate-scroll" : ""
                }`}>
                {logo}
              </span>
            </div>
            <button
              className="p-3 hover:bg-white/20 active:bg-white/30 rounded-xl transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg"
              onClick={() => setIsOpen(!isOpen)}>
              <Menu
                size={28}
                color="#ffffff"
                strokeWidth={2.5}
                className="drop-shadow-sm"
              />
            </button>
          </div>

          {/* Mobile Overlay */}
          <div
            className={`fixed inset-0 bg-black/60 glass-effect transition-all duration-400 z-40 ${
              isOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile Navigation */}
          <nav
            className={`fixed left-0 top-0 h-[100dvh] bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 w-64 p-6 transition-all duration-400 ease-out z-50 shadow-2xl border-r border-white/10 ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
            <ul className="h-full flex flex-col">
              {/* Mobile Logo */}
              <li className="mb-8 font-['Pacifico'] text-2xl text-white pb-4 border-b border-white/20">
                <div className="overflow-hidden">
                  <span className="inline-block whitespace-nowrap">{logo}</span>
                </div>
              </li>

              {/* Mobile Links */}
              <div className="flex-1 space-y-3">
                {links.map((l, index) => (
                  <li
                    key={l.key}
                    className={`hover:bg-white/15 rounded-2xl transition-all duration-300 animate-fadeInUp hover:shadow-md ${
                      isActiveLink(l.href, current)
                        ? "bg-white/20 shadow-lg"
                        : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}>
                    <Link
                      href={l.href}
                      onClick={() => {
                        handleLinkClick(l.key);
                        closeMobileMenu();
                      }}
                      className="block">
                      <span className="flex items-center gap-4 text-lg font-semibold text-white font-[lato] p-4">
                        <span
                          className={`flex items-center justify-center min-w-[28px] transition-all duration-300 ${
                            loadingKey === l.key ? "animate-pulse-subtle" : ""
                          }`}>
                          {loadingKey === l.key ? (
                            <Spinner />
                          ) : (
                            <span className="drop-shadow-sm">{l.icon}</span>
                          )}
                        </span>
                        <span
                          className={
                            loadingKey === l.key
                              ? "text-white/80"
                              : "text-white"
                          }>
                          {l.name}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </div>

              {/* Mobile Logout */}
              <li className="mt-6 hover:bg-red-500/90 rounded-2xl transition-all duration-300 bg-red-500/70 shadow-lg hover:shadow-xl">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full text-left disabled:opacity-50 transition-opacity duration-300"
                  disabled={loadingKey === "logout"}>
                  <span className="flex items-center gap-4 text-lg font-semibold text-white font-[lato] p-4">
                    <span
                      className={`flex items-center justify-center min-w-[28px] transition-all duration-300 ${
                        loadingKey === "logout" ? "animate-pulse-subtle" : ""
                      }`}>
                      {loadingKey === "logout" ? (
                        <Spinner />
                      ) : (
                        <LogOut
                          size={24}
                          color="#ffffff"
                          strokeWidth={2.5}
                          className="drop-shadow-sm"
                        />
                      )}
                    </span>
                    <span
                      className={
                        loadingKey === "logout" ? "text-white/80" : "text-white"
                      }>
                      {loadingKey === "logout" ? "Logging out..." : "Logout"}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

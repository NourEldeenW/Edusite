"use client";
import { useState, useEffect } from "react";
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
}

const api = process.env.NEXT_PUBLIC_localurl;

export default function Navbar({ links }: NavbarProps) {
  const current = usePathname();
  const [wid, setWid] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

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

  // Simple spinner
  const Spinner = () => (
    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
  );

  return (
    <>
      {!isMobile ? (
        <nav
          className={`sticky h-[100dvh] bg-gradient-to-b from-primary to-indigo-700 p-6 top-0 self-start overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "w-24" : "w-64"
          } shadow-xl`}>
          <ul className="h-full flex flex-col">
            <li className="mb-8 font-['Pacifico'] text-2xl text-white flex justify-between flex-row-reverse overflow-hidden">
              <span
                className={`hover:bg-white/15 p-2 rounded-full flex items-center active:scale-95 ml-4 cursor-pointer transition-all ${
                  isOpen ? "-rotate-90" : "rotate-0"
                }`}
                onClick={() => setIsOpen(!isOpen)}>
                <Menu size={30} color="#ffff" strokeWidth={2} />
              </span>
              <span
                className={`transition-opacity ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}>
                logo
              </span>
            </li>

            <div className="flex-1">
              {links.map((l) => (
                <li
                  key={l.key}
                  className={`group relative mb-4 hover:bg-white/10 rounded-xl transition-all duration-200 ${
                    current === l.href ? "bg-white/15" : ""
                  }`}>
                  <Link
                    href={l.href}
                    className="block"
                    onClick={() => handleLinkClick(l.key)}>
                    <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                      <span className="flex items-center min-w-[30px]">
                        {loadingKey === l.key && l.href !== current ? (
                          <Spinner />
                        ) : (
                          l.icon
                        )}
                      </span>
                      <span
                        className={`whitespace-nowrap transition-all duration-200 ${
                          isOpen
                            ? "opacity-0 translate-x-4"
                            : "opacity-100 translate-x-0"
                        }`}>
                        {loadingKey === l.key ? (
                          <span className="text-white/70">{l.name}</span>
                        ) : (
                          l.name
                        )}
                      </span>
                    </span>
                  </Link>
                  <div className="absolute left-0 bottom-0 h-[2px] bg-white/30 w-0 group-hover:w-full transition-all duration-300" />
                </li>
              ))}
            </div>

            <li className="mt-auto group relative mb-4 hover:bg-error/80 rounded-xl transition-all duration-200 bg-error/70">
              <button
                onClick={handleLogout}
                className="w-full text-left disabled:opacity-60"
                disabled={loadingKey === "logout"}>
                <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                  <span className="flex items-center min-w-[30px]">
                    {loadingKey === "logout" ? (
                      <Spinner />
                    ) : (
                      <LogOut size={22} color="#ffff" strokeWidth={2} />
                    )}
                  </span>
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${
                      isOpen
                        ? "opacity-0 translate-x-4"
                        : "opacity-100 translate-x-0"
                    }`}>
                    {loadingKey === "logout" ? (
                      <span className="text-white/70">Logging out...</span>
                    ) : (
                      "Logout"
                    )}
                  </span>
                </span>
              </button>
              <div className="absolute left-0 bottom-0 h-[2px] bg-white/30 w-0 group-hover:w-full transition-all duration-300" />
            </li>
          </ul>
        </nav>
      ) : (
        <div className="sticky h-fit top-0 w-full z-50">
          <div className="bg-primary/95 backdrop-blur-sm h-16 flex items-center justify-between px-4">
            <span className="font-['Pacifico'] text-2xl text-white">logo</span>
            <button
              className="p-2 hover:bg-white/15 rounded-full transition-all active:scale-95"
              onClick={() => setIsOpen(!isOpen)}>
              <Menu size={30} color="#ffff" strokeWidth={2} />
            </button>
          </div>

          <div
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
              isOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={() => setIsOpen(false)}
          />

          <nav
            className={`fixed left-0 top-0 h-[100dvh] bg-gradient-to-b from-primary to-indigo-700 w-64 p-6 transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
            <ul className="h-full flex flex-col">
              {links.map((l) => (
                <li
                  key={l.key}
                  className={`mb-4 hover:bg-white/10 rounded-xl transition-all ${
                    current === l.href ? "bg-white/15" : ""
                  }`}>
                  <Link
                    href={l.href}
                    onClick={() => {
                      handleLinkClick(l.key); // Add loading state
                      closeMobileMenu();
                    }}
                    className="block">
                    <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                      <span className="flex items-center min-w-[30px]">
                        {loadingKey === l.key ? <Spinner /> : l.icon}
                      </span>
                      <span>
                        {loadingKey === l.key ? (
                          <span className="text-white/70">{l.name}</span>
                        ) : (
                          l.name
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}

              <li className="mt-auto mb-4 hover:bg-error/80 rounded-xl transition-all duration-200 bg-error/70">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full text-left disabled:opacity-60"
                  disabled={loadingKey === "logout"}>
                  <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                    <span className="flex items-center min-w-[30px]">
                      {loadingKey === "logout" ? (
                        <Spinner />
                      ) : (
                        <LogOut size={22} color="#ffff" strokeWidth={2} />
                      )}
                    </span>
                    <span>
                      {loadingKey === "logout" ? (
                        <span className="text-white/70">Logging out...</span>
                      ) : (
                        "Logout"
                      )}
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

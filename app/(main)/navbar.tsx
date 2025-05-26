"use client";
import { Menu, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [isopen, setIsopen] = useState(false);
  const [wid, setWid] = useState<number | null>(null);
  const current = usePathname();

  useEffect(() => {
    setWid(window.innerWidth);
    const onResize = () => setWid(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (wid === null) return null;

  const sm = wid > 640;

  return (
    <>
      {sm ? (
        <nav
          className={`sticky h-[100dvh] bg-gradient-to-b from-primary to-indigo-700 p-6 top-0 self-start overflow-hidden transition-all duration-300 ease-out ${
            isopen ? "w-24" : "w-64"
          }`}>
          <ul className="h-full flex flex-col">
            <li className="mb-8 font-['Pacifico'] text-2xl text-white flex justify-between flex-row-reverse overflow-hidden">
              <span
                className={`hover:bg-white/15 p-2 rounded-full flex items-center active:scale-95 ml-4 cursor-pointer transition-all ${
                  isopen ? "-rotate-90" : "rotate-0"
                }`}
                onClick={() => setIsopen(!isopen)}>
                <Menu size={30} color="#ffff" strokeWidth={2} />
              </span>
              <span
                className={`transition-opacity ${
                  isopen ? "opacity-0" : "opacity-100"
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
                  <a href={l.href} className="block">
                    <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                      <span className="flex items-center min-w-[30px]">
                        {l.icon}
                      </span>
                      <span
                        className={`whitespace-nowrap transition-all duration-200 ${
                          isopen
                            ? "opacity-0 translate-x-4"
                            : "opacity-100 translate-x-0"
                        }`}>
                        {l.name}
                      </span>
                    </span>
                  </a>
                  <div className="absolute left-0 bottom-0 h-[2px] bg-white/30 w-0 group-hover:w-full transition-all duration-300" />
                </li>
              ))}
            </div>

            {/* Logout Button - Desktop */}
            <li className="mt-auto group relative mb-4 hover:bg-error/80 rounded-xl transition-all duration-200 bg-error/70">
              <a
                href="/login"
                className="w-full block"
                onClick={async () => await fetch(`${api}logout`)}>
                <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                  <span className="flex items-center min-w-[30px]">
                    <span>
                      <LogOut />
                    </span>
                  </span>
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${
                      isopen
                        ? "opacity-0 translate-x-4"
                        : "opacity-100 translate-x-0"
                    }`}>
                    Logout
                  </span>
                </span>
              </a>
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
              onClick={() => setIsopen(!isopen)}>
              <Menu size={30} color="#ffff" strokeWidth={2} />
            </button>
          </div>

          {/* Mobile menu overlay */}
          <div
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
              isopen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={() => setIsopen(false)}
          />

          {/* Mobile menu content */}
          <nav
            className={`fixed left-0 top-0 h-[100dvh] bg-gradient-to-b from-primary to-indigo-700 w-64 p-6 transition-transform duration-300 ease-out ${
              isopen ? "translate-x-0" : "-translate-x-full"
            }`}>
            <ul className="h-full flex flex-col">
              {links.map((l) => (
                <li
                  key={l.key}
                  className={`mb-4 hover:bg-white/10 rounded-xl transition-all ${
                    current === l.href ? "bg-white/15" : ""
                  }`}>
                  <a href={l.href} className="block">
                    <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                      <span className="flex items-center min-w-[30px]">
                        {l.icon}
                      </span>
                      <span>{l.name}</span>
                    </span>
                  </a>
                </li>
              ))}

              {/* Logout Button - Mobile */}
              <li className="mt-auto mb-4 hover:bg-error/80 rounded-xl transition-all duration-200 bg-error/70">
                <a
                  href="/login"
                  className="w-full block"
                  onClick={async () => await fetch(`${api}logout`)}>
                  <span className="flex gap-3 text-lg font-semibold text-white font-[lato] p-3">
                    <span className="flex items-center min-w-[30px]">
                      <span>
                        <LogOut />
                      </span>
                    </span>
                    <span>LogOut</span>
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

"use client";
import { Menu } from "lucide-react";
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

export default function Navbar({ links }: NavbarProps) {
  const [isopen, setIsopen] = useState(false);
  const [wid, setWid] = useState(0);
  const current = usePathname();
  useEffect(() => {
    setWid(window.innerWidth);
  }, []);

  const sm = wid > 640;
  return (
    <>
      {sm ? (
        <nav
          className={` sticky h-[100dvh] bg-gradient-to-b from-primary to-indigo-700 p-6 top-0 self-start overflow-hidden  transition-[width] duration-300 ease-in-out ${
            isopen ? "w-[93px]" : "w-[250px]"
          }`}>
          <ul>
            <li className="mb-5 font-['Pacifico'] text-2xl text-white flex justify-between flex-row-reverse overflow-hidden">
              <span
                className={`hover:bg-white/15 p-2 rounded-full items-center flex active:scale-95 ml-[30px] transition-transform duration-300 ease-in-out ${
                  isopen ? "-rotate-90" : ""
                }`}
                onClick={() => setIsopen(!isopen)}>
                <Menu size={30} color="#ffff" strokeWidth={2} />
              </span>
              <span>logo</span>
            </li>
            {links.map((l) => {
              return (
                <li
                  key={l.key}
                  className={` mb-5 p-3 hover:bg-white/10 items-center justify-center rounded-lg active:bg-white/20 ${
                    current === l.href ? "bg-white/15" : ""
                  }`}>
                  <a href={l.href}>
                    <span className="flex gap-2 text-[20px] font-simibold text-white font-[lato] overflow-hidden">
                      <span className=" flex items-center">{l.icon}</span>
                      <span className="text-nowrap">{l.name}</span>
                    </span>
                  </a>
                </li>
              );
            })}
            <li></li>
          </ul>
        </nav>
      ) : (
        <div className="fixed top-0 self-start overflow-hidden h-fit w-fit flex">
          <nav
            className={`bg-gradient-to-b from-primary to-indigo-700  h-[100dvh] transition-[width_all] duration-300 ${
              isopen ? "w-0 p-0" : " w-[250px] p-6 "
            }`}>
            <ul>
              <li className="mb-5 font-['Pacifico'] text-2xl text-white flex justify-center flex-row-reverse overflow-hidden">
                <span>logo</span>
              </li>
              {links.map((l) => {
                return (
                  <li
                    key={l.key}
                    className={` mb-5 p-3 hover:bg-white/10 items-center justify-center rounded-lg active:bg-white/20 ${
                      current === l.href ? "bg-white/15" : ""
                    }`}>
                    <a href={l.href}>
                      <span className="flex gap-2 text-[20px] font-simibold text-white font-[lato] overflow-hidden">
                        <span className=" flex items-center">{l.icon}</span>
                        <span className="text-nowrap">{l.name}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="bg-primary size-14 rounded-full content-center justify-items-center m-4">
            <span
              className="hover:bg-white/15 rounded-full items-center flex active:scale-95 w-full h-full justify-center"
              onClick={() => setIsopen(!isopen)}>
              <Menu size={30} color="#ffff" strokeWidth={2} />
            </span>
          </div>
        </div>
      )}
    </>
  );
}

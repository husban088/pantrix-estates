import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const doLogout = () => {
    logout();
    setOpen(false);
    nav("/");
  };
  const initial = user ? user.name.trim().charAt(0).toUpperCase() || "U" : "";

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-all duration-300 ${scrolled ? "border-b border-pine-100 shadow-soft" : "border-b border-transparent"}`}
    >
      <div className="container-x flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `link-line text-sm font-semibold transition-colors ${isActive ? "text-pine-700 after:scale-x-100" : "text-muted hover:text-pine-700"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/dashboard" className="btn-outline">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-pine-200 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-pine-700 transition hover:border-brass-500"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-pine-700 text-xs font-bold text-brass-300">
                  {initial}
                </span>
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={doLogout}
                aria-label="Logout"
                title="Logout"
                className="grid h-10 w-10 place-items-center rounded-full border border-pine-200 text-muted transition hover:border-red-500 hover:text-red-600"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="link-line text-sm font-semibold text-pine-700"
              >
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-pine-200 text-pine-700 transition hover:border-brass-500 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-pine-100 bg-white md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-base font-semibold transition ${isActive ? "bg-pine-50 text-pine-700" : "text-muted hover:bg-pine-50"}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="btn-outline mt-2"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="btn-primary mt-1"
                  >
                    My profile
                  </Link>
                  <button
                    onClick={doLogout}
                    className="btn mt-1 text-muted hover:bg-pine-50 hover:text-red-600"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-outline"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-primary"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

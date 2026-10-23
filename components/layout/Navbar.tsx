"use client";
import { useCommunity } from "@/components/servers/Community";

import { CommunityLink as Link } from "@/components/servers/Community";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import {
  Leaf,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { DiscordIcon } from "@/components/icons/brands";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { navLinks, site as defaults } from "@/config/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const community = useCommunity();
  const site = {
    ...defaults,
    name: community.name,
    discordInvite: community.inviteUrl || "/servers",
  };
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const initials = (user?.name ?? "U").slice(0, 2).toUpperCase();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <Container>
        <nav
          className={cn(
            "flex items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-300",
            scrolled ? "glass shadow-soft" : "bg-transparent",
          )}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-grad text-white shadow-soft">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-forest-950">
              {site.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-forest-50 text-forest-800"
                      : "text-ink-soft hover:bg-forest-50 hover:text-forest-800",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <a
                href="/servers"
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50 md:inline-flex"
              >
                My servers
              </a>
            )}
            <a
              href={site.discordInvite}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full p-2.5 text-forest-600 transition-colors hover:bg-forest-50 sm:inline-flex"
              aria-label="Join our Discord"
            >
              <DiscordIcon className="h-5 w-5" />
            </a>

            {status === "loading" ? (
              <span
                role="status"
                aria-label="Loading account"
                className="h-9 w-24 animate-pulse rounded-full bg-forest-100"
              />
            ) : user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 rounded-full border border-forest-100 bg-white/70 py-1 pl-1 pr-3 transition-colors hover:bg-white"
                >
                  <Avatar image={user.image} initials={initials} />
                  <span className="max-w-[9rem] truncate text-sm font-medium text-forest-900">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-forest-400 transition-transform",
                      menuOpen && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <button
                        aria-hidden
                        tabIndex={-1}
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-forest-100 bg-white p-1.5 shadow-card"
                      >
                        {user.isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-forest-800 hover:bg-forest-50"
                          >
                            <ShieldCheck className="h-4 w-4 text-forest-500" />{" "}
                            Admin dashboard
                          </Link>
                        )}
                        <Link
                          href="/shop"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-forest-800 hover:bg-forest-50"
                        >
                          <Leaf className="h-4 w-4 text-forest-500" /> Browse
                          plans
                        </Link>
                        <button
                          type="button"
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                href="/login"
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
              >
                <LogIn className="h-4 w-4" /> Login
              </Button>
            )}

            <Button
              href="/shop"
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
            >
              Get Perks
            </Button>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full glass text-forest-800 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden rounded-3xl glass p-3 shadow-card md:hidden"
            >
              <div className="flex flex-col">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-forest-800 hover:bg-white/60"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="mt-2 flex flex-col gap-2 border-t border-forest-100 pt-3">
                {status === "loading" ? (
                  <span
                    role="status"
                    aria-label="Loading account"
                    className="h-9 w-24 animate-pulse rounded-full bg-forest-100"
                  />
                ) : user ? (
                  <>
                    <a
                      href="/servers"
                      className="rounded-2xl px-4 py-3 font-semibold text-forest-800 hover:bg-white/60"
                    >
                      My servers
                    </a>
                    <div className="flex items-center gap-2 px-2">
                      <Avatar image={user.image} initials={initials} />
                      <span className="text-sm font-medium text-forest-900">
                        {user.name}
                      </span>
                    </div>
                    {user.isAdmin && (
                      <Button
                        href="/admin"
                        variant="outline"
                        className="w-full"
                      >
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </Button>
                    )}
                    <Button href="/shop" variant="primary" className="w-full">
                      Get Perks
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="outline" className="w-full">
                      <LogIn className="h-4 w-4" /> Login
                    </Button>
                    <Button href="/shop" variant="primary" className="w-full">
                      Get Perks
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
}

function Avatar({
  image,
  initials,
}: {
  image?: string | null;
  initials: string;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-forest-grad text-xs font-bold text-white">
      {initials}
    </span>
  );
}

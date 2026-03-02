"use client";

import {
  Home,
  User,
  FileText,
  ComponentIcon as ImageIconComponent,
  Activity,
  Menu,
  Settings,
  HelpCircle,
  Smartphone,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface ConnectedDevice {
  userId: string;
  provider: string;
  active: boolean;
}

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch("/api/terra/users");
        const data = await res.json();
        const users = data.users || [];
        setDevices(
          users.map((u: any) => ({
            userId: u.user_id,
            provider: u.provider,
            active: u.active,
          })),
        );
      } catch {
        // Silently fail – sidebar should still render
      }
    }
    fetchDevices();
  }, []);

  function handleNavigation() {
    setIsMobileMenuOpen(false);
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: LucideIcon;
    children: React.ReactNode;
  }) {
    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-background shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-background transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-border
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          <Link
            href="/dashboard"
            className="h-16 px-6 flex items-center border-b border-border"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold hover:cursor-pointer text-foreground">
                Connected Athletes
              </span>
            </div>
          </Link>
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-1">
              <NavItem href="/dashboard" icon={Home}>
                Dashboard
              </NavItem>
              <NavItem href="/profile" icon={User}>
                Profile
              </NavItem>
              <NavItem href="/documents" icon={FileText}>
                Documents
              </NavItem>
              <NavItem href="/gallery" icon={ImageIconComponent}>
                Gallery
              </NavItem>
              <NavItem href="/sensors" icon={Activity}>
                Sensors
              </NavItem>
            </div>

            {/* Connected Devices Section */}
            {devices.length > 0 && (
              <div className="mt-6">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Connected Devices
                </p>
                <div className="space-y-1">
                  {devices.map((d) => (
                    <Link
                      key={d.userId}
                      href={`/dashboard/device/${d.userId}`}
                      onClick={handleNavigation}
                      className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <Smartphone className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="flex items-center gap-2">
                        {d.provider}
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${d.active ? "bg-green-500" : "bg-red-500"}`}
                        />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-4 border-t border-border">
            <div className="space-y-1">
              <NavItem href="/dashboard" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="/dashboard" icon={HelpCircle}>
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

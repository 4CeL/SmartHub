"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Home,
  Video,
  Music2,
  Zap,
  Wrench,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { tools } from "../lib/tools";

export default function Sidebar() {
  const pathname = usePathname();

  const availableTools = tools.filter(
    (tool) => tool.available
  );

  const menuGroups = [
    {
      title: "General",
      items: [
        {
          name: "Dashboard",
          href: "/",
          icon: Home,
        },
      ],
    },

    {
      title: "Automation",
      items: availableTools.filter(
        (tool) => tool.category === "Automation"
      ),
    },

    {
      title: "Tools",
      items: availableTools.filter(
        (tool) => tool.category === "Tools"
      ),
    },

    {
      title: "Utilities",
      items: availableTools.filter(
        (tool) => tool.category === "Utilities"
      ),
    },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">

      {/* ======================================================
          LOGO
      ====================================================== */}

      <div className="border-b border-gray-100 px-5 py-5">

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          {/* LOGO ICON */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">

            <Sparkles className="h-5 w-5 text-white" />

          </div>

          {/* APP NAME */}

          <div className="min-w-0">

            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              Smart<span className="text-blue-600">Hub</span>
            </h1>

            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Everyday Tools
            </p>

          </div>

        </Link>

      </div>

      {/* ======================================================
          MENU
      ====================================================== */}

      <nav className="flex-1 overflow-y-auto px-4 py-5">

        {menuGroups.map((group) => {

          // Jangan tampilkan category kalau tidak memiliki menu
          if (group.items.length === 0) {
            return null;
          }

          return (
            <div
              key={group.title}
              className="mb-6 last:mb-0"
            >

              {/* CATEGORY TITLE */}

              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {group.title}
              </p>

              {/* MENU ITEMS */}

              <div className="space-y-1">

                {group.items.map((item) => {

                  const active = isActive(item.href);

                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-gray-900 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >

                      {/* ICON */}

                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          active
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-700"
                        }`}
                        strokeWidth={2}
                      />

                      {/* NAME */}

                      <span className="flex-1 truncate">
                        {item.name}
                      </span>

                      {/* ACTIVE ARROW */}

                      {active && (
                        <ChevronRight
                          className="h-4 w-4 text-gray-400"
                          strokeWidth={2}
                        />
                      )}

                    </Link>
                  );
                })}

              </div>

            </div>
          );
        })}

      </nav>

      {/* ======================================================
          BOTTOM
      ====================================================== */}

      <div className="border-t border-gray-100 p-4">

        {/* SETTINGS */}

        <Link
          href="/settings"
          className={`mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive("/settings")
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >

          <Settings
            className="h-[18px] w-[18px]"
            strokeWidth={2}
          />

          <span>Settings</span>

        </Link>

        {/* VERSION CARD */}

        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">

          <div className="flex items-center justify-between">

            <p className="text-xs font-semibold text-gray-700">
              SmartHub
            </p>

            <span className="rounded-md bg-white px-2 py-1 text-[9px] font-medium text-gray-400 shadow-sm">
              v1.0
            </span>

          </div>

          <p className="mt-1 text-[10px] text-gray-400">
            Your everyday productivity hub
          </p>

        </div>

      </div>

    </aside>
  );
}
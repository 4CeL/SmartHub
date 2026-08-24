"use client";

import {
  Bell,
  Check,
  Info,
  Mail,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [emailNotification, setEmailNotification] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-neutral-950 transition-colors">
      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
              <SettingsIcon className="h-5 w-5 text-white dark:text-gray-900" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kelola pengaturan SmartHub.
              </p>
            </div>

          </div>

        </div>

        {/* ==================================================
            GENERAL
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">

          <div className="border-b border-gray-100 px-6 py-5 dark:border-neutral-800">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Appearance & General
                </h2>

                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Pengaturan umum dan tampilan aplikasi.
                </p>
              </div>

            </div>

          </div>

          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {/* THEME */}
            <div className="px-6 py-5">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                Theme Preference
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all ${
                    theme === "light"
                      ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800">
                    <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Light Mode
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Tampilan terang
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all ${
                    theme === "dark"
                      ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 dark:bg-black">
                    <Moon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Dark Mode
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Tampilan gelap
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all ${
                    theme === "system"
                      ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800">
                    <Monitor className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      System
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Sesuai perangkat
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* APP NAME */}
            <div className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Application Name
                </p>

                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Nama aplikasi yang digunakan.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300">
                SmartHub
              </div>
            </div>

            {/* VERSION */}
            <div className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Version
                </p>

                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Versi aplikasi SmartHub.
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
                v1.0
              </span>
            </div>
          </div>

        </section>

        {/* ==================================================
            NOTIFICATION
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">

          <div className="border-b border-gray-100 px-6 py-5 dark:border-neutral-800">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>

                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Atur notifikasi yang ingin diterima.
                </p>
              </div>

            </div>

          </div>

          <div className="px-6 py-5">

            <div className="flex items-center justify-between gap-6">

              <div className="flex items-start gap-3">

                <div className="mt-0.5">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Email Notification
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-gray-500">
                    Aktifkan notifikasi email untuk aktivitas
                    tertentu di SmartHub.
                  </p>
                </div>

              </div>

              {/* TOGGLE */}

              <button
                type="button"
                onClick={() =>
                  setEmailNotification(
                    !emailNotification
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  emailNotification
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-gray-300 dark:bg-neutral-700"
                }`}
              >

                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    emailNotification
                      ? "left-6"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          </div>

        </section>

        {/* ==================================================
            SECURITY
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">

          <div className="border-b border-gray-100 px-6 py-5 dark:border-neutral-800">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Security
                </h2>

                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Informasi keamanan aplikasi.
                </p>
              </div>

            </div>

          </div>

          <div className="px-6 py-5">

            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-4 dark:border-green-900/50 dark:bg-green-900/10">

              <div className="flex items-start gap-3">

                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />

                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">
                    SmartHub is running normally
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-600 dark:text-green-500">
                    Tidak ada masalah keamanan yang
                    terdeteksi pada konfigurasi aplikasi.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            ABOUT
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">

          <div className="border-b border-gray-100 px-6 py-5 dark:border-neutral-800">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  About SmartHub
                </h2>

                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Informasi mengenai aplikasi.
                </p>
              </div>

            </div>

          </div>

          <div className="px-6 py-5">

            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              SmartHub adalah centralized workspace yang
              menyediakan berbagai tools untuk membantu
              menyelesaikan pekerjaan sehari-hari secara
              lebih cepat dan terorganisir.
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-neutral-800">

              <span className="text-xs text-gray-400 dark:text-gray-500">
                SmartHub · Everyday Tools
              </span>

              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                v1.0
              </span>

            </div>

          </div>

        </section>

        {/* ==================================================
            SAVE
        ================================================== */}

        <div className="flex items-center justify-end gap-3">

          {saveSuccess && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">

              <Check className="h-4 w-4" />

              Pengaturan berhasil disimpan

            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Save Changes
          </button>

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="py-8 text-center">

          <p className="text-xs text-gray-400">
            SmartHub · Everyday Tools
          </p>

        </div>

      </div>
    </main>
  );
}
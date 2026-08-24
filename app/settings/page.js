"use client";

import {
  Bell,
  Check,
  Info,
  Mail,
  Palette,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [emailNotification, setEmailNotification] =
    useState(true);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Kelola pengaturan SmartHub.
              </p>
            </div>

          </div>

        </div>

        {/* ==================================================
            GENERAL
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Palette className="h-4 w-4 text-blue-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  General
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Pengaturan umum aplikasi.
                </p>
              </div>

            </div>

          </div>

          <div className="divide-y divide-gray-100">

            {/* APP NAME */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Application Name
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Nama aplikasi yang digunakan.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700">
                SmartHub
              </div>

            </div>

            {/* VERSION */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Version
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Versi aplikasi SmartHub.
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                v1.0
              </span>

            </div>

          </div>

        </section>

        {/* ==================================================
            NOTIFICATION
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Notifications
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Atur notifikasi yang ingin diterima.
                </p>
              </div>

            </div>

          </div>

          <div className="px-6 py-5">

            <div className="flex items-center justify-between gap-6">

              <div className="flex items-start gap-3">

                <div className="mt-0.5">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Email Notification
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
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
                    ? "bg-blue-600"
                    : "bg-gray-300"
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

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Security
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Informasi keamanan aplikasi.
                </p>
              </div>

            </div>

          </div>

          <div className="px-6 py-5">

            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-4">

              <div className="flex items-start gap-3">

                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

                <div>
                  <p className="text-sm font-medium text-green-800">
                    SmartHub is running normally
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-600">
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

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Info className="h-4 w-4 text-purple-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  About SmartHub
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Informasi mengenai aplikasi.
                </p>
              </div>

            </div>

          </div>

          <div className="px-6 py-5">

            <p className="text-sm leading-6 text-gray-600">
              SmartHub adalah centralized workspace yang
              menyediakan berbagai tools untuk membantu
              menyelesaikan pekerjaan sehari-hari secara
              lebih cepat dan terorganisir.
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

              <span className="text-xs text-gray-400">
                SmartHub · Everyday Tools
              </span>

              <span className="text-xs font-medium text-gray-500">
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
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">

              <Check className="h-4 w-4" />

              Pengaturan berhasil disimpan

            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98]"
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
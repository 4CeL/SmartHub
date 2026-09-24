"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Video,
  Music,
  Users,
  Mic,
  Clock,
  MapPin,
  Sparkles,
  Info
} from "lucide-react";
import Link from "next/link";

const N8N_GET_JADWAL_URL =
  "http://localhost:5678/webhook/get-multimedia-schedule";

// Helper untuk format tanggal
function formatFullDate(dateStr) {
  if (!dateStr) return "-";
  const monthMap = {
    sep: "September",
    oct: "Oktober",
    nov: "November",
    dec: "Desember",
    jan: "Januari",
    feb: "Februari",
    mar: "Maret",
    apr: "April",
    may: "Mei",
    jun: "Juni",
    jul: "Juli",
    aug: "Agustus",
  };
  const parts = dateStr.trim().split(" ");
  if (parts.length >= 2) {
    const day = parts[0];
    const monthKey = parts[1].toLowerCase();
    const fullMonth = monthMap[monthKey] || parts[1];
    return `${day} ${fullMonth} 2026`;
  }
  return dateStr;
}

function DetailJadwalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id"); // index in array

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(N8N_GET_JADWAL_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data: HTTP ${response.status}`);
        }

        let data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }

        let schedulesList = [];
        if (data.schedules && Array.isArray(data.schedules)) {
          schedulesList = data.schedules;
        } else if (data.json && Array.isArray(data.json.schedules)) {
          schedulesList = data.json.schedules;
        } else {
          throw new Error(data.message || "Format data dari n8n tidak sesuai.");
        }

        const idx = parseInt(id, 10);
        if (!isNaN(idx) && idx >= 0 && idx < schedulesList.length) {
          setSchedule(schedulesList[idx]);
        } else {
          setError("Jadwal tidak ditemukan.");
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Gagal terhubung ke server n8n."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-neutral-800" />
          <div className="h-48 w-full rounded-2xl bg-gray-200 dark:bg-neutral-800" />
          <div className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-neutral-800" />
        </div>
      </main>
    );
  }

  if (error || !schedule) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Oops, Ada Kesalahan
            </h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
              {error || "Jadwal tidak ditemukan."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 px-6 py-8 transition-colors dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Navigasi Kembali */}
        <div className="mb-8">
          <Link
            href="/multimedia"
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 shadow-sm transition-all hover:scale-105 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Jadwal
          </Link>
        </div>

        {/* ==================================================
            HEADER BANNER
        ================================================== */}
        <section className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-gray-950 p-8 shadow-2xl md:p-12">
          {/* Animated Background Gradients */}
          <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-color-dodge">
            <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] animate-[spin_20s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.3)_360deg)]" />
            <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] animate-[spin_15s_linear_infinite_reverse] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(139,92,246,0.3)_360deg)]" />
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-blue-500/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-64 w-64 animate-pulse rounded-full bg-violet-500/20 blur-[80px] delay-1000" />
          
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-300 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>SUNDAY SERVICE</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {formatFullDate(schedule.date)}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">
                  Tema: {schedule.generalSchedule?.temaMingguan || "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:text-right">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10 md:justify-end">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="font-semibold text-white">09:00 WIB</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10 md:justify-end">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="font-semibold text-white">GBI Rosypinna</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            KONTEN DETAIL (GRID)
        ================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Card: Tim Multimedia & Sound */}
          <section className="group relative overflow-hidden rounded-[2rem] border border-gray-200/60 bg-white/70 p-8 shadow-xl shadow-gray-200/30 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-900/10" />
            
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tim Multimedia</h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Broadcasting & Sound System</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "Kamera", value: schedule.multimedia?.kamera },
                  { label: "Video Switcher", value: schedule.multimedia?.videoSwitcher },
                  { label: "Operator LCD", value: schedule.multimedia?.lcd },
                  { label: "Youtube Streaming", value: schedule.multimedia?.youtube },
                  { label: "Soundman", value: schedule.multimedia?.soundman },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-transparent bg-gray-50/40 px-4 py-3 transition-all hover:border-blue-100 hover:bg-white hover:shadow-sm dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white text-right">{item.value || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Card: Pelayan Mimbar & Pemusik */}
          <section className="group relative overflow-hidden rounded-[2rem] border border-gray-200/60 bg-white/70 p-8 shadow-xl shadow-gray-200/30 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/10 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-bl from-violet-50/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-violet-900/10" />
            
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                  <Music className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pelayan Mimbar</h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">WL, Singers & Pemusik</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "Worship Leader", value: schedule.generalSchedule?.wl },
                  { label: "Singers", value: [schedule.generalSchedule?.singer1, schedule.generalSchedule?.singer2, schedule.generalSchedule?.singer3].filter(s => s && s !== "-").join(", ") },
                  { label: "Keyboard", value: [schedule.generalSchedule?.keyboardist1, schedule.generalSchedule?.keyboardist2].filter(s => s && s !== "-").join(", ") },
                  { label: "Drum", value: schedule.generalSchedule?.drummer },
                  { label: "Bass", value: schedule.generalSchedule?.bassist },
                  { label: "Gitar", value: schedule.generalSchedule?.guitarist },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-transparent bg-gray-50/40 px-4 py-3 transition-all hover:border-violet-100 hover:bg-white hover:shadow-sm dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white text-right max-w-[60%] truncate">{item.value || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Card: Usher dll */}
          <section className="group relative overflow-hidden rounded-[2rem] border border-gray-200/60 bg-white/70 p-8 shadow-xl shadow-gray-200/30 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/10 lg:col-span-2 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-emerald-900/10" />
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pelayanan Lainnya</h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Penyambut Jemaat & Kolektan</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Usher 1", value: schedule.generalSchedule?.usher1 },
                  { label: "Usher 2", value: schedule.generalSchedule?.usher2 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-transparent bg-gray-50/40 px-4 py-3 transition-all hover:border-emerald-100 hover:bg-white hover:shadow-sm dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white text-right">{item.value || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}

export default function DetailJadwalPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-neutral-800" />
          <div className="h-48 w-full rounded-2xl bg-gray-200 dark:bg-neutral-800" />
        </div>
      </main>
    }>
      <DetailJadwalContent />
    </Suspense>
  );
}

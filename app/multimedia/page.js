"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Search,
  Video,
  Music,
  Users,
  Mic,
  RefreshCw,
  Sparkles,
  Info,
  Headset,
  ChevronRight,
  Send
} from "lucide-react";
import Link from "next/link";

// ======================================================
// N8N WEBHOOK URL (Endpoint Get All Jadwal)
// ======================================================
const N8N_GET_JADWAL_URL =
  "http://localhost:5678/webhook/get-multimedia-schedule";

// ======================================================
// N8N WEBHOOK URL
// ======================================================
const N8N_WEBHOOK_URL =
  "http://localhost:5678/webhook/multimedia-schedule-sender";

// Helper untuk mengubah singkatan bulan menjadi nama lengkap Indonesia
function formatFullDate(dateStr) {
  if (!dateStr) return "-";

  const monthMap = {
    "sep": "September",
    "oct": "Oktober",
    "nov": "November",
    "dec": "Desember",
    "jan": "Januari",
    "feb": "Februari",
    "mar": "Maret",
    "apr": "April",
    "may": "Mei",
    "jun": "Juni",
    "jul": "Juli",
    "aug": "Agustus"
  };

  // Pisahkan angka tanggal dan singkatan bulan (Contoh: "13 Sep")
  const parts = dateStr.trim().split(" ");
  if (parts.length >= 2) {
    const day = parts[0];
    const monthKey = parts[1].toLowerCase();
    const fullMonth = monthMap[monthKey] || parts[1];
    return `${day} ${fullMonth} 2026`; // Atau `${day} ${fullMonth}`
  }

  return dateStr;
}

export default function ScheduleListPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [sentPayload, setSentPayload] = useState(null);

  // ======================================================
  // FORM STATE
  // ======================================================
  const [serviceDate, setServiceDate] = useState("");
  const [serviceDateRaw, setServiceDateRaw] = useState("");

  const [rehearsalDate, setRehearsalDate] = useState("");
  const [rehearsalDateRaw, setRehearsalDateRaw] = useState("");

  const [rehearsalTime, setRehearsalTime] = useState("");
  const [rehearsalTimeRaw, setRehearsalTimeRaw] = useState("");

  // ======================================================
  // QUICK PRESETS
  // ======================================================
  const quickTimePresets = ["08.00", "08.30", "09.00", "09.30", "10.00"];

  // ======================================================
  // AUTO-FORMAT SERVICE DATE (13 September 2026)
  // ======================================================
  const handleServiceDateChange = (rawDate) => {
    setServiceDateRaw(rawDate);
    if (!rawDate) {
      setServiceDate("");
      return;
    }

    const [year, month, day] = rawDate.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    const formatted = `${parseInt(day, 10)} ${INDONESIAN_MONTHS[monthIndex]} ${year}`;
    setServiceDate(formatted);
  };

  // ======================================================
  // AUTO-FORMAT REHEARSAL DATE (Sabtu, 12 September)
  // ======================================================
  const handleRehearsalDateChange = (rawDate) => {
    setRehearsalDateRaw(rawDate);
    if (!rawDate) {
      setRehearsalDate("");
      return;
    }

    const [year, month, day] = rawDate.split("-");
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    const dayName = INDONESIAN_DAYS[d.getDay()];
    const monthIndex = parseInt(month, 10) - 1;
    const formatted = `${dayName}, ${parseInt(day, 10)} ${INDONESIAN_MONTHS[monthIndex]}`;
    setRehearsalDate(formatted);
  };

  // ======================================================
  // AUTO-FORMAT REHEARSAL TIME (09.00)
  // ======================================================
  const handleRehearsalTimeChange = (rawTime) => {
    setRehearsalTimeRaw(rawTime);
    if (!rawTime) {
      setRehearsalTime("");
      return;
    }

    const formatted = rawTime.replace(":", ".");
    setRehearsalTime(formatted);
  };

  // ======================================================
  // HELPER NAMA BULAN & HARI
  // ======================================================
  const INDONESIAN_MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const INDONESIAN_DAYS = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  // ======================================================
  // FETCH JADWAL DARI N8N
  // ======================================================
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

        // Jika n8n mengembalikan data dalam array khas n8n [ { ... } ], ambil elemen pertamanya
        if (Array.isArray(data) && data.length > 0) {
        data = data[0];
        }

        // Pengecekan flexible untuk array schedules
        if (data.schedules && Array.isArray(data.schedules)) {
        setSchedules(data.schedules);
        } else if (data.json && Array.isArray(data.json.schedules)) {
        setSchedules(data.json.schedules);
        } else {
        throw new Error(data.message || "Format data dari n8n tidak sesuai.");
        }
    } catch (err) {
        console.error(err);
        setError(
        err instanceof Error
            ? err.message
            : "Gagal terhubung ke server n8n. Pastikan workflow aktif."
        );
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ======================================================
  // OPEN EMAIL MODAL
  // ======================================================

  const openEmailModal = () => {
    setShowEmailModal(true);
  };

  // ======================================================
  // Send Email
  // ======================================================

  const handleSubmit= async () => {
    setError("");
    setMessage("");
    setSuccess(false);

    // Validasi
    if (!serviceDate.trim()) {
      setError("Tanggal Ibadah (serviceDate) wajib diisi.");
      return;
    }

    if (!rehearsalDate.trim()) {
      setError("Tanggal Latihan (rehearsalDate) wajib diisi.");
      return;
    }

    if (!rehearsalTime.trim()) {
      setError("Jam Latihan (rehearsalTime) wajib diisi.");
      return;
    }

    const payload = {
      serviceDate: serviceDate.trim(),
      rehearsalDate: rehearsalDate.trim(),
      rehearsalTime: rehearsalTime.trim(),
    };

    console.log("Mengirim payload ke n8n:", payload);
    setLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `n8n mengembalikan status ${response.status}: ${response.statusText}`
        );
      }

      let data;
      try {
        data = await response.json();
      } catch {
        data = { success: true, message: "Jadwal berhasil dikirim." };
      }

      console.log("Respon dari n8n:", data);

      if (data.success === false) {
        throw new Error(data.message || "Gagal mengirim jadwal multimedia.");
      }

      setSentPayload(payload);
      setSuccess(true);
      setMessage(data.message || "Jadwal petugas multimedia berhasil dikirim ke email!");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat menghubungi server n8n.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FILTERING DATA (Search & Month Filter)
  // ======================================================
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      // Filter Tanggal / Pencarian Nama
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.date.toLowerCase().includes(searchLower) ||
        item.generalSchedule.temaMingguan.toLowerCase().includes(searchLower) ||
        Object.values(item.multimedia).some((val) =>
          val.toLowerCase().includes(searchLower)
        ) ||
        Object.values(item.generalSchedule).some((val) =>
          val.toLowerCase().includes(searchLower)
        );

      // Filter Bulan
      const matchesMonth =
        selectedMonth === "ALL" ||
        item.date.toLowerCase().includes(selectedMonth.toLowerCase());

      return matchesSearch && matchesMonth;
    });
  }, [schedules, searchQuery, selectedMonth]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 transition-colors dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl">
        {/* ==================================================
            HEADER (Mengikuti Style Referensi)
        ================================================== */}
        <section className="relative mb-5 overflow-hidden rounded-2xl bg-gray-900 px-7 py-8 shadow-sm">
          {/* Decorative background blur */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Multimedia Schedule
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  Jadwal petugas ibadah gereja.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <Headset className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            FILTER & SEARCH BAR SECTION
        ================================================== */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                {/* SEARCH BAR - KIRI */}
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500"
                />
                </div>

                {/* BUTTONS & DROPDOWN FILTER - KANAN */}
                <div className="flex flex-wrap items-center gap-3">

                {/* DROPDOWN FILTER BULAN */}
                <div className="relative">
                    <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-sm font-semibold text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-blue-500"
                    >
                    <option value="ALL">Semua Bulan</option>
                    <option value="Jan">Januari</option>
                    <option value="Feb">Februari</option>
                    <option value="Mar">Maret</option>
                    <option value="Apr">April</option>
                    <option value="May">Mei</option>
                    <option value="Jun">Juni</option>
                    <option value="Jul">Juli</option>
                    <option value="Aug">Agustus</option>
                    <option value="Sep">September</option>
                    <option value="Oct">Oktober</option>
                    <option value="Nov">November</option>
                    <option value="Dec">Desember</option>
                    </select>

                    {/* Custom Chevron Icon untuk Select */}
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    </div>
                </div>

                {/* <Link
                    href="/multimedia-schedule"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                    <Send className="h-4 w-4" />
                    Kirim Jadwal
                </Link> */}
                {/* KIRIM KE EMAIL */}
                <button
                  type="button"
                  onClick={openEmailModal}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>

                  Kirim Email
                </button>

                </div>
            </div>
        </div>

        {/* ==================================================
            ERROR BANNER
        ================================================== */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
            <button
              onClick={fetchSchedules}
              className="text-xs font-bold text-red-700 underline dark:text-red-400"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ==================================================
            MAIN CONTENT: SCHEDULE LIST (CARDS)
        ================================================== */}
        {loading ? (
          /* LOADING SPINNER STATE */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-500" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Memuat daftar jadwal...
            </p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              Jadwal tidak ditemukan
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tidak ada jadwal yang cocok dengan kriteria pencarian kamu.
            </p>
          </div>
        ) : (
          /* SCHEDULE GRID CARDS */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredSchedules.map((item, idx) => (
              <article
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  {/* Card Header: Tanggal & Tema */}
                  <div className="flex items-start justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Sunday
                        </span>
                        <h3 className="text-m font-bold text-gray-900 dark:text-white">
                          {formatFullDate(item.date)}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Tema Minggu */}
                  <div className="my-4 rounded-xl bg-gray-100 p-3 dark:bg-neutral-600/50">
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Tema Minggu Ini
                    </span>
                    <p className="ml-2 mt-0.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {item.generalSchedule.temaMingguan}
                    </p>
                  </div>

                  {/* Section 1: Divisi Multimedia */}
                  <div className="mb-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Video className="h-3.5 w-3.5 text-blue-500" />
                      <span>Tim Multimedia & Sound</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2 rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Kamera:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.multimedia.kamera}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Switcher:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.multimedia.videoSwitcher}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">LCD:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.multimedia.lcd}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Youtube:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.multimedia.youtube}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Soundman:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.multimedia.soundman}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Ringkasan Mimbar & Pemusik */}
                  <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Music className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Pelayan Mimbar & Pemusik</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* WL & Pengkhotbah */}
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Worship Leader:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.generalSchedule.wl}
                        </p>
                      </div>

                      {/* Singers */}
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Singer:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {[
                            item.generalSchedule.singer1,
                            item.generalSchedule.singer2,
                            item.generalSchedule.singer3,
                          ]
                            .filter((s) => s && s !== "-")
                            .join(", ") || "-"}
                        </p>
                      </div>

                      {/* Pemusik Details */}
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Keyboardist:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {[
                            item.generalSchedule.keyboardist1, 
                            item.generalSchedule.keyboardist2,
                          ]
                            .filter((s) => s && s !== "-")
                            .join(", ") || "-"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Guitarist:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {[
                            item.generalSchedule.guitarist1,
                            item.generalSchedule.guitarist2
                          ]
                            .filter((s) => s && s !== "-")
                            .join(", ") || "-"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Bassist:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.generalSchedule.bassist}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Drummer:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.generalSchedule.drummer}
                        </p>
                      </div>

                      {/* Doa Syafaat & Usher */}
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Doa Syafaat:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.generalSchedule.doaSyafaat}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-100/70 p-2 dark:bg-neutral-700/50">
                        <span className="ml-2 text-gray-400">Usher:</span>
                        <p className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.generalSchedule.usher1} & {item.generalSchedule.usher2}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-5 pt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-neutral-800">
                  <span>GBI Rosypinna</span>
                  <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                    Detail Jadwal <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        

        {/* ==================================================
            FOOTER
        ================================================== */}
        <div className="py-8 text-center">
          <p className="text-xs text-gray-400">
            SmartHub · Schedule Viewer System
          </p>
        </div>
      </div>
      {/* ======================================================
          EMAIL MODAL
      ====================================================== */}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">

            {/* HEADER */}

            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-neutral-800">

              <div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kirim Jadwal ke Email
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Pilih jadwal petugas yang ingin dikirim melalui email.
                </p>

              </div>

            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* ITEM 1: JADWAL IBADAH */}
              <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                      1
                    </span>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                      Jadwal Ibadah
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Tanggal Ibadah Picker */}
                    <div>
                      <label className="text-xs ml-1 mb-2 block font-medium text-gray-700 dark:text-gray-300">
                        Pilih Tanggal Ibadah
                      </label>
                      <input
                        type="date"
                        value={serviceDateRaw}
                        onChange={(e) => handleServiceDateChange(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                      />
                      <p className="ml-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Pilih tanggal ibadah dari kalender untuk format otomatis.
                      </p>
                    </div>

                    {/* Format Tanggal Ibadah Text */}
                    <div>
                      <label className="text-xs ml-1 mb-2 block font-medium text-gray-700 dark:text-gray-300">
                        Tanggal Ibadah
                      </label>
                      <input
                        type="text"
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        placeholder="Contoh: 13 September 2026"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                      />
                      <p className="ml-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Tanggal yang dipilih.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ITEM 2: JADWAL LATIHAN & GLADI */}
              <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                      2
                    </span>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                      Jadwal Latihan
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Tanggal Latihan Picker */}
                    <div>
                      <label className="text-xs ml-1 mb-2 block font-medium text-gray-700 dark:text-gray-300">
                        Pilih Tanggal Latihan
                      </label>
                      <input
                        type="date"
                        value={rehearsalDateRaw}
                        onChange={(e) => handleRehearsalDateChange(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                      />
                      <p className="ml-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Pilih hari & tanggal latihan dari kalender.
                      </p>
                    </div>

                    {/* Format Tanggal Latihan Text */}
                    <div>
                      <label className="text-xs ml-1 mb-2 block font-medium text-gray-700 dark:text-gray-300">
                        Tanggal Latihan
                      </label>
                      <input
                        type="text"
                        value={rehearsalDate}
                        onChange={(e) => setRehearsalDate(e.target.value)}
                        placeholder="Contoh: Sabtu, 12 September"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                      />
                      <p className="ml-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Tanggal pelaksanaan latihan.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              {/* ITEM 3: JAM LATIHAN */}
              <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                      3
                    </span>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                      Jam Latihan
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Jam Latihan Time Picker */}
                    <div>
                      <label className="text-xs ml-1 mb-2 block font-medium text-gray-700 dark:text-gray-300">
                        Pilih Jam Latihan
                      </label>
                      <input
                        type="time"
                        value={rehearsalTimeRaw}
                        onChange={(e) => handleRehearsalTimeChange(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                      />
                      <p className="ml-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Pilih jam dari time picker.
                      </p>
                    </div>

                    {/* Format Jam Latihan Text */}
                    <div>
                      <label className="text-xs ml-1 mb-2 block font-medium text-gray-700 dark:text-gray-300">
                        Jam Latihan
                      </label>
                      <input
                        type="text"
                        value={rehearsalTime}
                        onChange={(e) => setRehearsalTime(e.target.value)}
                        placeholder="Contoh: 09.00"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                      />
                      <p className="ml-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Waktu pelaksanaan latihan.
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="md:col-span-2 pt-1 pl-1">
                      <div className="flex flex-col items-start gap-1.5">
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mr-1">
                          Pilihan cepat:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {quickTimePresets.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setRehearsalTime(time);
                                setRehearsalTimeRaw(time.replace(".", ":"));
                              }}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                rehearsalTime === time
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* FOOTER */}

            <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(
                    false
                  );
                }}
                disabled={
                  loading
                }
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:ring-neutral-700 sm:flex-none"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 sm:flex-none"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Mengirim Jadwal...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Kirim Jadwal
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}
    </main>
  );
}
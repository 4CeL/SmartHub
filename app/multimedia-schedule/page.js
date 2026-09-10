"use client";

import { useState } from "react";
import {
  Headset,
  Calendar,
  Clock,
  Send,
  Check,
  Sparkles,
} from "lucide-react";

// ======================================================
// N8N WEBHOOK URL
// ======================================================
const N8N_WEBHOOK_URL =
  "http://localhost:5678/webhook/multimedia-schedule-sender";

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

export default function MultimediaScheduleSenderPage() {
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
  // STATUS STATE
  // ======================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [sentPayload, setSentPayload] = useState(null);

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

  // Preset jam latihan
  const quickTimePresets = ["08.00", "09.00", "09.30", "10.00", "10.30", "13.00", "14.00"];

  // ======================================================
  // SUBMIT / SEND SCHEDULE TO N8N
  // ======================================================
  const handleSubmit = async () => {
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-neutral-950 transition-colors">
      {/* ======================================================
          LOADING MODAL
      ====================================================== */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col items-center text-center">
              {/* LOADING ICON */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-500" />
              </div>

              {/* TITLE */}
              <h2 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                Sedang mengirim jadwal
              </h2>

              {/* DESCRIPTION */}
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Sistem sedang memproses pengiriman jadwal petugas multimedia ke email melalui n8n.
              </p>

              {/* PROCESS INDICATORS */}
              <div className="mt-6 w-full rounded-xl bg-gray-50 px-4 py-4 text-left dark:bg-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Menyiapkan payload jadwal multimedia...
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:200ms]" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Menghubungi workflow n8n...
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:400ms]" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Mengirimkan email notifikasi ke petugas...
                  </span>
                </div>
              </div>

              {/* WARNING */}
              <p className="mt-5 text-[11px] text-gray-400">
                Jangan tutup halaman selama proses berlangsung.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SUCCESS MODAL
      ====================================================== */}
      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            {/* Success Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <Check className="h-6 w-6 text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Successfully Sent
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Jadwal petugas multimedia telah berhasil dikirimkan ke email.
            </p>

            {/* Detail Summary */}
            {sentPayload && (
              <div className="mt-6 space-y-2.5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left dark:border-neutral-800 dark:bg-neutral-800/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500">Tanggal Ibadah:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {sentPayload.serviceDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500">Tanggal Latihan:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {sentPayload.rehearsalDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500">Jam Latihan:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {sentPayload.rehearsalTime} WIB
                  </span>
                </div>
              </div>
            )}

            {/* Done Button */}
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setMessage("");
              }}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* ==================================================
            HEADER
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
            ERROR & SUCCESS BANNERS
        ================================================== */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-900/10">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {message && !error && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900/50 dark:bg-green-900/10">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {message}
            </p>
          </div>
        )}

        {/* ==================================================
            MAIN CARD: INPUT JADWAL
        ================================================== */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors mb-5">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail Jadwal Petugas Multimedia
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Atur tanggal pelaksanaan ibadah raya serta tanggal dan jam latihan gladi bersih.
            </p>
          </div>

          <div className="space-y-5">
            {/* ITEM 1: JADWAL IBADAH */}
            <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                    1
                  </span>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Jadwal Ibadah
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Tanggal Ibadah Picker */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tanggal Pelaksanaan
                    </label>
                    <input
                      type="date"
                      value={serviceDateRaw}
                      onChange={(e) => handleServiceDateChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                    />
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                      Pilih tanggal ibadah dari kalender untuk format otomatis.
                    </p>
                  </div>

                  {/* Format Tanggal Ibadah Text */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Format Tanggal Ibadah
                    </label>
                    <input
                      type="text"
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      placeholder="Contoh: 13 September 2026"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                    />
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                    2
                  </span>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Jadwal Latihan
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Tanggal Latihan Picker */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tanggal Latihan
                    </label>
                    <input
                      type="date"
                      value={rehearsalDateRaw}
                      onChange={(e) => handleRehearsalDateChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                    />
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                      Pilih hari & tanggal latihan dari kalender.
                    </p>
                  </div>

                  {/* Format Tanggal Latihan Text */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Format Tanggal Latihan
                    </label>
                    <input
                      type="text"
                      value={rehearsalDate}
                      onChange={(e) => setRehearsalDate(e.target.value)}
                      placeholder="Contoh: Sabtu, 12 September"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                    />
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                      Tanggal pelaksanaan latihan.
                    </p>
                  </div>

                  {/* Jam Latihan Time Picker */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jam Latihan
                    </label>
                    <input
                      type="time"
                      value={rehearsalTimeRaw}
                      onChange={(e) => handleRehearsalTimeChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                    />
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                      Pilih jam dari time picker.
                    </p>
                  </div>

                  {/* Format Jam Latihan Text */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Format Jam Latihan
                    </label>
                    <input
                      type="text"
                      value={rehearsalTime}
                      onChange={(e) => setRehearsalTime(e.target.value)}
                      placeholder="Contoh: 09.00"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                    />
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                      Waktu pelaksanaan latihan.
                    </p>
                  </div>

                  {/* Quick Presets */}
                  <div className="md:col-span-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 mr-1">
                        Pilihan cepat:
                      </span>
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
            </section>
          </div>
        </section>

        {/* ==================================================
            LIVE PREVIEW CARD: RINGKASAN PAYLOAD
        ================================================== */}
        {/* <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors mb-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ringkasan Jadwal yang Dikirim
              </h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Payload Preview
            </span>
          </div>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Berikut data jadwal yang akan dikirimkan ke n8n untuk diteruskan via email.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                serviceDate
              </span>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white">
                {serviceDate || <span className="text-gray-400 italic">Belum diisi</span>}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                rehearsalDate
              </span>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white">
                {rehearsalDate || <span className="text-gray-400 italic">Belum diisi</span>}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                rehearsalTime
              </span>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white">
                {rehearsalTime ? `${rehearsalTime} WIB` : <span className="text-gray-400 italic">Belum diisi</span>}
              </p>
            </div>
          </div>
        </section> */}

        {/* ==================================================
            ACTION SECTION: KIRIM JADWAL
        ================================================== */}
        <section className="mt-6 rounded-2xl bg-gray-900 p-6 shadow-sm dark:bg-gray-100 transition-colors">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white dark:text-gray-900">
                  Siap mengirim jadwal multimedia?
                </h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-gray-500">
                Sistem akan mengirimkan jadwal ibadah dan gladi ke email.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-neutral-600 dark:border-t-white" />
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
        </section>

        {/* ==================================================
            FOOTER
        ================================================== */}
        <div className="py-8 text-center">
          <p className="text-xs text-gray-400">
            SmartHub · Multimedia Schedule Sender
          </p>
        </div>
      </div>
    </main>
  );
}

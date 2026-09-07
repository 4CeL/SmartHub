"use client";

import { useState } from "react";
import {
  Video,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Layout,
} from "lucide-react";

export default function Home() {
  const [thumbnailDesignId, setThumbnailDesignId] = useState("");
  const GOOGLE_DRIVE_URL =
    "https://drive.google.com/drive/folders/1ceuhjLvlx8WwhtRt7BTnuls1MAko6vWa?usp=drive_link";

  const [livestreams, setLivestreams] = useState([
    {
      page: 1,
      videoDesignId: "",
      judulLive: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ==========================================
  // Tambah Livestream
  // ==========================================
  const addLivestream = () => {
    setLivestreams((prev) => [
      ...prev,
      {
        page: prev.length + 1,
        videoDesignId: "",
        judulLive: "",
      },
    ]);
  };

  // ==========================================
  // Hapus Livestream
  // ==========================================
  const removeLivestream = (index) => {
    if (livestreams.length === 1) {
      return;
    }

    setLivestreams((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // Update Livestream
  // ==========================================
  const updateLivestream = (index, field, value) => {
    setLivestreams((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ==========================================
  // Atur Tanggal Pada Judul Livestream
  // ==========================================
  const generateJudulLive = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    const bulan = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `Rosypinna Sunday Service ${Number(day)} ${bulan[Number(month) - 1]} ${year}`;
  };

  // ==========================================
  // Jalankan Workflow
  // ==========================================
  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setResult([]);
    setSuccess(false);

    // Validasi Thumbnail Design ID
    if (!thumbnailDesignId.trim()) {
      setError("Thumbnail Design ID wajib diisi.");
      return;
    }

    // Validasi livestream
    for (let i = 0; i < livestreams.length; i++) {
      const item = livestreams[i];

      if (!item.page) {
        setError(`Page thumbnail pada Livestream ${i + 1} wajib diisi.`);
        return;
      }

      if (!item.videoDesignId.trim()) {
        setError(
          `Video Design ID pada Livestream ${i + 1} wajib diisi.`
        );
        return;
      }

      if (!item.judulLive.trim()) {
        setError(
          `Judul livestream pada Livestream ${i + 1} wajib diisi.`
        );
        return;
      }
    }

    // Payload yang dikirim ke n8n
    const payload = {
      thumbnailDesignId: thumbnailDesignId.trim(),

      livestreams: livestreams.map((item) => ({
        page: Number(item.page),
        videoDesignId: item.videoDesignId.trim(),
        judulLive: item.judulLive.trim(),
      })),
    };

    console.log("Payload yang dikirim ke n8n:", payload);

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5678/webhook/livestream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          `n8n mengembalikan status ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Response dari n8n:", data);

      if (data.success === true) {
        setSuccess(true);
        setMessage(
          data.message || "Workflow berhasil dijalankan."
        );
      } else {
        throw new Error(
          data.message || "Terjadi kesalahan saat menjalankan workflow."
        );
      }
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat menghubungi n8n.");
      }
    } finally {
      setLoading(false);
    }
  };

  const videoDesignOptions = [
    {
      minggu: "Minggu 1",
      id: "DAGrB_09meI",
    },
    {
      minggu: "Minggu 2",
      id: "DAHRDJ6Ol7k",
    },
    {
      minggu: "Minggu 3",
      id: "DAHRDHn9VsU",
    },
    {
      minggu: "Minggu 4",
      id: "DAHRDC-0qS0",
    },
    {
      minggu: "Minggu 5",
      id: "DAHRDLeColU",
    },
  ];

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
                Sedang membuat jadwal livestream
              </h2>

              {/* DESCRIPTION */}
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Sistem sedang memproses video Canva dan menjadwalkan siaran langsung YouTube melalui n8n.
              </p>

              {/* PROCESS INDICATORS */}
              <div className="mt-6 w-full rounded-xl bg-gray-50 px-4 py-4 text-left dark:bg-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Memvalidasi Thumbnail dan Canva ID...
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:200ms]" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Menghasilkan video dan mengunggah ke Drive...
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:400ms]" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Menjadwalkan siaran langsung di YouTube...
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Successfully Generated
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Livestream berhasil dibuat dan video telah berhasil di-upload ke Google Drive.
            </p>

            {/* Google Drive Button */}
            <a
              href={GOOGLE_DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
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
                <path d="M12 2v14" />
                <path d="M6 8l6-6 6 6" />
                <path d="M5 22h14" />
                <path d="M7 18h10" />
              </svg>
              Buka Google Drive
            </a>

            {/* Done Button */}
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setMessage("");
              }}
              className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700"
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
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Sunday Service Livestream Scheduler
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  Atur Livestream YouTube dan Video News Gereja secara otomatis.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <Video className="h-8 w-8 text-blue-400" />
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
            CARD 1: THUMBNAIL DESIGN ID
        ================================================== */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors mb-5">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Canva Thumbnail Design ID
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Masukkan ID desain Canva untuk thumbnail yang digunakan di seluruh jadwal livestream.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Canva Design ID
            </label>
            <input
              type="text"
              id="thumbnailDesign"
              value={thumbnailDesignId}
              onChange={(e) => setThumbnailDesignId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
              placeholder="Contoh: DAGrB_09meI"
            />
          </div>
        </section>

        {/* ==================================================
            CARD 2: DAFTAR LIVESTREAM
        ================================================== */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors mb-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daftar Livestream
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Atur judul, canva template video news, dan tanggal pelaksanaan livestream.
              </p>
            </div>

            <button
              type="button"
              onClick={addLivestream}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Tambah Jadwal
            </button>
          </div>

          {/* List of livestreams */}
          <div className="space-y-5">
            {livestreams.map((item, index) => (
              <section
                key={index}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Livestream {index + 1}
                    </h3>
                  </div>

                  {livestreams.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLivestream(index)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      title="Hapus Livestream"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Item Content */}
                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Tanggal Pelaksanaan */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tanggal Pelaksanaan
                      </label>
                      <input
                        type="date"
                        value={item.tanggalLive || ""}
                        onChange={(e) => {
                          const tanggal = e.target.value;
                          updateLivestream(index, "tanggalLive", tanggal);
                          updateLivestream(
                            index,
                            "judulLive",
                            generateJudulLive(tanggal)
                          );
                        }}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                      />
                      <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Judul livestream otomatis terisi berdasarkan tanggal ini.
                      </p>
                    </div>

                    {/* Template Video News (Select) */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Template Video News
                      </label>
                      <div className="relative">
                        <select
                          value={item.videoDesignId}
                          onChange={(e) =>
                            updateLivestream(
                              index,
                              "videoDesignId",
                              e.target.value
                            )
                          }
                          className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
                        >
                          <option value="">Pilih Video Design ID</option>
                          {videoDesignOptions.map((option) => (
                            <option key={option.minggu} value={option.id}>
                              {option.minggu} - {option.id}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Pilih template Canva video news sesuai jadwal minggu.
                      </p>
                    </div>

                    {/* Judul Livestream */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Judul Livestream
                      </label>
                      <input
                        type="text"
                        value={item.judulLive}
                        onChange={(e) =>
                          updateLivestream(index, "judulLive", e.target.value)
                        }
                        placeholder="Contoh: Rosypinna Sunday Service 13 September 2026"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                      />
                      <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        Anda dapat mengubah judul ini jika memiliki nama acara khusus.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Add item dashed button at bottom */}
          <div className="mt-5">
            <button
              type="button"
              onClick={addLivestream}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-4 text-sm font-medium text-gray-500 transition hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            >
              <Plus className="h-4 w-4" />
              Tambah Jadwal Livestream {livestreams.length + 1}
            </button>
          </div>
        </section>

        {/* ==================================================
            ACTION SECTION: JALANKAN WORKFLOW
        ================================================== */}
        <section className="mt-6 rounded-2xl bg-gray-900 p-6 shadow-sm dark:bg-gray-100 transition-colors">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white dark:text-gray-900">
                  Siap membuat jadwal livestream?
                </h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-gray-500">
                Otomatisasi pembuatan jadwal livestream YouTube dan upload video news ke Google Drive.
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
                  Menjalankan Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Jalankan Workflow
                </>
              )}
            </button>
          </div>
        </section>

        {/* ==================================================
            WORKFLOW RESULT (IF ANY)
        ================================================== */}
        {result.length > 0 && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
            <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
              Hasil Workflow
            </h2>

            <div className="space-y-4">
              {result.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 p-4 dark:border-neutral-800"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {item.judulLive || `Livestream ${index + 1}`}
                    </h3>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      {item.status || "Success"}
                    </span>
                  </div>

                  {item.youtubeId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>YouTube ID:</strong> {item.youtubeId}
                    </p>
                  )}

                  {item.videoFile && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Video:</strong> {item.videoFile}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}
        <div className="py-8 text-center">
          <p className="text-xs text-gray-400">
            SmartHub · Sunday Service Livestream
          </p>
        </div>
      </div>
    </main>
  );
}
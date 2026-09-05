"use client";

import { useState } from "react";
import { Video, Sparkles } from "lucide-react";

export default function Home() {
  const [thumbnailDesignId, setThumbnailDesignId] = useState("");
  const GOOGLE_DRIVE_URL = "https://drive.google.com/drive/folders/1ceuhjLvlx8WwhtRt7BTnuls1MAko6vWa?usp=drive_link";

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
    <main className="min-h-screen bg-gray-100 px-6 py-10 dark:bg-neutral-950 transition-colors">
    {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">

            {/* Loading Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Generating Livestream
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Sedang membuat jadwal livestream dan memproses video.
            <br />
            Mohon tunggu, proses ini mungkin membutuhkan beberapa saat.
            </p>

            {/* Progress Indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            <span
                className="h-2 w-2 animate-pulse rounded-full bg-blue-600"
                style={{ animationDelay: "150ms" }}
            />
            <span
                className="h-2 w-2 animate-pulse rounded-full bg-blue-600"
                style={{ animationDelay: "300ms" }}
            />
            </div>

            {/* Status */}
            <div className="mt-6 rounded-lg bg-gray-50 px-4 py-3 dark:bg-neutral-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                PROCESSING
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                Please don't close this page
            </p>
            </div>

        </div>
        </div>
    )}

    {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-neutral-900">

            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
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
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Livestream berhasil dibuat dan video telah
                berhasil di-upload ke Google Drive.
            </p>

            {/* Success Status */}
            <div className="mt-6 rounded-lg border border-green-100 bg-green-50 px-4 py-3 dark:border-green-900/50 dark:bg-green-900/10">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                ✓ Workflow completed successfully
                </p>
            </div>

            {/* Google Drive Button */}
            <a
                href={GOOGLE_DRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
                {/* Google Drive Icon */}
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
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700"
            >
                Done
            </button>

            </div>
        </div>
        )}
    <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}
        <section className="relative mb-8 overflow-hidden rounded-2xl bg-gray-900 px-7 py-8 shadow-sm">

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
                  Atur Livestream YouTube dan Video News Gereja.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <Video className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </section>
        
        {/* ==================================================
            Card 1 Untuk Thumbnail Id & Add Button
        ================================================== */}
        {/* Thumbnail Design */}
        <div className="mb-5 rounded-xl bg-white p-6 shadow-sm dark:bg-neutral-900 transition-colors">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Input Thumbnail Design ID
            </h2>
            <div className="flex items-center gap-2">
              <input
              type="text"
              id="thumbnailDesign"
              value={thumbnailDesignId}
              onChange={(e) => setThumbnailDesignId(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
              placeholder="Contoh: DAGrB_09meI"
              />
              <button
                type="button"
                onClick={addLivestream}
                className="ml-2 inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-700"
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
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Tambah Jadwal
              </button>
            </div>
        </div>

        {/* Main Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-neutral-900 transition-colors">

        {/* Livestreams List */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Daftar Livestream
            </h2>
            </div>

            {/* List */}
            <div className="space-y-5">

            {livestreams.map((item, index) => (
                <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                    {index + 1}
                    </span>
                    <h3 className="font-medium text-gray-800 dark:text-white">
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
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v5" />
                        <path d="M14 11v5" />
                        </svg>
                    </button>
                    )}
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">

                    {/* Thumbnail Page */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Judul Livestream
                        </label>
                        <input
                        type="text"
                        value={item.judulLive}
                        onChange={(e) =>
                            updateLivestream(index, "judulLive", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                        placeholder="Contoh: Ibadah Minggu Raya..."
                        />
                    </div>

                    {/* Video Design ID */}
                    <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Canva ID For News
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
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                        >
                        <option value="">
                            Pilih Video Design ID
                        </option>

                        {videoDesignOptions.map((option) => (
                            <option
                            key={option.minggu}
                            value={option.id}
                            >
                            {option.minggu} - {option.id}
                            </option>
                        ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                            />
                        </svg>
                        </div>
                    </div>
                    </div>

                </div>

                {/* Judul */}
                <div className="px-5 pb-5">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Livestream Date
                    </label>

                    <input
                    type="date"
                    value={item.tanggalLive || ""}
                    onChange={(e) => {
                        const tanggal = e.target.value;

                        updateLivestream(
                        index,
                        "tanggalLive",
                        tanggal
                        );

                        updateLivestream(
                        index,
                        "judulLive",
                        generateJudulLive(tanggal)
                        );
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                    />

                    {item.judulLive && (
                    <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-neutral-800">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Judul Livestream
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {item.judulLive}
                        </p>
                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Error */}
        {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
            <strong>Error:</strong> {error}
            </div>
        )}

        {/* Success */}
        {message && !error && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/10 dark:text-green-400">
            <strong>Berhasil:</strong> {message}
            </div>
        )}

        </div>

        {/* ==================================================
            GENERATE / JALANKAN WORKFLOW
        ================================================== */}
        <section className="mt-6 rounded-2xl bg-gray-900 p-6 shadow-sm dark:bg-gray-100  transition-colors">
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

        {/* Result */}
        {result.length > 0 && (
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Hasil Workflow
            </h2>

            <div className="space-y-4">

            {result.map((item, index) => (
                <div
                key={index}
                className="rounded-lg border border-gray-200 p-4"
                >

                <div className="mb-3 flex items-center justify-between">

                    <h3 className="font-semibold text-gray-800">
                    {item.judulLive ||
                        `Livestream ${index + 1}`}
                    </h3>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {item.status || "Success"}
                    </span>

                </div>

                {item.youtubeId && (
                    <p className="text-sm text-gray-600">
                    <strong>YouTube ID:</strong>{" "}
                    {item.youtubeId}
                    </p>
                )}

                {item.videoFile && (
                    <p className="mt-1 text-sm text-gray-600">
                    <strong>Video:</strong>{" "}
                    {item.videoFile}
                    </p>
                )}

                </div>
            ))}

            </div>
        </div>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="py-8 text-center">

          <p className="text-xs text-gray-400">
            SmartHub · Livestream
          </p>

        </div>

        {/* Payload Preview */}
        {/* <div className="mt-8 rounded-xl bg-gray-900 p-6 shadow-sm">

        <h2 className="mb-4 text-sm font-semibold text-white">
            Preview Payload
        </h2>

        <pre className="overflow-x-auto text-xs leading-6 text-gray-300">
            {JSON.stringify(
            {
                thumbnailDesignId,
                livestreams,
            },
            null,
            2
            )}
        </pre>

        </div> */}

    </div>
    </main>
  );
}
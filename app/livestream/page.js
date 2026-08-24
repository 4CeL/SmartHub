"use client";

import { useState } from "react";
import { Video } from "lucide-react";

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
    <main className="min-h-screen bg-gray-100 px-6 py-10">
    {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">

            {/* Loading Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900">
            Generating Livestream
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm leading-6 text-gray-500">
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
            <div className="mt-6 rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium text-gray-500">
                PROCESSING
            </p>
            <p className="mt-1 text-sm text-gray-700">
                Please don't close this page
            </p>
            </div>

        </div>
        </div>
    )}

    {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">

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
            <h2 className="text-xl font-semibold text-gray-900">
                Successfully Generated
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm leading-6 text-gray-500">
                Livestream berhasil dibuat dan video telah
                berhasil di-upload ke Google Drive.
            </p>

            {/* Success Status */}
            <div className="mt-6 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-700">
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
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
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
        
        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
              <Video className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Sunday Service Livestream Scheduler
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Atur Livestream YouTube dan Video News Gereja.
              </p>
            </div>
          </div>
        </section>

        {/* Main Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">

        {/* Thumbnail Design ID */}
        <div className="mb-8">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
            Canva Thumbnail Design ID
            </label>

            <input
            type="text"
            value={thumbnailDesignId}
            onChange={(e) =>
                setThumbnailDesignId(e.target.value)
            }
            placeholder="Contoh: DAHLz51TewM"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs text-gray-500">
            Design ID Canva yang berisi beberapa page thumbnail.
            </p>
        </div>

        {/* Livestream */}
        <div>

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                Daftar Livestream
                </h2>

                <p className="text-sm text-gray-500">
                Tambahkan livestream yang ingin dijadwalkan.
                </p>
            </div>

            <button
                type="button"
                onClick={addLivestream}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
                + Tambah Livestream
            </button>
            </div>

            {/* List */}
            <div className="space-y-5">

            {livestreams.map((item, index) => (
                <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                >

                {/* Card Header */}
                <div className="mb-5 flex items-center justify-between">

                    <h3 className="font-semibold text-gray-800">
                    Livestream Minggu {index + 1}
                    </h3>

                    {livestreams.length > 1 && (
                    <button
                        type="button"
                        onClick={() => removeLivestream(index)}
                        title="Hapus livestream"
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
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

                <div className="grid gap-5 md:grid-cols-2">

                    {/* Thumbnail Page */}
                    <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Thumbnail Page
                    </label>

                    <input
                        type="number"
                        min={1}
                        value={item.page}
                        onChange={(e) =>
                        updateLivestream(
                            index,
                            "page",
                            Number(e.target.value)
                        )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                        Nomor page thumbnail pada Canva.
                    </p>
                    </div>

                    {/* Video Design ID */}
                    <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                        {/* Custom arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-700"
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

                    <p className="mt-2 text-xs text-gray-500">
                        Design ID Canva untuk video minggu ini.
                    </p>
                    </div>

                </div>

                {/* Judul */}
                <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                    Pilih tanggal livestream.
                    </p>

                    {item.judulLive && (
                    <div className="mt-3 rounded-lg bg-gray-50 py-3">
                        <p className="text-xs font-medium text-gray-500">
                        Judul Livestream
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
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
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
            </div>
        )}

        {/* Success */}
        {message && !error && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <strong>Berhasil:</strong> {message}
            </div>
        )}

        {/* Submit */}
        <div className="mt-8 border-t border-gray-200 pt-6">

            <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full rounded-lg px-5 py-3 font-semibold text-white transition ${
                loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
            >
            {loading
                ? "⏳ Menjalankan Workflow..."
                : "▶ Jalankan Workflow"}
            </button>

        </div>

        </div>

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
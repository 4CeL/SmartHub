"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileText,
  Plus,
  Sparkles,
  Clock3,
  Trash2,
  NotebookPen
} from "lucide-react";

const N8N_REPORT_URL =
  "http://localhost:5678/webhook/internship-report";

export default function InternshipReportPage() {
  // ======================================================
  // GENERAL STATE
  // ======================================================

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [activeTab, setActiveTab] = useState("input");

  // ======================================================
  // WEEK STATE
  // ======================================================

  const [weeks, setWeeks] = useState([
    {
      week: 1,
      activities: "",
      issues: "",
    },
  ]);

  // ======================================================
  // GENERATE STATE
  // ======================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // PDF STATE
  // ======================================================

  const [reportPdfUrl, setReportPdfUrl] = useState("");

  // ======================================================
  // ADD WEEK
  // ======================================================

  const addWeek = () => {
    if (weeks.length >= 5) return;

    setWeeks((prev) => [
      ...prev,
      {
        week: prev.length + 1,
        activities: "",
        issues: "",
      },
    ]);
  };

  // ======================================================
  // REMOVE WEEK
  // ======================================================

  const removeWeek = (index) => {
    if (weeks.length === 1) return;

    setWeeks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((week, index) => ({
          ...week,
          week: index + 1,
        }))
    );
  };

  // ======================================================
  // UPDATE WEEK
  // ======================================================

  const updateWeek = (index, field, value) => {
    setWeeks((prev) =>
      prev.map((week, i) =>
        i === index
          ? {
              ...week,
              [field]: value,
            }
          : week
      )
    );
  };

  // ======================================================
  // GENERATE REPORT
  // ======================================================

  const handleGenerateReport = async () => {
    setError("");

    // ----------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------

    if (!month) {
      setError("Bulan laporan wajib dipilih.");
      return;
    }

    if (!year) {
      setError("Tahun laporan wajib diisi.");
      return;
    }

    if (!/^\d{4}$/.test(year)) {
      setError("Tahun harus berupa 4 digit.");
      return;
    }

    const hasEmptyActivity = weeks.some(
      (week) => !week.activities.trim()
    );

    if (hasEmptyActivity) {
      setError(
        "Kegiatan pada setiap minggu wajib diisi."
      );
      return;
    }

    // ----------------------------------------------------
    // HAPUS PDF LAMA
    // ----------------------------------------------------

    if (reportPdfUrl) {
      URL.revokeObjectURL(reportPdfUrl);
      setReportPdfUrl("");
    }

    try {
      setLoading(true);

      // --------------------------------------------------
      // PREPARE PAYLOAD
      // --------------------------------------------------

      const payload = {
        month,
        year,
        weeks: weeks.map((week) => ({
          week: week.week,
          activities: week.activities.trim(),
          issues: week.issues.trim(),
        })),
      };

      console.log(
        "Payload Generate Report:",
        payload
      );

      // --------------------------------------------------
      // SEND TO N8N
      // --------------------------------------------------

      const response = await fetch(
        N8N_REPORT_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(
        "Response status:",
        response.status
      );

      console.log(
        "Response content type:",
        response.headers.get("content-type")
      );

      // --------------------------------------------------
      // CEK RESPONSE
      // --------------------------------------------------

      if (!response.ok) {
        let errorMessage =
          `Gagal membuat laporan. Status: ${response.status}`;

        try {
          const errorText =
            await response.text();

          if (errorText) {
            console.error(
              "N8N Error Response:",
              errorText
            );

            try {
              const errorJson =
                JSON.parse(errorText);

              errorMessage =
                errorJson.message ||
                errorJson.error ||
                errorMessage;
            } catch {
              // Response bukan JSON
            }
          }
        } catch {
          // Abaikan error parsing
        }

        throw new Error(errorMessage);
      }

      // --------------------------------------------------
      // CEK CONTENT TYPE
      // --------------------------------------------------

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      // --------------------------------------------------
      // JIKA N8N MENGEMBALIKAN JSON
      // --------------------------------------------------

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        const data =
          await response.json();

        console.log(
          "JSON Response dari n8n:",
          data
        );

        if (data.success === false) {
          throw new Error(
            data.message ||
              "Gagal membuat laporan."
          );
        }

        throw new Error(
          "n8n mengembalikan JSON, bukan file PDF. Pastikan node Respond to Webhook menggunakan 'Binary File'."
        );
      }

      // --------------------------------------------------
      // RESPONSE HARUS PDF
      // --------------------------------------------------

      if (
        !contentType.includes(
          "application/pdf"
        )
      ) {
        console.warn(
          "Content-Type tidak dikenali:",
          contentType
        );
      }

      // --------------------------------------------------
      // AMBIL PDF SEBAGAI BLOB
      // --------------------------------------------------

      const pdfBlob =
        await response.blob();

      console.log(
        "PDF Blob:",
        pdfBlob
      );

      console.log(
        "PDF Size:",
        pdfBlob.size
      );

      console.log(
        "PDF Type:",
        pdfBlob.type
      );

      // --------------------------------------------------
      // VALIDASI PDF
      // --------------------------------------------------

      if (!pdfBlob.size) {
        throw new Error(
          "File PDF kosong atau tidak berhasil diterima dari n8n."
        );
      }

      // --------------------------------------------------
      // BUAT URL DARI BLOB
      // --------------------------------------------------

      const pdfUrl =
        URL.createObjectURL(
          new Blob(
            [pdfBlob],
            {
              type: "application/pdf",
            }
          )
        );

      console.log(
        "Generated PDF URL:",
        pdfUrl
      );

      // --------------------------------------------------
      // SET PDF
      // --------------------------------------------------

      setReportPdfUrl(pdfUrl);

      // --------------------------------------------------
      // PINDAH KE PREVIEW
      // --------------------------------------------------

      setActiveTab("preview");
    } catch (err) {
      console.error(
        "Generate report error:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat membuat laporan."
      );
    } finally {
      // --------------------------------------------------
      // MATIKAN LOADING
      // --------------------------------------------------

      setLoading(false);
    }
  };

  // ======================================================
  // DOWNLOAD PDF
  // ======================================================

  const handleDownloadPdf = () => {
    if (!reportPdfUrl) return;

    const link =
      document.createElement("a");

    link.href = reportPdfUrl;
    link.download = `Laporan_Magang_${month}_${year}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ======================================================
  // RESET REPORT
  // ======================================================

  const resetReport = () => {
    if (reportPdfUrl) {
      URL.revokeObjectURL(reportPdfUrl);
    }

    setReportPdfUrl("");
    setError("");
    setActiveTab("input");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-neutral-950 transition-colors">
      <div className="mx-auto max-w-7xl">
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
                  Monthly Report Generator
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  Generate laporan kegiatan magang secara otomatis.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <NotebookPen className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            REPORT INFORMATION
        ================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors mb-5">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Periode Laporan
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pilih bulan dan tahun untuk laporan ini.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* MONTH */}

            <div className="relative">

              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bulan
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-blue-900"
              >

                <option value="">
                  Pilih bulan
                </option>

                <option value="Januari">
                  Januari
                </option>

                <option value="Februari">
                  Februari
                </option>

                <option value="Maret">
                  Maret
                </option>

                <option value="April">
                  April
                </option>

                <option value="Mei">
                  Mei
                </option>

                <option value="Juni">
                  Juni
                </option>

                <option value="Juli">
                  Juli
                </option>

                <option value="Agustus">
                  Agustus
                </option>

                <option value="September">
                  September
                </option>

                <option value="Oktober">
                  Oktober
                </option>

                <option value="November">
                  November
                </option>

                <option value="Desember">
                  Desember
                </option>

              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex top-7 items-center">
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

            {/* TAHUN */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tahun
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Contoh: 2024"
                maxLength={4}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            TAB
        ================================================== */}
        <div className="mb-5 flex gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => setActiveTab("input")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "input"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            }`}
          >

            <FileText className="h-4 w-4" />

            Input Kegiatan

          </button>

          <button
            type="button"
            disabled={!reportPdfUrl}
            onClick={() => setActiveTab("preview")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "preview"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            Preview Laporan
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-900/10">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* ==================================================
            INPUT TAB
        ================================================== */}

        {activeTab === "input" && (
          <>

            {/* ==================================================
                WEEKLY ACTIVITIES
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detail Mingguan
                  </h2>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Masukkan kegiatan dan kendala pada setiap minggu.
              </p>

              {/* WEEKS */}

              <div className="space-y-5 mt-6">

                {weeks.map((week, index) => (
                  <section
                    key={index}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  >
                    {/* WEEK HEADER */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                          {week.week}
                        </span>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          Minggu {week.week}
                        </h3>
                      </div>
                      
                      {weeks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWeek(index)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          title="Hapus Minggu"
                        >

                          <Trash2 className="h-4 w-4" />

                        </button>
                      )}
                    </div>

                    <div className="p-5">
                      {/* INPUT GRID */}
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* ACTIVITIES */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kegiatan
                          </label>

                          <textarea
                            value={week.activities}
                            onChange={(e) =>
                              updateWeek(
                                index,
                                "activities",
                                e.target.value
                              )
                            }
                            placeholder={`Contoh:\n- Membuat API untuk modul machine calibration\n- Melakukan integrasi backend dan frontend`}
                            className="min-h-[190px] w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                          />

                          <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                            Masukkan seluruh kegiatan yang dilakukan pada minggu ini.
                          </p>
                        </div>

                        {/* ISSUES */}
                        <div>

                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kendala & Solusi
                            <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">
                              (opsional)
                            </span>
                          </label>

                          <textarea
                            value={week.issues}
                            onChange={(e) =>
                              updateWeek(
                                index,
                                "issues",
                                e.target.value
                              )
                            }
                            placeholder={`Contoh:\n- Mengalami error pada API saat melakukan request\n- Mengecek response menggunakan Postman\n- Memperbaiki parameter request yang salah`}
                            className="min-h-[190px] w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                          />

                          <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                            Jika tidak ada kendala, bagian ini boleh dikosongkan.
                          </p>

                        </div>

                      </div>

                    {/* POINT COUNT */}

                    <div className="mt-3 flex items-center justify-between">

                      <p className="text-[11px] text-gray-400">

                        {
                          week.activities
                            .split("\n")
                            .filter(
                              (item) =>
                                item.trim()
                            ).length
                        }{" "}
                        poin kegiatan

                      </p>

                      <p className="text-[11px] text-gray-400">

                        {
                          week.issues
                            .split("\n")
                            .filter(
                              (item) =>
                                item.trim()
                            ).length
                        }{" "}
                        poin kendala / solusi

                      </p>

                    </div>
                    </div>
                  </section>
                ))}

              </div>

              {/* ADD WEEK */}

              <div className="mt-5">

                {weeks.length < 5 ? (
                  <button
                    type="button"
                    onClick={addWeek}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-4 text-sm font-medium text-gray-500 transition hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                  >

                    <Plus className="h-4 w-4" />

                    Tambah Minggu{" "}
                    {weeks.length + 1}

                  </button>

                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-4 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Maksimal 5 minggu untuk satu laporan.
                    </p>
                  </div>
                )}

              </div>

            </section>

            {/* ==================================================
                GENERATE
            ================================================== */}

            <section className="mt-6 rounded-2xl bg-gray-900 p-6 shadow-sm dark:bg-gray-100 transition-colors">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white dark:text-gray-900">
                      Siap membuat laporan?
                    </h2>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-gray-500">
                    AI akan mengubah kegiatan mingguan
                    menjadi laporan naratif formal dan
                    PDF siap digunakan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-neutral-600 dark:border-t-white" />
                      Membuat Laporan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </section>

          </>
        )}

        {/* ==================================================
            PREVIEW TAB
        ================================================== */}

        {activeTab === "preview" &&
          reportPdfUrl && (
            <>

              {/* ==================================================
                  PREVIEW TOOLBAR
              ================================================== */}

              <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("input")}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Edit Input
                    </button>
                    <div className="hidden h-6 w-px bg-gray-200 sm:block dark:bg-neutral-800" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Preview Laporan
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {month} {year}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  PDF PREVIEW
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
                <div className="overflow-x-auto p-4 sm:p-8">
                  <div className="mx-auto min-h-[900px] min-w-[900px] max-w-[1200px] overflow-hidden bg-white shadow-lg dark:bg-neutral-100">
                    <iframe
                      title="PDF Report Preview"
                      src={reportPdfUrl}
                      className="h-[1000px] w-full border-0"
                    />
                  </div>
                </div>
              </section>

              {/* GENERATE ULANG */}

              <div className="mt-5 flex justify-center">

                <button
                  type="button"
                  onClick={resetReport}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                >

                  <FileText className="h-4 w-4" />

                  Buat Laporan Baru

                </button>

              </div>

            </>
          )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="py-8 text-center">

          <p className="text-xs text-gray-400">
            SmartHub · Monthly Internship Report
          </p>

        </div>

      </div>

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
                Sedang membuat laporan
              </h2>

              {/* DESCRIPTION */}
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                AI sedang menyusun kegiatan mingguan
                menjadi laporan magang dan membuat
                file PDF.
              </p>

              {/* PROCESS */}
              <div className="mt-6 w-full rounded-xl bg-gray-50 px-4 py-4 text-left dark:bg-neutral-800">

                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Mengolah kegiatan dan kendala...
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:200ms]" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Menyusun narasi laporan dengan AI...
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:400ms]" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Membuat file PDF...
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:600ms]" />

                  <span className="text-xs font-medium text-gray-600">
                    Menyiapkan preview laporan...
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

    </main>
  );
}
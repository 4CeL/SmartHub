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
    <main className="min-h-screen bg-gray-50 px-6 py-8">

      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">

              <FileText className="h-5 w-5 text-white" />

            </div>

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Monthly Internship Report
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Buat laporan kegiatan magang bulanan
                menggunakan bantuan AI.
              </p>

            </div>

          </div>

        </section>

        {/* ==================================================
            TAB
        ================================================== */}

        <div className="mb-6 flex gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">

          <button
            type="button"
            onClick={() =>
              setActiveTab("input")
            }
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "input"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >

            <FileText className="h-4 w-4" />

            Input Kegiatan

          </button>

          <button
            type="button"
            disabled={!reportPdfUrl}
            onClick={() =>
              setActiveTab("preview")
            }
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "preview"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">

            <p className="text-sm font-medium text-red-700">
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
                REPORT INFORMATION
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <div className="flex items-center gap-2">

                  <CalendarDays className="h-5 w-5 text-gray-700" />

                  <h2 className="text-lg font-semibold text-gray-900">
                    Informasi Laporan
                  </h2>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Tentukan periode laporan magang.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* MONTH */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Bulan
                  </label>

                  <select
                    value={month}
                    onChange={(e) =>
                      setMonth(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                </div>

                {/* YEAR */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tahun
                  </label>

                  <input
                    type="number"
                    value={year}
                    onChange={(e) =>
                      setYear(e.target.value)
                    }
                    placeholder="Contoh: 2026"
                    min="2000"
                    max="2100"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

            </section>

            {/* ==================================================
                WEEKLY ACTIVITIES
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <div className="flex items-center gap-2">

                  <Clock3 className="h-5 w-5 text-gray-700" />

                  <h2 className="text-lg font-semibold text-gray-900">
                    Kegiatan Mingguan
                  </h2>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Masukkan kegiatan dan kendala pada setiap minggu.
                </p>

              </div>

              {/* WEEKS */}

              <div className="space-y-5">

                {weeks.map((week, index) => (
                  <section
                    key={week.week}
                    className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5"
                  >

                    {/* WEEK HEADER */}

                    <div className="mb-5 flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
                          {week.week}
                        </div>

                        <div>

                          <h3 className="text-sm font-semibold text-gray-900">
                            Minggu Ke-{week.week}
                          </h3>

                          <p className="text-xs text-gray-400">
                            Kegiatan minggu ke-{week.week}
                          </p>

                        </div>

                      </div>

                      {weeks.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeWeek(index)
                          }
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >

                          <Trash2 className="h-4 w-4" />

                        </button>
                      )}

                    </div>

                    {/* INPUT GRID */}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      {/* ACTIVITIES */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
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
                          placeholder={`Contoh:
- Membuat API untuk modul machine calibration
- Melakukan testing menggunakan Postman
- Memperbaiki query SQL
- Melakukan integrasi backend dan frontend`}
                          className="min-h-[190px] w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-[11px] text-gray-400">
                          Masukkan seluruh kegiatan yang dilakukan pada minggu ini.
                        </p>

                      </div>

                      {/* ISSUES */}

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Kendala & Solusi
                          <span className="ml-1 font-normal text-gray-400">
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
                          placeholder={`Contoh:
- Mengalami error pada API saat melakukan request
- Mengecek response menggunakan Postman
- Memperbaiki parameter request yang salah`}
                          className="min-h-[190px] w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-[11px] text-gray-400">
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

                  </section>
                ))}

              </div>

              {/* ADD WEEK */}

              <div className="mt-5">

                {weeks.length < 5 ? (

                  <button
                    type="button"
                    onClick={addWeek}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-4 text-sm font-medium text-gray-500 transition hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600"
                  >

                    <Plus className="h-4 w-4" />

                    Tambah Minggu{" "}
                    {weeks.length + 1}

                  </button>

                ) : (

                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-4 text-center">

                    <p className="text-xs text-gray-400">
                      Maksimal 5 minggu untuk satu laporan.
                    </p>

                  </div>

                )}

              </div>

            </section>

            {/* ==================================================
                GENERATE
            ================================================== */}

            <section className="mt-6 rounded-2xl bg-gray-900 p-6 shadow-sm">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <Sparkles className="h-5 w-5 text-blue-400" />

                    <h2 className="text-sm font-semibold text-white">
                      Siap membuat laporan?
                    </h2>

                  </div>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    AI akan mengubah kegiatan mingguan
                    menjadi laporan naratif formal dan
                    PDF siap digunakan.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

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

              <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("input")
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >

                      <ArrowLeft className="h-4 w-4" />

                      Edit Input

                    </button>

                    <div className="hidden h-6 w-px bg-gray-200 sm:block" />

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        Preview Laporan
                      </p>

                      <p className="text-xs text-gray-400">
                        {month} {year}
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-2">

                    {/* DOWNLOAD */}

                    <button
                      type="button"
                      onClick={
                        handleDownloadPdf
                      }
                      className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
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

              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-sm">

                <div className="overflow-x-auto p-4 sm:p-8">

                  <div className="mx-auto min-h-[900px] min-w-[900px] max-w-[1200px] overflow-hidden bg-white shadow-lg">

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
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
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

          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-2xl">

            <div className="flex flex-col items-center text-center">

              {/* LOADING ICON */}

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">

                <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              </div>

              {/* TITLE */}

              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                Sedang membuat laporan
              </h2>

              {/* DESCRIPTION */}

              <p className="mt-2 text-sm leading-6 text-gray-500">
                AI sedang menyusun kegiatan mingguan
                menjadi laporan magang dan membuat
                file PDF.
              </p>

              {/* PROCESS */}

              <div className="mt-6 w-full rounded-xl bg-gray-50 px-4 py-4 text-left">

                <div className="flex items-center gap-3">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />

                  <span className="text-xs font-medium text-gray-600">
                    Mengolah kegiatan dan kendala...
                  </span>

                </div>

                <div className="mt-3 flex items-center gap-3">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:200ms]" />

                  <span className="text-xs font-medium text-gray-600">
                    Menyusun narasi laporan dengan AI...
                  </span>

                </div>

                <div className="mt-3 flex items-center gap-3">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:400ms]" />

                  <span className="text-xs font-medium text-gray-600">
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
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Sparkles,
  BookOpen,
} from "lucide-react";

const N8N_REPORT_URL =
  "http://localhost:5678/webhook/materi-persekutuan-remaja";

export default function MateriPersekutuanRemajaPage() {
  // ======================================================
  // GENERAL STATE
  // ======================================================

  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState("input");

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
  // GENERATE REPORT
  // ======================================================

  const handleGenerateReport = async () => {
    setError("");

    // ----------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------

    if (!chatInput.trim()) {
      setError("Ayat Alkitab wajib diisi.");
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
        chatInput: chatInput.trim(),
      };

      console.log(
        "Payload Generate Materi:",
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
          `Gagal membuat materi. Status: ${response.status}`;

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
        let data = {};
        try {
          const text = await response.clone().text();
          if (text) {
            data = JSON.parse(text);
          }
        } catch (e) {
          console.warn("Gagal parse JSON, mungkin n8n mengirim binary dengan header JSON. Melanjutkan sebagai PDF...", e);
        }

        if (data && Object.keys(data).length > 0) {
          console.log(
            "JSON Response dari n8n:",
            data
          );

          if (data.success === false) {
            throw new Error(
              data.message ||
                "Gagal membuat materi."
            );
          }

          throw new Error(
            "n8n mengembalikan JSON, bukan file PDF. Pastikan node Respond to Webhook menggunakan 'Binary File'."
          );
        }
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
          "Terjadi kesalahan saat membuat materi."
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
    link.download = `Materi_Persekutuan_Remaja.pdf`;

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

              <BookOpen className="h-5 w-5 text-white" />

            </div>

            <div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Materi Persekutuan Remaja
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Buat materi persekutuan remaja berdasarkan ayat Alkitab dengan bantuan AI.
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

            <BookOpen className="h-4 w-4" />

            Input Ayat Alkitab

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

            Preview Materi

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

                  <BookOpen className="h-5 w-5 text-gray-700" />

                  <h2 className="text-lg font-semibold text-gray-900">
                    Ayat Alkitab
                  </h2>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Masukkan referensi atau teks ayat Alkitab untuk materi yang akan dibuat.
                </p>

              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Referensi Ayat
                </label>

                <textarea
                  value={chatInput}
                  onChange={(e) =>
                    setChatInput(e.target.value)
                  }
                  placeholder="Contoh: Yohanes 3:16 atau Mazmur 23..."
                  className="min-h-[190px] w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-[11px] text-gray-400">
                  Tuliskan referensi ayat yang jelas agar AI dapat menyusun materi yang relevan.
                </p>
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
                      Siap membuat materi?
                    </h2>

                  </div>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    AI akan menyusun panduan dan materi
                    khotbah/sharing remaja berdasarkan ayat yang diberikan menjadi
                    PDF siap pakai.
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

                      Membuat Materi...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />

                      Generate Materi
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
                        Preview Materi
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

                  Buat Materi Baru

                </button>

              </div>

            </>
          )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="py-8 text-center">

          <p className="text-xs text-gray-400">
            SmartHub · Materi Persekutuan Remaja
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
                Sedang membuat materi
              </h2>

              {/* DESCRIPTION */}

              <p className="mt-2 text-sm leading-6 text-gray-500">
                AI sedang menyusun materi persekutuan remaja berdasarkan ayat
                yang diberikan dan membuat file PDF.
              </p>

              {/* PROCESS */}

              <div className="mt-6 w-full rounded-xl bg-gray-50 px-4 py-4 text-left">

                <div className="flex items-center gap-3">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />

                  <span className="text-xs font-medium text-gray-600">
                    Menghubungi AI...
                  </span>

                </div>

                <div className="mt-3 flex items-center gap-3">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:200ms]" />

                  <span className="text-xs font-medium text-gray-600">
                    Menyusun narasi materi...
                  </span>

                </div>

                <div className="mt-3 flex items-center gap-3">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:400ms]" />

                  <span className="text-xs font-medium text-gray-600">
                    Membuat file PDF...
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

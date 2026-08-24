"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";

// ======================================================
// N8N WEBHOOK URL
// ======================================================

// GET - mengambil semua data lagu
const N8N_URL =
  "http://localhost:5678/webhook/song-chords";

// POST - menambahkan lagu
const N8N_ADD_URL =
  "http://localhost:5678/webhook/add-song-chords";

// POST - update link chord
const N8N_UPDATE_URL =
  "http://localhost:5678/webhook/update-song-chords";

// POST - mengirim lagu ke email
const N8N_EMAIL_URL =
  "http://localhost:5678/webhook/send-email";

export default function SongChordsPage() {
  // ======================================================
  // SONG DATA
  // ======================================================

  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // EMAIL STATE
  // ======================================================

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // ======================================================
  // ADD SONG STATE
  // ======================================================

  const [showAddModal, setShowAddModal] = useState(false);

  const [songName, setSongName] = useState("");
  const [addChordUrl, setAddChordUrl] = useState("");

  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  // ======================================================
  // UPDATE SONG STATE
  // ======================================================

  const [selectedSong, setSelectedSong] = useState(null);

  const [updateChordUrl, setUpdateChordUrl] = useState("");

  const [showUpdateModal, setShowUpdateModal] =
    useState(false);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // ======================================================
  // FETCH SONGS
  // ======================================================

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(N8N_URL, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil data dari n8n. Status: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Response GET songs:", data);

      if (!data.success) {
        throw new Error(
          data.message || "Gagal mengambil data lagu."
        );
      }

      setSongs(data.data || []);
    } catch (err) {
      console.error("Fetch songs error:", err);

      setError(
        err.message ||
          "Terjadi kesalahan saat mengambil data lagu."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL FETCH
  // ======================================================

  useEffect(() => {
    fetchSongs();
  }, []);

  // ======================================================
  // OPEN ADD MODAL
  // ======================================================

  const openAddModal = () => {
    setSongName("");
    setAddChordUrl("");
    setAddError("");
    setAddSuccess(false);

    setShowAddModal(true);
  };

  // ======================================================
  // SONG SELECTION
  // ======================================================

  const toggleSongSelection = (song) => {
    if (!song.linkChord) return;

    setSelectedSongs((prev) => {
      const exists = prev.some(
        (item) => item.id === song.id
      );

      if (exists) {
        return prev.filter(
          (item) => item.id !== song.id
        );
      }

      return [...prev, song];
    });
  };

  // ======================================================
  // SELECT ALL SONGS
  // ======================================================

  const toggleSelectAll = () => {
    const availableSongs = songs.filter(
      (song) => song.linkChord
    );

    if (
      selectedSongs.length ===
      availableSongs.length
    ) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(availableSongs);
    }
  };

  // ======================================================
  // CLOSE ADD MODAL
  // ======================================================

  const closeAddModal = () => {
    if (addLoading) return;

    setShowAddModal(false);

    setSongName("");
    setAddChordUrl("");
    setAddError("");
  };

  // ======================================================
  // ADD SONG
  // ======================================================

  const handleAddSong = async () => {
    setAddError("");

    // Validasi nama lagu
    if (!songName.trim()) {
      setAddError("Nama lagu wajib diisi.");
      return;
    }

    // Validasi link chord
    if (!addChordUrl.trim()) {
      setAddError("Link chord wajib diisi.");
      return;
    }

    // Validasi URL
    try {
      new URL(addChordUrl.trim());
    } catch {
      setAddError(
        "Link chord harus berupa URL yang valid."
      );
      return;
    }

    try {
      setAddLoading(true);

      const payload = {
        song_name: songName.trim(),
        chord_url: addChordUrl.trim(),
      };

      console.log("Payload ADD:", payload);

      const response = await fetch(N8N_ADD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Response ADD:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menambahkan lagu."
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Gagal menambahkan lagu."
        );
      }

      // Tutup modal add
      setShowAddModal(false);

      // Reset form
      setSongName("");
      setAddChordUrl("");

      // Tampilkan success
      setAddSuccess(true);

      // Refresh data
      await fetchSongs();
    } catch (err) {
      console.error("Add song error:", err);

      setAddError(
        err.message ||
          "Terjadi kesalahan saat menambahkan lagu."
      );
    } finally {
      setAddLoading(false);
    }
  };

  // ======================================================
  // OPEN UPDATE MODAL
  // ======================================================

  const handleUpdate = (song) => {
    setSelectedSong(song);

    setUpdateChordUrl(song.linkChord || "");

    setUpdateError("");
    setUpdateSuccess(false);

    setShowUpdateModal(true);
  };

  // ======================================================
  // OPEN EMAIL MODAL
  // ======================================================

  const openEmailModal = () => {
    setSelectedSongs([]);
    setShowEmailModal(true);
  };

  // ======================================================
  // CLOSE UPDATE MODAL
  // ======================================================

  const closeUpdateModal = () => {
    if (updateLoading) return;

    setShowUpdateModal(false);

    setSelectedSong(null);
    setUpdateChordUrl("");
    setUpdateError("");
  };

  // ======================================================
  // UPDATE SONG
  // ======================================================

  const handleSubmitUpdate = async () => {
    if (!selectedSong) return;

    setUpdateError("");

    // Validasi URL
    if (!updateChordUrl.trim()) {
      setUpdateError("Link chord wajib diisi.");
      return;
    }

    try {
      new URL(updateChordUrl.trim());
    } catch {
      setUpdateError(
        "Link chord harus berupa URL yang valid."
      );
      return;
    }

    // Validasi ID Notion
    if (!selectedSong.id) {
      setUpdateError(
        "ID Notion tidak ditemukan pada data lagu."
      );
      return;
    }

    try {
      setUpdateLoading(true);

      const payload = {
        id: selectedSong.id,
        chord_url: updateChordUrl.trim(),
      };

      console.log("Payload UPDATE:", payload);

      const response = await fetch(N8N_UPDATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Response UPDATE:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengupdate chord."
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Gagal mengupdate chord."
        );
      }

      // Update data di table
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === selectedSong.id
            ? {
                ...song,
                linkChord:
                  updateChordUrl.trim(),
              }
            : song
        )
      );

      // Tutup modal
      setShowUpdateModal(false);

      setSelectedSong(null);
      setUpdateChordUrl("");

      // Tampilkan success
      setUpdateSuccess(true);
    } catch (err) {
      console.error(
        "Update song error:",
        err
      );

      setUpdateError(
        err.message ||
          "Terjadi kesalahan saat mengupdate chord."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // ======================================================
  // SEND EMAIL
  // ======================================================

  const handleSendEmail = async () => {
    if (selectedSongs.length === 0) {
      return;
    }

    try {
      setSendingEmail(true);

      const payload = {
        songs: selectedSongs.map((song) => ({
          id: song.id,
          song_name: song.judulLagu,
          chord_url: song.linkChord,
        })),
      };

      console.log(
        "Payload SEND EMAIL:",
        payload
      );

      const response = await fetch(
        N8N_EMAIL_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "Response SEND EMAIL:",
        responseText
      );

      if (!response.ok) {
        throw new Error(
          `Gagal mengirim email. Status: ${response.status}`
        );
      }

      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "Response dari n8n bukan JSON yang valid."
          );
        }
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Gagal mengirim email."
        );
      }

      // Tutup modal email
      setShowEmailModal(false);

      // Reset pilihan
      setSelectedSongs([]);

      // Tampilkan success
      setEmailSuccess(true);
    } catch (error) {
      console.error(
        "SEND EMAIL ERROR:",
        error
      );

      alert(
        error.message ||
          "Terjadi kesalahan saat mengirim email."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  // ======================================================
  // FILTER + SORT
  // ======================================================

  const filteredSongs = [...songs]
    .filter((song) =>
      song.judulLagu
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) =>
      a.judulLagu.localeCompare(
        b.judulLagu,
        "id",
        {
          sensitivity: "base",
        }
      )
    );

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 dark:bg-neutral-950 transition-colors">
      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
              <Music className="h-5 w-5 text-white dark:text-gray-900" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Song Chords
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Daftar lagu dan link chord untuk kebutuhan pelayanan.
              </p>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex items-center gap-3">

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
                <rect
                  width="20"
                  height="16"
                  x="2"
                  y="4"
                  rx="2"
                />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>

              Kirim ke Email

            </button>

            {/* TAMBAH LAGU */}

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-700"
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

              Tambah Lagu

            </button>

          </div>

        </div>

        {/* ==================================================
            MAIN CARD
        ================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">

          {/* SEARCH */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cari Lagu
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari judul lagu..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500"
            />

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">

              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-500" />

              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Memuat daftar lagu...
              </p>

            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">

              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchSongs}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Coba Lagi
              </button>

            </div>
          )}

          {/* ==================================================
              TABLE
          ================================================== */}

          {!loading && !error && (
            <>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">

                {/* TABLE HEADER */}

                <div className="grid grid-cols-[60px_1fr_280px] items-center border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    No.
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Judul Lagu
                  </p>

                  <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Action
                  </p>

                </div>

                {/* EMPTY DATA */}

                {filteredSongs.length === 0 && (
                  <div className="px-6 py-16 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400 dark:text-neutral-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle
                          cx="6"
                          cy="18"
                          r="3"
                        />
                        <circle
                          cx="18"
                          cy="16"
                          r="3"
                        />
                      </svg>

                    </div>

                    <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {search
                        ? "Lagu tidak ditemukan"
                        : "Belum ada data lagu"}
                    </p>

                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {search
                        ? "Coba gunakan kata kunci pencarian yang lain."
                        : "Data lagu akan muncul setelah berhasil mengambil data dari Notion."}
                    </p>

                  </div>
                )}

                {/* SONG ROWS */}

                {filteredSongs.map(
                  (song, index) => (
                    <div
                      key={
                        song.id || index
                      }
                      className="group grid grid-cols-[60px_1fr_280px] items-center border-b border-gray-100 px-6 py-4 transition last:border-b-0 hover:bg-blue-50/40 dark:border-neutral-800 dark:hover:bg-blue-900/10"
                    >

                      {/* NUMBER */}

                      <div>
                        <span className="text-sm font-medium text-gray-400 dark:text-neutral-500">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>

                      {/* SONG NAME */}

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-gray-900 transition group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                          {song.judulLagu}
                        </p>

                        {song.linkChord && (
                          <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                            Chord tersedia
                          </p>
                        )}

                      </div>

                      {/* ACTION */}

                      <div className="flex items-center justify-center gap-2">

                        {/* BUKA CHORD */}

                        {song.linkChord ? (
                          <a
                            href={
                              song.linkChord
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100 active:scale-[0.97] dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:border-blue-800 dark:hover:bg-blue-900/40"
                          >

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 18V5l12-2v13" />
                              <circle
                                cx="6"
                                cy="18"
                                r="3"
                              />
                              <circle
                                cx="18"
                                cy="16"
                                r="3"
                              />
                            </svg>

                            Buka

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>

                          </a>
                        ) : (
                          <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400 dark:bg-neutral-800 dark:text-neutral-600">
                            Tidak tersedia
                          </span>
                        )}

                        {/* UPDATE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(
                              song
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 active:scale-[0.97] dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
                        >

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>

                          Update

                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* FOOTER */}

              <div className="mt-4 flex items-center justify-between">

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Menampilkan{" "}
                  {
                    filteredSongs.length
                  }{" "}
                  dari{" "}
                  {songs.length}{" "}
                  lagu
                </p>

                <button
                  type="button"
                  onClick={
                    fetchSongs
                  }
                  disabled={loading}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                >
                  ↻ Refresh
                </button>

              </div>
            </>
          )}

        </div>
      </div>

      {/* ======================================================
          ADD SONG MODAL
      ====================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl dark:bg-neutral-900">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Tambah Lagu
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tambahkan judul lagu dan link chord.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeAddModal
                }
                disabled={
                  addLoading
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>

              </button>

            </div>

            {/* SONG NAME */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Lagu
              </label>

              <input
                type="text"
                value={
                  songName
                }
                onChange={(e) =>
                  setSongName(
                    e.target.value
                  )
                }
                placeholder="Contoh: Goodness of God"
                disabled={
                  addLoading
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:disabled:bg-neutral-950"
              />

            </div>

            {/* CHORD URL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Link Chord
              </label>

              <input
                type="url"
                value={
                  addChordUrl
                }
                onChange={(e) =>
                  setAddChordUrl(
                    e.target.value
                  )
                }
                placeholder="https://..."
                disabled={
                  addLoading
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500 dark:disabled:bg-neutral-950"
              />

              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Masukkan link halaman chord lagu.
              </p>

            </div>

            {/* ERROR */}

            {addError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/10">

                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {addError}
                </p>

              </div>
            )}

            {/* BUTTONS */}

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={
                  closeAddModal
                }
                disabled={
                  addLoading
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleAddSong
                }
                disabled={
                  addLoading
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >

                {addLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Lagu"
                )}

              </button>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          EMAIL MODAL
      ====================================================== */}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Kirim Chord ke Email
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Pilih lagu yang ingin dikirim melalui email.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  if (
                    sendingEmail
                  )
                    return;

                  setShowEmailModal(
                    false
                  );
                  setSelectedSongs(
                    []
                  );
                }}
                disabled={
                  sendingEmail
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>

              </button>

            </div>

            {/* SELECT ALL */}

            <div className="border-b border-gray-100 px-6 py-4">

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={
                    songs.filter(
                      (song) =>
                        song.linkChord
                    ).length >
                      0 &&
                    selectedSongs.length ===
                      songs.filter(
                        (song) =>
                          song.linkChord
                      ).length
                  }
                  onChange={
                    toggleSelectAll
                  }
                  disabled={
                    songs.filter(
                      (song) =>
                        song.linkChord
                    ).length ===
                    0
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Pilih Semua
                </span>

                <span className="ml-auto text-xs text-gray-400">
                  {
                    selectedSongs.length
                  }{" "}
                  dipilih
                </span>

              </label>

            </div>

            {/* SONG LIST */}

            <div className="max-h-80 overflow-y-auto px-6 py-3">

              {songs.length ===
              0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Tidak ada lagu.
                </div>
              ) : (
                songs.map(
                  (song) => {

                    const isSelected =
                      selectedSongs.some(
                        (item) =>
                          item.id ===
                          song.id
                      );

                    const hasChord =
                      Boolean(
                        song.linkChord
                      );

                    return (
                      <label
                        key={
                          song.id
                        }
                        className={`mb-2 flex items-center gap-3 rounded-xl border p-4 transition ${
                          !hasChord
                            ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                            : isSelected
                            ? "cursor-pointer border-blue-200 bg-blue-50"
                            : "cursor-pointer border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={
                            isSelected
                          }
                          disabled={
                            !hasChord ||
                            sendingEmail
                          }
                          onChange={() =>
                            toggleSongSelection(
                              song
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium text-gray-900">
                            {
                              song.judulLagu
                            }
                          </p>

                          {hasChord ? (
                            <p className="mt-1 truncate text-xs text-gray-400">
                              {
                                song.linkChord
                              }
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-red-400">
                              Link chord belum tersedia
                            </p>
                          )}

                        </div>

                      </label>
                    );
                  }
                )
              )}

            </div>

            {/* FOOTER */}

            <div className="flex gap-3 border-t border-gray-100 px-6 py-5">

              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(
                    false
                  );
                  setSelectedSongs(
                    []
                  );
                }}
                disabled={
                  sendingEmail
                }
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleSendEmail
                }
                disabled={
                  selectedSongs.length ===
                    0 ||
                  sendingEmail
                }
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {sendingEmail ? (
                  <span className="flex items-center justify-center gap-2">

                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Mengirim...

                  </span>
                ) : (
                  `Kirim ${selectedSongs.length} Lagu`
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          ADD SUCCESS MODAL
      ====================================================== */}

      {addSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500">

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
                  <path d="m5 12 4 4L19 7" />
                </svg>

              </div>

            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              Lagu Berhasil Ditambahkan
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Lagu berhasil ditambahkan ke daftar
              song chords.
            </p>

            <div className="mt-6 rounded-lg border border-green-100 bg-green-50 px-4 py-3">

              <p className="text-sm font-medium text-green-700">
                ✓ Data berhasil disimpan
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setAddSuccess(
                  false
                )
              }
              className="mt-6 w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Selesai
            </button>

          </div>

        </div>
      )}

      {/* ======================================================
          UPDATE MODAL
      ====================================================== */}

      {showUpdateModal &&
        selectedSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">

              <div className="mb-6 flex items-start justify-between">

                <div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    Update Chord
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Ubah link chord lagu.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeUpdateModal
                  }
                  disabled={
                    updateLoading
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>

                </button>

              </div>

              {/* SONG NAME */}

              <div className="mb-5">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Judul Lagu
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                  {
                    selectedSong.judulLagu
                  }
                </div>

              </div>

              {/* CHORD URL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Link Chord
                </label>

                <input
                  type="url"
                  value={
                    updateChordUrl
                  }
                  onChange={(e) =>
                    setUpdateChordUrl(
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  disabled={
                    updateLoading
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Masukkan link chord terbaru.
                </p>

              </div>

              {/* ERROR */}

              {updateError && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm font-medium text-red-700">
                    {
                      updateError
                    }
                  </p>

                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-7 flex gap-3">

                <button
                  type="button"
                  onClick={
                    closeUpdateModal
                  }
                  disabled={
                    updateLoading
                  }
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={
                    handleSubmitUpdate
                  }
                  disabled={
                    updateLoading
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {updateLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    "Update Chord"
                  )}

                </button>

              </div>

            </div>

          </div>
        )}

      {/* ======================================================
          UPDATE SUCCESS MODAL
      ====================================================== */}

      {updateSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500">

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
                  <path d="m5 12 4 4L19 7" />
                </svg>

              </div>

            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              Chord Berhasil Diupdate
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Link chord berhasil diperbarui dan
              perubahan sudah tersimpan.
            </p>

            <div className="mt-6 rounded-lg border border-green-100 bg-green-50 px-4 py-3">

              <p className="text-sm font-medium text-green-700">
                ✓ Update berhasil
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setUpdateSuccess(
                  false
                )
              }
              className="mt-6 w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Selesai
            </button>

          </div>

        </div>
      )}

      {/* ======================================================
          EMAIL SUCCESS MODAL
      ====================================================== */}

      {emailSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">

            {/* ICON */}

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500">

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
                  <path d="m5 12 4 4L19 7" />
                </svg>

              </div>

            </div>

            {/* TITLE */}

            <h2 className="text-xl font-semibold text-gray-900">
              Email Berhasil Dikirim
            </h2>

            {/* DESCRIPTION */}

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Link chord lagu yang dipilih berhasil
              dikirim melalui email.
            </p>

            {/* STATUS */}

            <div className="mt-6 rounded-lg border border-green-100 bg-green-50 px-4 py-3">

              <p className="text-sm font-medium text-green-700">
                ✓ Email berhasil dikirim
              </p>

            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setEmailSuccess(
                  false
                )
              }
              className="mt-6 w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Selesai
            </button>

          </div>

        </div>
      )}

    </main>
  );
}
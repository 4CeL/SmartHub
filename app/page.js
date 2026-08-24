"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderOpen,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import { tools } from "./lib/tools";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ======================================================
  // TOOL DATA
  // ======================================================

  const activeTools = tools.filter(
    (tool) => tool.available
  );

  const comingSoonTools = tools.filter(
    (tool) => !tool.available
  );

  // ======================================================
  // CATEGORY
  // ======================================================

  const categories = [
    "All",
    ...new Set(
      tools
        .map((tool) => tool.category)
        .filter(Boolean)
    ),
  ];

  // ======================================================
  // FILTER ACTIVE TOOLS
  // ======================================================

  const filteredTools = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return activeTools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(keyword) ||
        tool.description
          ?.toLowerCase()
          .includes(keyword) ||
        tool.category
          ?.toLowerCase()
          .includes(keyword);

      const matchesCategory =
        selectedCategory === "All" ||
        tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  // ======================================================
  // STATISTICS
  // ======================================================

  const totalTools = tools.length;

  const totalCategories = new Set(
    tools
      .map((tool) => tool.category)
      .filter(Boolean)
  ).size;

  // ======================================================
  // RESET FILTER
  // ======================================================

  const resetFilter = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            WELCOME HEADER
        ================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-2xl bg-gray-900 px-7 py-8 shadow-sm">

          {/* Decorative background */}

          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">

                <Sparkles className="h-5 w-5 text-blue-400" />

              </div>

              <span className="text-sm font-medium text-blue-400">
                SmartHub
              </span>

            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Selamat datang di SmartHub 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Semua tools yang kamu butuhkan untuk
              membantu pekerjaan sehari-hari, dalam satu
              tempat.
            </p>

          </div>

        </section>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                <Wrench className="h-5 w-5 text-blue-600" />

              </div>

              <span className="text-xs font-medium text-gray-400">
                Total
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-gray-900">
              {totalTools}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              tools terdaftar
            </p>

          </div>

          {/* ACTIVE */}

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">

                <CheckCircle2 className="h-5 w-5 text-green-600" />

              </div>

              <span className="text-xs font-medium text-green-500">
                Active
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-gray-900">
              {activeTools.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              tools siap digunakan
            </p>

          </div>

          {/* COMING SOON */}

          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">

                <Clock3 className="h-5 w-5 text-amber-600" />

              </div>

              <span className="text-xs font-medium text-amber-500">
                Soon
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-gray-900">
              {comingSoonTools.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              tools dalam pengembangan
            </p>

          </div>

        </section>

        {/* ==================================================
            TOOLS SECTION
        ================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <FolderOpen className="h-5 w-5 text-gray-700" />

                <h2 className="text-lg font-semibold text-gray-900">
                  Your Tools
                </h2>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Pilih tools yang ingin kamu gunakan.
              </p>

            </div>

            <div className="text-xs text-gray-400">

              {filteredTools.length} dari{" "}
              {activeTools.length} tools aktif

            </div>

          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="mb-5">

            <div className="relative">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari tools..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* ==================================================
              CATEGORY
          ================================================== */}

          <div className="mb-7 flex flex-wrap gap-2">

            {categories.map((category) => {

              const isActive =
                selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {category}
                </button>
              );
            })}

          </div>

          {/* ==================================================
              ACTIVE TOOLS
          ================================================== */}

          {filteredTools.length > 0 ? (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {filteredTools.map((tool) => {

                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                  >

                    {/* ICON + STATUS */}

                    <div className="flex items-start justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">

                        <Icon className="h-5 w-5" />

                      </div>

                      <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1">

                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                        <span className="text-[10px] font-semibold text-green-600">
                          Available
                        </span>

                      </div>

                    </div>

                    {/* INFO */}

                    <div className="mt-5">

                      <p className="text-xs font-medium text-blue-600">
                        {tool.category}
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-gray-900">
                        {tool.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {tool.description}
                      </p>

                    </div>

                    {/* ACTION */}

                    <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-gray-600 transition group-hover:text-blue-600">

                      Buka Tool

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                    </div>

                  </Link>
                );
              })}

            </div>

          ) : (

            /* ==================================================
                NO RESULT
            ================================================== */

            <div className="py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                <Search className="h-6 w-6 text-gray-400" />

              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-700">
                Tools tidak ditemukan
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Coba gunakan kata kunci atau kategori
                yang berbeda.
              </p>

              <button
                type="button"
                onClick={resetFilter}
                className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-800"
              >
                Reset Filter
              </button>

            </div>

          )}

        </section>

        {/* ==================================================
            COMING SOON
        ================================================== */}

        {comingSoonTools.length > 0 && (
          <section className="mt-8">

            <div className="mb-4">

              <div className="flex items-center gap-2">

                <Clock3 className="h-5 w-5 text-gray-500" />

                <h2 className="text-lg font-semibold text-gray-900">
                  Coming Soon
                </h2>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Beberapa tools sedang dipersiapkan.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {comingSoonTools.map((tool) => {

                const Icon = tool.icon;

                return (
                  <div
                    key={tool.name}
                    className="rounded-2xl border border-dashed border-gray-300 bg-gray-100/60 p-5"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-gray-400">

                        <Icon className="h-5 w-5" />

                      </div>

                      <span className="rounded-full bg-gray-200 px-2.5 py-1 text-[10px] font-semibold text-gray-500">
                        Coming Soon
                      </span>

                    </div>

                    <div className="mt-5">

                      <p className="text-xs font-medium text-gray-400">
                        {tool.category}
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-gray-600">
                        {tool.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
                        {tool.description}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="py-8 text-center">

          <p className="text-xs text-gray-400">
            SmartHub · Everyday Tools
          </p>

        </div>

      </div>
    </main>
  );
}
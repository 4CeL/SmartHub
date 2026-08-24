import {
  Video,
  Music2,
  Wrench,
  Zap,
  NotebookPen,
  BookOpen,
} from "lucide-react";

export const tools = [
  {
    name: "Church Livestream",
    description:
      "Mengatur jadwal livestream dan mempersiapkan kebutuhan livestream.",
    href: "/livestream",
    category: "Automation",
    icon: Video,
    available: true,
  },

  {
    name: "Song Chords",
    description:
      "Mengelola daftar lagu, link chord, dan mengirim chord melalui email.",
    href: "/song-chords",
    category: "Tools",
    icon: Music2,
    available: true,
  },

  {
    name: "Monthly Report Generator",
    description:
      "Generate Monthly Report secara otomatis berdasarkan data yang ada.",
    href: "/internship-report",
    category: "Tools",
    icon: NotebookPen,
    available: true,
  },

  {
    name: "PDF Tools",
    description:
      "Berbagai tools untuk membantu proses pengolahan dokumen PDF.",
    href: "#",
    category: "Utilities",
    icon: Wrench,
    available: false,
  },

  {
    name: "Materi Remaja",
    description:
      "Generate materi persekutuan remaja berdasarkan referensi ayat Alkitab.",
    href: "/materi-persekutuan-remaja",
    category: "Tools",
    icon: BookOpen,
    available: true,
  },

  {
    name: "Automation",
    description:
      "Kumpulan workflow untuk membantu mengotomatisasi pekerjaan.",
    href: "#",
    category: "Automation",
    icon: Zap,
    available: false,
  },
];
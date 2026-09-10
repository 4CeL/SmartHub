import {
  Video,
  Music2,
  Wrench,
  Zap,
  NotebookPen,
  BookOpen,
  Headset,
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
  // {
  //   name: "Multimedia Schedule",
  //   description:
  //     "Jadwal petugas multimedia gereja.",
  //   href: "/multimedia-schedule",
  //   category: "Automation",
  //   icon: Headset,
  //   available: true,
  // },
  {
    name: "Multimedia",
    description:
      "Jadwal petugas multimedia gereja.",
    href: "/multimedia",
    category: "Automation",
    icon: Headset,
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
    name: "Teens Teaching Material",
    description:
      "Generate materi persekutuan remaja berdasarkan referensi ayat Alkitab.",
    href: "/materi-persekutuan-remaja",
    category: "Tools",
    icon: BookOpen,
    available: true,
  },
];
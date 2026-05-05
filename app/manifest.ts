import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PanicProof",
    short_name: "PanicProof",
    description:
      "A calm, deadline-aware action board for consumer-problem evidence and drafts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#256d6a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}

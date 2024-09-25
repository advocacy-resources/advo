import localFont from "next/font/local";

export const anonymousPro = localFont({
  src: [
    {
      path: "../../public/fonts/Anonymous_Pro/AnonymousPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Anonymous_Pro/AnonymousPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Anonymous_Pro/AnonymousPro-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Anonymous_Pro/AnonymousPro-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-anonymous-pro",
});

export const univers = localFont({
  src: "../../public/fonts/Univers/Univers-BlackExt.otf",
  variable: "--font-univers",
});

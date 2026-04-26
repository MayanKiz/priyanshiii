import "./globals.css";
import MusicPlayer from "./MusicPlayer";

export const metadata = {
  title: "Happy Birthday!",
  description: "An animated birthday surprise filled with emotions..."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <MusicPlayer />   {/* 👈 yaha add karo */}
        {children}
      </body>
    </html>
  );
}
import { Comfortaa, Shantell_Sans } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const shantell = Shantell_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Happy Birthday!",
  description: "Celebrate your day with joy and happiness!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${shantell.className} antialiased bg-background select-none min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "Bawaslu Membelajarkan Vol 2",
  description: "Dashboard ranking video pembelajaran Bawaslu se-Indonesia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

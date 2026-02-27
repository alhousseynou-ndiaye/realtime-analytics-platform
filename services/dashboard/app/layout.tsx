export const metadata = {
  title: "Real-time Analytics Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, Arial", margin: 0, background: "#0b0f19", color: "#e6e6e6" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>{children}</div>
      </body>
    </html>
  );
}
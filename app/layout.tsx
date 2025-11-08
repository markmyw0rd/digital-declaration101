// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "AURTTE104 Digital Declaration",
  description: "Student → Supervisor → Assessor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">AC</div>
            <div>
              <h1 className="text-lg font-semibold">AURTTE104 Digital Declaration</h1>
              <p className="text-xs text-slate-600">Student → Supervisor → Assessor</p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-10 text-xs text-slate-500">
          © Allora College — Workplace Training and Assessment | AURTTE104 Declaration
        </footer>
      </body>
    </html>
  );
}

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-6">
          Zenith Field Service
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Single-tenant field service quoting application for managing
          customers, projects, and quotes with ease.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </main>
  );
}

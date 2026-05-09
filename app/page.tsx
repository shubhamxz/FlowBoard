"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const Threads = dynamic(() => import("@/components/Threads"), { ssr: false });

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="hidden lg:block" style={{ position: 'absolute', inset: 0, width: '100%', height: '94%', zIndex: 0 }}>
        <Threads
          color={[0, 0, 0]}
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        <div className="flex items-center px-8 sm:px-12 lg:px-20 py-16">
          <div className="animate-in w-full">
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tighter text-black leading-[0.85]">
              FLOW
            </h1>
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] mb-10" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
              BOARD
            </h1>

            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Manage projects, assign tasks, track progress.
              Built for teams that value clarity over clutter.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-8 sm:px-12 lg:px-16 py-16">
          <div className="animate-in w-full max-w-xl">
            <div className="flex flex-wrap gap-5 mb-16">
              <Link href="/auth/register" className="btn-primary text-base px-14 py-5">
                Create Account
              </Link>
              <Link href="/auth/login" className="btn-outline text-base px-14 py-5">
                Sign In
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200">
              <div className="bg-white p-6">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2">01</p>
                <p className="text-sm font-medium text-gray-700">Projects & Teams</p>
              </div>
              <div className="bg-white p-6">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2">02</p>
                <p className="text-sm font-medium text-gray-700">Task Tracking</p>
              </div>
              <div className="bg-white p-6">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2">03</p>
                <p className="text-sm font-medium text-gray-700">Role-Based Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

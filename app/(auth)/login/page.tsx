import LgnForm from "@/app/(auth)/login/_form/form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduTrack | Login",
  description: "Login page for EduTrack",
};

export default function Home() {
  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Left Side - Graphic Panel */}
      <div className="hidden h-screen w-1/2 items-center justify-center bg-primary md:flex">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Welcome to our&nbsp;
            <span className="text-white/90">Learning Management System</span>
          </h1>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex h-screen w-full items-center justify-center p-4 md:w-1/2 md:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="font-pacifico text-4xl text-primary">EduTrack</h1>
            <p className="mt-2 text-lg text-gray-600/90">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-gray-200/80 bg-secbackground p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            <LgnForm />
          </div>

          <footer className="mt-6 text-center text-sm text-gray-600/90 space-y-1">
            <div>© 2025 EduTrack LMS • Version 1.0.0</div>
            <div>
              Created &amp; Designed by <strong>WebSet</strong>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

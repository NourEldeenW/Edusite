"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeClosed, Loader2 } from "lucide-react";

export default function LgnForm() {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [disabled, setIsdisabled] = useState(false);
  const [wrongdata, setWrongdata] = useState(false);
  const [successData, setsuccessData] = useState(false);
  const baseurl = process.env.NEXT_PUBLIC_localurl;
  const urldata = { username: userName, password };
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const submt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsdisabled(true);
    setWrongdata(false);

    try {
      const res = await axios.post(`${baseurl}auth/login/`, urldata);

      setsuccessData(true);

      if (res.data.redirectto) {
        router.push(res.data.redirectto);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setWrongdata(true);
          setIsdisabled(false);
        }
      } else {
        console.error("Non-Axios error:", error);
      }
    }
  };

  return (
    <form onSubmit={submt} className="space-y-6">
      <div className="space-y-5">
        {/* Username Field */}
        <div className="group">
          <label
            htmlFor="usrname"
            className="mb-1.5 block text-sm font-medium text-text-primary">
            Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-primary/80 transition-colors group-focus-within:text-primary" />
            </div>
            <input
              type="text"
              id="usrname"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
              className={`block w-full rounded-lg border py-3 pl-10 pr-3 text-text-primary transition-all duration-200 placeholder-gray-400 focus:ring-2 outline-none ${
                wrongdata
                  ? "border-error focus:ring-error/20"
                  : "border-border-default focus:border-primary focus:ring-primary/20"
              }`}
              placeholder="Enter your username"
              required
              minLength={4}
              maxLength={15}
              disabled={disabled}
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="group">
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text-primary">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-primary/80 transition-colors group-focus-within:text-primary" />
            </div>
            <input
              type={isVisible ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full rounded-lg border py-3 pl-10 pr-10 text-text-primary transition-all duration-200 placeholder-gray-400 focus:ring-2 outline-none ${
                wrongdata
                  ? "border-error focus:ring-error/20"
                  : "border-border-default focus:border-border-focus focus:ring-primary/20"
              }`}
              placeholder="Enter your password"
              required
              minLength={6}
              maxLength={15}
              disabled={disabled}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary focus:outline-none"
              disabled={disabled}>
              {isVisible ? (
                <EyeClosed className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {wrongdata && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3">
          <svg
            className="h-5 w-5 shrink-0 text-error"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-error">
            Invalid username or password
          </span>
        </div>
      )}

      {/* success message */}
      {successData && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3">
          <svg
            className="h-5 w-5 shrink-0 text-success"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-success">
            Signed in successfully
          </span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled}
        className={`flex w-full items-center justify-center rounded-xl py-3.5 text-lg font-medium text-white transition-all duration-200 ${
          disabled
            ? "cursor-not-allowed bg-disabled"
            : "bg-primary hover:bg-primary/90 active:scale-[98%]"
        }`}>
        {disabled ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {successData ? "Redirecting..." : "Signing in..."}
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("member");
  const [attendance, setAttendance] = useState(false);
  const [timesheet, setTimesheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name must be filled out";
    if (!lastName.trim()) errs.lastName = "Last name must be filled out";
    if (!phone.trim() || phone.length < 4) errs.phone = "Please enter valid phone number";
    if (!password || password.length < 6) errs.password = "Password must be filled out";
    if (!role) errs.role = "Role must be selected";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, password, role, attendance, timesheet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
      setTimeout(() => (window.location.href = "/auth/login"), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center border-r border-gray-200 relative bg-gray-50">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="text-center relative z-10">
          <h1 className="text-5xl font-bold tracking-tighter text-black mb-1">FLOW</h1>
          <h1 className="text-5xl font-bold tracking-tighter" style={{ WebkitTextStroke: '1.5px black', color: 'transparent' }}>BOARD</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-6">Task Management System</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-in">
          <Link href="/" className="section-title hover:text-black block mb-8">← Home</Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter text-black mb-1">ADD TEAM MEMBER</h1>
            <div className="w-full h-px bg-gray-200 mt-4 relative">
              <div className="absolute left-0 top-0 w-1/3 h-px bg-black" />
            </div>
          </div>

          {error && <div className="alert-error mb-6">✕ {error}</div>}
          {success && <div className="alert-success mb-6">✓ Account created. Redirecting...</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="First Name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {fieldErrors.lastName && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
              )}
            </div>

            <div>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Role must be selected *</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              {fieldErrors.role && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.role}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <select defaultValue="+91" className="col-span-1">
                <option value="+91">(+91) India</option>
                <option value="+1">(+1) USA</option>
                <option value="+44">(+44) UK</option>
                <option value="+61">(+61) AU</option>
              </select>
              <div className="col-span-2">
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-sm"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Attendance</span>
                <div className="radio-group">
                  <label>
                    <input type="radio" name="attendance" checked={attendance} onChange={() => setAttendance(true)} />
                    <span>Yes</span>
                  </label>
                  <label>
                    <input type="radio" name="attendance" checked={!attendance} onChange={() => setAttendance(false)} />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Timesheet</span>
                <div className="radio-group">
                  <label>
                    <input type="radio" name="timesheet" checked={timesheet} onChange={() => setTimesheet(true)} />
                    <span>Yes</span>
                  </label>
                  <label>
                    <input type="radio" name="timesheet" checked={!timesheet} onChange={() => setTimesheet(false)} />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading || success} className="btn-primary w-full disabled:opacity-50">
                {loading ? "Creating..." : "Save"}
              </button>
            </div>
          </form>

          <div className="divider my-6" />
          <p className="text-xs text-gray-500 text-center">
            Have an account?{" "}
            <Link href="/auth/login" className="text-black underline underline-offset-4 hover:no-underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

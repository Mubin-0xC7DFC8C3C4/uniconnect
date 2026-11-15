import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/data/demo";
import { isEmail } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { BootScreen } from "@/components/shell/boot-screen";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";

export function LoginPage() {
  const hydrated = useAppStore((state) => state.hydrated);
  const signedIn = useAppStore((state) => state.signedIn);
  const signIn = useAppStore((state) => state.signIn);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    studentId?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});

  useEffect(() => {
    if (hydrated && signedIn) void navigate({ to: "/dashboard", replace: true });
  }, [hydrated, signedIn, navigate]);

  if (!hydrated || signedIn) return <BootScreen />;

  function switchMode(nextMode: "login" | "signup" | "forgot") {
    setMode(nextMode);
    setErrors({});
    setResetSent(false);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: {
      name?: string;
      studentId?: string;
      email?: string;
      password?: string;
      form?: string;
    } = {};
    const trimmedEmail = email.trim();

    if (mode === "forgot") {
      if (!trimmedEmail) {
        next.email = "Enter your university email address.";
      } else if (!isEmail(trimmedEmail)) {
        next.email = "Enter a valid email address.";
      }
      setErrors(next);
      if (Object.keys(next).length > 0) return;

      setResetSent(true);
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        next.name = "Enter your full name.";
      }
      if (!studentId.trim()) {
        next.studentId = "Enter your university student ID.";
      }
    }

    if (!trimmedEmail) {
      next.email = "Enter your university email address.";
    } else if (!isEmail(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Enter your password.";
    } else if (mode === "signup" && password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    if (
      mode === "login" &&
      !next.email &&
      !next.password &&
      (trimmedEmail.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD)
    ) {
      next.form = "Incorrect email or password. Please check your credentials and try again.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (mode === "signup") {
      updateProfile({
        name: fullName.trim(),
        studentId: studentId.trim(),
        email: trimmedEmail.toLowerCase(),
      });
    }

    signIn();
    void navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="grid min-h-dvh bg-bg text-fg lg:grid-cols-2">
      {/* Subtle slow motion zoom animation for the full-bleed campus photo */}
      <style>{`
        @keyframes authSlowZoom {
          0% {
            opacity: 0.7;
            transform: scale(1.07);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-auth-bg {
          animation: authSlowZoom 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Left Half: Clean Form Column */}
      <div className="flex flex-col justify-between px-6 py-6 md:px-12 md:py-8">
        {/* Top Brand & Back Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center border border-line bg-surface font-semibold tracking-tight text-fg r-sm">
              U
            </span>
            <span className="type-sm font-medium text-fg">UniConnect</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 type-sm text-muted transition-ui hover:text-fg"
          >
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Centered Auth Form */}
        <div className="mx-auto my-auto w-full max-w-md py-10">
          {mode !== "forgot" ? (
            <form onSubmit={onSubmit} noValidate>
              {/* Log in / Sign up Switcher */}
              <div className="grid grid-cols-2 gap-1.5 border border-line bg-sunken p-1.5 r-md">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`py-2 type-sm font-medium r-sm transition-ui ${
                    mode === "login"
                      ? "bg-fg text-bg shadow-sm"
                      : "text-muted hover:bg-surface/60 hover:text-fg"
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`py-2 type-sm font-medium r-sm transition-ui ${
                    mode === "signup"
                      ? "bg-fg text-bg shadow-sm"
                      : "text-muted hover:bg-surface/60 hover:text-fg"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <h1 className="mt-6 type-2xl font-semibold text-fg">
                {mode === "login" ? "Welcome back" : "Create your student account"}
              </h1>
              <p className="mt-2 type-sm text-muted">
                {mode === "login"
                  ? "Sign in with your university email and password to access your portal."
                  : "Register with your Metropolitan University credentials to get started."}
              </p>

              <div className="mt-6 flex flex-col gap-4">
                {mode === "signup" ? (
                  <>
                    <Field label="Full Name" htmlFor="fullName" error={errors.name}>
                      <TextInput
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="e.g. Tahmid Anwar Mubin"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </Field>

                    <Field label="Student ID" htmlFor="studentId" error={errors.studentId}>
                      <TextInput
                        id="studentId"
                        name="studentId"
                        type="text"
                        placeholder="e.g. 232-115-310"
                        value={studentId}
                        onChange={(event) => setStudentId(event.target.value)}
                      />
                    </Field>
                  </>
                ) : null}

                <Field label="University Email" htmlFor="email" error={errors.email}>
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="student@metrouni.edu.bd"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </Field>

                <div>
                  <Field label="Password" htmlFor="password" error={errors.password}>
                    <div className="flex gap-2">
                      <TextInput
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      <button
                        type="button"
                        className="min-h-11 shrink-0 border border-line px-3 type-sm r-md hover:bg-sunken"
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  {mode === "login" ? (
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 type-xs text-muted select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="size-3.5 rounded border-line accent-fg"
                        />
                        <span>Remember me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="type-xs font-medium text-fg underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {errors.form ? (
                <p role="alert" className="mt-4 type-sm text-danger">
                  {errors.form}
                </p>
              ) : null}

              <Button type="submit" className="mt-6 w-full">
                {mode === "login" ? "Log in" : "Create account"}
              </Button>
            </form>
          ) : (
            /* =========================================================
               FORGOT PASSWORD VIEW
               ========================================================= */
            <div>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="inline-flex items-center gap-1.5 type-xs font-medium text-muted transition-ui hover:text-fg"
              >
                <ArrowLeft size={14} />
                <span>Back to log in</span>
              </button>

              <h1 className="mt-5 type-2xl font-semibold text-fg">Reset your password</h1>
              <p className="mt-2 type-sm text-muted">
                Enter your registered Metropolitan University email address and we will send you a password reset link.
              </p>

              {resetSent ? (
                <div className="mt-6 border border-line bg-surface p-5 r-md">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-fg" />
                    <div>
                      <p className="type-sm font-medium text-fg">Password reset link sent</p>
                      <p className="mt-1 type-xs leading-relaxed text-muted">
                        We have sent password recovery instructions to{" "}
                        <span className="font-medium text-fg">{email.trim()}</span>. Please check your inbox and spam
                        folder.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="mt-5 w-full"
                    onClick={() => switchMode("login")}
                  >
                    Return to Log in
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
                  <Field label="University Email" htmlFor="reset-email" error={errors.email}>
                    <div className="relative">
                      <TextInput
                        id="reset-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="student@metrouni.edu.bd"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        aria-invalid={Boolean(errors.email)}
                      />
                    </div>
                  </Field>

                  <Button type="submit" className="mt-2 w-full">
                    <Mail size={16} className="mr-2" />
                    <span>Send reset link</span>
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="type-xs text-faint">© 2026 UniConnect · Metropolitan University</p>
      </div>

      {/* Right Half: Full-Bleed Borderless Campus Image */}
      <div className="relative hidden overflow-hidden border-l border-line bg-sunken lg:block">
        <img
          src="/dashboard-hero.jpg"
          alt="Metropolitan University Campus"
          className="animate-auth-bg absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
        <div className="absolute right-10 bottom-10 left-10 text-white">
          <p className="type-label text-white/80">Metropolitan University</p>
          <h2 className="mt-2 type-2xl font-medium text-white">
            Classes, notices, and academic schedules in one place.
          </h2>
          <p className="mt-2 max-w-md type-sm text-white/80">
            Sign in with your university credentials to access your weekly routine, courses, and semester results.
          </p>
        </div>
      </div>
    </div>
  );
}
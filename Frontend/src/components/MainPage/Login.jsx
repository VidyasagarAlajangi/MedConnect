import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../utils/authSlice";
import { toast } from "react-hot-toast";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793l6.598 3.185c.206.1.446.1.652 0L15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2V4.5A3.5 3.5 0 0 0 8 1Zm2 5V4.5a2 2 0 1 0-4 0V6h4Zm-2 3a1 1 0 0 1 .993.883L9 10v1.5a1 1 0 0 1-1.993.117L7 11.5V10a1 1 0 0 1 1-1Z" clipRule="evenodd" />
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M8 .5a.5.5 0 0 1 .293.085l7 4.5A.5.5 0 0 1 15.5 5.5v5a.5.5 0 0 1-.207.407l-7 5A.5.5 0 0 1 8 16a.5.5 0 0 1-.293-.093l-7-5A.5.5 0 0 1 .5 10.5v-5a.5.5 0 0 1 .207-.415l7-4.5A.5.5 0 0 1 8 .5Z" clipRule="evenodd" />
  </svg>
);
const IconSpinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ── Field wrapper (matches Register) ─────────────────────────────────────────
function Field({ label, icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 px-3 rounded-lg border bg-slate-50 transition-all duration-150"
        style={{ borderColor: error ? "#ef4444" : "#e2e8f0" }}
        data-field-wrap
      >
        <span style={{ color: BRAND }} className="flex-shrink-0 flex items-center">
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="text-xs text-red-500">⚠ {error}</p>}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [userType, setUserType] = useState("patient");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const email = watch("email");
  const isAdmin = email === "admin@gmail.com";

  useEffect(() => {
    if (isAdmin) setUserType("admin");
  }, [isAdmin]);

  const onSubmit = async (data) => {
    try {
      const role = data.email === "admin@gmail.com" ? "admin" : userType;
      const result = await dispatch(login({ ...data, role })).unwrap();

      if (result.user.role === "doctor") navigate("/doctor-dashboard", { replace: true });
      else if (result.user.role === "admin") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      toast.error(err || "Login failed. Please try again.");
    }
  };

  const inputCls =
    "flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300 min-w-0";

  return (
    <>
      <style>{`
        [data-field-wrap]:focus-within {
          border-color: ${BRAND} !important;
          box-shadow: 0 0 0 3px ${BRAND}26;
          background-color: #fff !important;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ backgroundColor: BRAND_LIGHT }}
      >
        <div className="w-full max-w-md">

          {/* ── Card ── */}
          <div
            className="bg-white rounded-2xl overflow-hidden fade-up"
            style={{
              boxShadow: "0 2px 8px rgba(74,144,226,0.10), 0 8px 32px rgba(74,144,226,0.08)",
              border: "1px solid #dbeafe",
            }}
          >
            {/* Accent bar */}
            <div className="h-1" style={{ backgroundColor: BRAND }} />

            {/* Header */}
            <div className="px-8 pt-7 pb-0">

              <h1 className="text-[22px] font-bold text-slate-800 tracking-tight leading-tight">
                Welcome back
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Sign in to access your account.
              </p>
            </div>

            {/* Divider */}
            <div className="mx-8 mt-5 border-t border-slate-100" />

            {/* Form body */}
            <div className="px-8 py-6">

              {/* Role toggle / admin badge */}
              {isAdmin ? (
                <div
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg mb-5 text-sm font-medium"
                  style={{
                    backgroundColor: `${BRAND}14`,
                    color: BRAND_DARK,
                    border: `1px solid ${BRAND}33`,
                  }}
                >
                  <IconShield />
                  Signing in as Administrator
                </div>
              ) : (
                <div
                  className="flex gap-1.5 mb-5 p-1 rounded-xl"
                  style={{ backgroundColor: "#f1f5f9" }}
                >
                  {["patient", "doctor"].map((type) => {
                    const active = userType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUserType(type)}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-150"
                        style={{
                          backgroundColor: active ? "#fff" : "transparent",
                          color: active ? BRAND : "#94a3b8",
                          boxShadow: active
                            ? "0 1px 4px rgba(74,144,226,0.15)"
                            : "none",
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Server error */}
              {error && (
                <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg mb-4 text-sm text-red-600 bg-red-50 border border-red-100">
                  <span className="mt-px">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col gap-4">

                  <Field label="Email address" icon={<IconMail />} error={errors.email?.message}>
                    <input
                      type="email"
                      className={inputCls}
                      placeholder="you@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                  </Field>

                  <Field label="Password" icon={<IconLock />} error={errors.password?.message}>
                    <input
                      type="password"
                      className={inputCls}
                      placeholder="••••••••"
                      {...register("password", { required: "Password is required" })}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[.98] disabled:opacity-60"
                    style={{ backgroundColor: BRAND }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRAND)}
                  >
                    {loading ? (
                      <><IconSpinner /> Signing in…</>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>

                {/* Register link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="font-semibold underline underline-offset-2 transition-colors"
                    style={{ color: BRAND }}
                    onMouseEnter={e => (e.currentTarget.style.color = BRAND_DARK)}
                    onMouseLeave={e => (e.currentTarget.style.color = BRAND)}
                  >
                    Register
                  </button>
                </p>
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-slate-400 leading-relaxed">
            By signing in you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-2 transition-colors"
              style={{ color: BRAND }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-2 transition-colors"
              style={{ color: BRAND }}
            >
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </>
  );
}
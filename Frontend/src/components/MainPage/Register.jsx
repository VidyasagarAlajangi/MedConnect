import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, registerUser } from "../../utils/authSlice";
import { toast } from "react-hot-toast";

// Brand colour token — one place to change it
const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
  </svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793l6.598 3.185c.206.1.446.1.652 0L15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
  </svg>
);
const IconPhone = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511Z" clipRule="evenodd" />
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2V4.5A3.5 3.5 0 0 0 8 1Zm2 5V4.5a2 2 0 1 0-4 0V6h4Zm-2 3a1 1 0 0 1 .993.883L9 10v1.5a1 1 0 0 1-1.993.117L7 11.5V10a1 1 0 0 1 1-1Z" clipRule="evenodd" />
  </svg>
);
const IconAge = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);
const IconDroplet = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 16a6 6 0 0 0 6-6c0-1.655-1.122-2.904-2.432-4.362C10.254 4.176 8.75 2.503 8 0c0 0-6 5.686-6 10a6 6 0 0 0 6 6ZM6.646 4.646l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448c.82-1.641 1.717-2.753 2.093-3.13Z" />
  </svg>
);
const IconClipboard = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1Zm-5 0A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5v-1Zm-2 0h1v1H3a1 1 0 0 0-1 1V14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3.5a1 1 0 0 0-1-1h-1v-1h1a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2Z" clipRule="evenodd" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
  </svg>
);
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
  </svg>
);
const IconSpinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ── Field wrapper ─────────────────────────────────────────────────────────────
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
      {error && (
        <p className="text-xs text-red-500">⚠ {error}</p>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      name: "", email: "", phone: "", password: "",
      age: "", bloodType: "A+", medicalIssues: "",
    },
  });

  const onSubmit = async (data) => {
    if (step === "personal") {
      const isValid = await trigger(["name", "email", "phone", "password"]);
      if (isValid) setStep("medical");
    } else {
      setIsLoading(true);
      try {
        const result = await dispatch(registerUser({ ...data, role: "patient" })).unwrap();
        if (result.success) {
          toast.success("Registration successful!");
          await dispatch(login({ email: data.email, password: data.password, role: "patient" })).unwrap();
          navigate("/", { replace: true });
        }
      } catch (error) {
        toast.error(error || "Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isPersonal = step === "personal";
  const inputCls = "flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300 min-w-0";

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
        className="min-h-screen flex items-center justify-center px-4 py-6"
        style={{ backgroundColor: BRAND_LIGHT }}
      >
        <div className="w-full max-w-md">

          {/* ── Card ── */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(74,144,226,0.10), 0 8px 32px rgba(74,144,226,0.08)", border: "1px solid #dbeafe" }}>

            {/* Top accent bar */}
            <div className="h-1" style={{ backgroundColor: BRAND }} />

            {/* Header */}
            <div className="px-8 pt-4 pb-0">
              <h1 className="text-[22px] font-bold text-slate-800 tracking-tight leading-tight">
                Create your account
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {isPersonal ? "Start with your basic details." : "Tell us a little about your health."}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 px-8 pt-5">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: isPersonal ? BRAND : BRAND_LIGHT,
                    color: isPersonal ? "#fff" : BRAND,
                    border: `2px solid ${BRAND}`,
                  }}
                >
                  {!isPersonal ? "✓" : "1"}
                </div>
                <span className="text-xs font-semibold" style={{ color: isPersonal ? BRAND : BRAND_DARK }}>
                  Personal
                </span>
              </div>

              {/* Connector line */}
              <div
                className="flex-1 h-px transition-all duration-300"
                style={{ backgroundColor: isPersonal ? "#dbeafe" : BRAND }}
              />

              {/* Step 2 */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: !isPersonal ? BRAND : "transparent",
                    color: !isPersonal ? "#fff" : "#94a3b8",
                    border: `2px solid ${!isPersonal ? BRAND : "#cbd5e1"}`,
                  }}
                >
                  2
                </div>
                <span
                  className="text-xs font-semibold transition-colors duration-200"
                  style={{ color: !isPersonal ? BRAND : "#94a3b8" }}
                >
                  Medical
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-8 mt-5 border-t border-slate-100" />

            {/* Form body */}
            <div className="px-8 py-4">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {isPersonal ? (
                  <div className="flex flex-col gap-4 fade-up">
                    <Field label="Full name" icon={<IconUser />} error={errors.name?.message}>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Jane Smith"
                        {...register("name", { required: "Name is required" })}
                      />
                    </Field>

                    <Field label="Email address" icon={<IconMail />} error={errors.email?.message}>
                      <input
                        type="email"
                        className={inputCls}
                        placeholder="jane@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                    </Field>

                    <Field label="Phone number" icon={<IconPhone />} error={errors.phone?.message}>
                      <input
                        type="tel"
                        className={inputCls}
                        placeholder="(123) 456-7890"
                        {...register("phone", { required: "Phone number is required" })}
                      />
                    </Field>

                    <Field label="Password" icon={<IconLock />} error={errors.password?.message}>
                      <input
                        type="password"
                        className={inputCls}
                        placeholder="Min. 6 characters"
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Password must be at least 6 characters" },
                        })}
                      />
                    </Field>

                    <button
                      type="submit"
                      className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[.98]"
                      style={{ backgroundColor: BRAND }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRAND)}
                    >
                      Continue <IconArrowRight />
                    </button>
                  </div>

                ) : (
                  <div className="flex flex-col gap-4 fade-up">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Age" icon={<IconAge />} error={errors.age?.message}>
                        <input
                          type="number"
                          min="1" max="120"
                          className={inputCls}
                          placeholder="32"
                          {...register("age", {
                            required: "Age is required",
                            min: { value: 1, message: "Invalid age" },
                          })}
                        />
                      </Field>

                      <Field label="Blood type" icon={<IconDroplet />} error={errors.bloodType?.message}>
                        <select
                          className={`${inputCls} cursor-pointer`}
                          {...register("bloodType", { required: true })}
                        >
                          {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </Field>
                    </div>

                    <Field label="Medical history" icon={<IconClipboard />} error={errors.medicalIssues?.message}>
                      <textarea
                        rows={3}
                        className={`${inputCls} resize-y py-3`}
                        placeholder="Known conditions, allergies, ongoing treatments…"
                        {...register("medicalIssues")}
                      />
                    </Field>

                    <div className="flex gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setStep("personal")}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg border text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all duration-150 disabled:opacity-50"
                        style={{ borderColor: "#dbeafe" }}
                      >
                        <IconArrowLeft /> Back
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[.98] disabled:opacity-60"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRAND)}
                      >
                        {isLoading ? (
                          <><IconSpinner /> Registering…</>
                        ) : (
                          <>Create account <IconArrowRight /></>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sign-in link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-semibold underline underline-offset-2 transition-colors"
                    style={{ color: BRAND }}
                    onMouseEnter={e => (e.currentTarget.style.color = BRAND_DARK)}
                    onMouseLeave={e => (e.currentTarget.style.color = BRAND)}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-slate-400 leading-relaxed">
            By registering you agree to our{" "}
            <a href="#" className="underline underline-offset-2 transition-colors" style={{ color: BRAND }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 transition-colors" style={{ color: BRAND }}>
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </>
  );
}
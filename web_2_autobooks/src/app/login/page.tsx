"use client";

import { type FormEvent, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SeedLink } from "@/components/ui/SeedLink";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { BookOpen, LogIn, Lock, User } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local text variants for login page
  const dynamicV3TextVariants: Record<string, string[]> = {
    login_title: ["Welcome Back", "Sign In", "Login"],
    login_description: [
      "Sign in to access your book curator dashboard",
      "Access your personalized book collection",
      "Enter your credentials to continue"
    ],
    username_label: ["Username", "User Name", "Account Name"],
    password_label: ["Password", "Pass", "Security Key"],
    username_placeholder: ["Enter your username", "Type your username", "Your username here"],
    password_placeholder: ["Enter your password", "Type your password", "Your password here"],
    submit_button: ["Sign in", "Login", "Access Account"],
    submitting_button: ["Signing in…", "Logging in…", "Accessing…"],
    need_account: ["Need an account?", "Don't have an account?", "New user?"],
    create_one: ["Create one", "Sign up", "Register"],
    footer_note: [
      "Each user can only manage their assigned book. Once signed in, visit your profile to review or simulate edits.",
      "Users can manage their assigned book. Sign in to access your profile and make edits.",
      "Access your assigned book through your profile after signing in."
    ],
    error_prefix: ["Unable to log in", "Login failed", "Authentication error"]
  };

  // Dynamic ordering for form fields
  const formFields = useMemo(() => {
    const fields = [
      { key: "username", component: "username" },
      { key: "password", component: "password" }
    ];
    const order = dyn.v1.changeOrderElements("login-form-fields", fields.length);
    return order.map((idx) => fields[idx]);
  }, [dyn.seed]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username.trim(), password.trim());
      setUsername("");
      setPassword("");
      router.push("/profile");
    } catch (err) {
      const usernameValue = username.trim() || username;
      logEvent(EVENT_TYPES.LOGIN_FAILURE, { username: usernameValue, reason: (err as Error).message || "login_error" });
      setError((err as Error).message || "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen flex items-center justify-center">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <main 
        id={dyn.v3.getVariant("login-main", ID_VARIANTS_MAP, "login-main")}
        className={cn(
          "relative mx-auto w-full max-w-md px-6 py-12",
          dyn.v3.getVariant("login-main", CLASS_VARIANTS_MAP, "")
        )}
      >
        {dyn.v1.addWrapDecoy("login-main-container", (
          <div className="space-y-8">
            {/* Header */}
            {dyn.v1.addWrapDecoy("login-header", (
              <div 
                id={dyn.v3.getVariant("login-header", ID_VARIANTS_MAP, "login-header")}
                className={cn(
                  "text-center",
                  dyn.v3.getVariant("login-header", CLASS_VARIANTS_MAP, "")
                )}
              >
                {dyn.v1.addWrapDecoy("login-icon-container", (
                  <div 
                    id={dyn.v3.getVariant("login-icon-container", ID_VARIANTS_MAP, "login-icon-container")}
                    className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 border border-secondary/30 mb-4",
                      dyn.v3.getVariant("icon-container", CLASS_VARIANTS_MAP, "")
                    )}
                  >
                    <BookOpen 
                      id={dyn.v3.getVariant("login-icon", ID_VARIANTS_MAP, "login-icon")}
                      className={cn("h-8 w-8 text-secondary", dyn.v3.getVariant("icon-book", CLASS_VARIANTS_MAP, ""))} 
                    />
                  </div>
                ))}
                <h1 
                  id={dyn.v3.getVariant("login-title", ID_VARIANTS_MAP, "login-title")}
                  className={cn(
                    "text-4xl md:text-5xl font-bold text-white mb-3",
                    dyn.v3.getVariant("page-title", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {dyn.v3.getVariant("login_title", dynamicV3TextVariants, "Welcome Back")}
                </h1>
                <p 
                  id={dyn.v3.getVariant("login-description", ID_VARIANTS_MAP, "login-description")}
                  className={cn(
                    "text-lg text-white/70",
                    dyn.v3.getVariant("page-description", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {dyn.v3.getVariant("login_description", dynamicV3TextVariants, "Sign in to access your book curator dashboard")}
                </p>
              </div>
            ))}

            {/* Login Form */}
            {dyn.v1.addWrapDecoy("login-form-container", (
              <div 
                id={dyn.v3.getVariant("login-form-container", ID_VARIANTS_MAP, "login-form-container")}
                className={cn(
                  "relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl",
                  dyn.v3.getVariant("form-container", CLASS_VARIANTS_MAP, "")
                )}
              >
                <form 
                  id={dyn.v3.getVariant("login-form", ID_VARIANTS_MAP, "login-form")}
                  className={cn(
                    "space-y-6",
                    dyn.v3.getVariant("form", CLASS_VARIANTS_MAP, "")
                  )}
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-5">
                    {formFields.map((field) => {
                      if (field.key === "username") {
                        return (
                          <div key="username">
                            {dyn.v1.addWrapDecoy("username-field", (
                              <div>
                                <label 
                                  id={dyn.v3.getVariant("username-label", ID_VARIANTS_MAP, "username-label")}
                                  className={cn(
                                    "flex items-center gap-2 text-sm font-semibold text-white/80 mb-2",
                                    dyn.v3.getVariant("form-label", CLASS_VARIANTS_MAP, "")
                                  )}
                                >
                                  <User 
                                    id={dyn.v3.getVariant("username-icon", ID_VARIANTS_MAP, "username-icon")}
                                    className={cn("h-4 w-4 text-secondary", dyn.v3.getVariant("icon-user", CLASS_VARIANTS_MAP, ""))} 
                                  />
                                  {dyn.v3.getVariant("username_label", dynamicV3TextVariants, "Username")}
                                </label>
                                {dyn.v1.addWrapDecoy("username-input-container", (
                                  <Input
                                    id={dyn.v3.getVariant("username-input", ID_VARIANTS_MAP, "username-input")}
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    className={cn(
                                      "h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                                      dyn.v3.getVariant("form-input", CLASS_VARIANTS_MAP, "")
                                    )}
                                    placeholder={dyn.v3.getVariant("username_placeholder", dynamicV3TextVariants, "Enter your username")}
                                    autoComplete="username"
                                    required
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      if (field.key === "password") {
                        return (
                          <div key="password">
                            {dyn.v1.addWrapDecoy("password-field", (
                              <div>
                                <label 
                                  id={dyn.v3.getVariant("password-label", ID_VARIANTS_MAP, "password-label")}
                                  className={cn(
                                    "flex items-center gap-2 text-sm font-semibold text-white/80 mb-2",
                                    dyn.v3.getVariant("form-label", CLASS_VARIANTS_MAP, "")
                                  )}
                                >
                                  <Lock 
                                    id={dyn.v3.getVariant("password-icon", ID_VARIANTS_MAP, "password-icon")}
                                    className={cn("h-4 w-4 text-secondary", dyn.v3.getVariant("icon-lock", CLASS_VARIANTS_MAP, ""))} 
                                  />
                                  {dyn.v3.getVariant("password_label", dynamicV3TextVariants, "Password")}
                                </label>
                                {dyn.v1.addWrapDecoy("password-input-container", (
                                  <Input
                                    id={dyn.v3.getVariant("password-input", ID_VARIANTS_MAP, "password-input")}
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className={cn(
                                      "h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                                      dyn.v3.getVariant("form-input", CLASS_VARIANTS_MAP, "")
                                    )}
                                    placeholder={dyn.v3.getVariant("password_placeholder", dynamicV3TextVariants, "Enter your password")}
                                    autoComplete="current-password"
                                    required
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {error && (
                    <div 
                      id={dyn.v3.getVariant("login-error", ID_VARIANTS_MAP, "login-error")}
                      className={cn(
                        "rounded-xl border border-red-400/30 bg-red-400/10 p-4",
                        dyn.v3.getVariant("error-message", CLASS_VARIANTS_MAP, "")
                      )}
                    >
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  )}

                  {dyn.v1.addWrapDecoy("login-submit-button", (
                    <Button 
                      id={dyn.v3.getVariant("login-submit-button", ID_VARIANTS_MAP, "login-submit-button")}
                      type="submit" 
                      className={cn(
                        "w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105",
                        dyn.v3.getVariant("submit-button", CLASS_VARIANTS_MAP, "")
                      )}
                      disabled={isSubmitting}
                    >
                      <LogIn 
                        id={dyn.v3.getVariant("login-submit-icon", ID_VARIANTS_MAP, "login-submit-icon")}
                        className={cn("h-5 w-5 mr-2", dyn.v3.getVariant("icon-login", CLASS_VARIANTS_MAP, ""))} 
                      />
                      {isSubmitting 
                        ? dyn.v3.getVariant("submitting_button", dynamicV3TextVariants, "Signing in…")
                        : dyn.v3.getVariant("submit_button", dynamicV3TextVariants, "Sign in")
                      }
                    </Button>
                  ))}
                </form>
              </div>
            ))}

            {/* Footer Links */}
            {dyn.v1.addWrapDecoy("login-footer", (
              <div 
                id={dyn.v3.getVariant("login-footer", ID_VARIANTS_MAP, "login-footer")}
                className={cn(
                  "text-center space-y-3",
                  dyn.v3.getVariant("page-footer", CLASS_VARIANTS_MAP, "")
                )}
              >
                <p 
                  id={dyn.v3.getVariant("login-footer-text", ID_VARIANTS_MAP, "login-footer-text")}
                  className={cn(
                    "text-sm text-white/60",
                    dyn.v3.getVariant("footer-text", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {dyn.v3.getVariant("need_account", dynamicV3TextVariants, "Need an account?")}{" "}
                  <SeedLink 
                    id={dyn.v3.getVariant("login-signup-link", ID_VARIANTS_MAP, "login-signup-link")}
                    href="/signup" 
                    className={cn(
                      "font-semibold text-secondary hover:text-secondary/80 transition-colors",
                      dyn.v3.getVariant("footer-link", CLASS_VARIANTS_MAP, "")
                    )}
                  >
                    {dyn.v3.getVariant("create_one", dynamicV3TextVariants, "Create one")}
                  </SeedLink>
                </p>
                <p 
                  id={dyn.v3.getVariant("login-footer-note", ID_VARIANTS_MAP, "login-footer-note")}
                  className={cn(
                    "text-xs text-white/50 max-w-md mx-auto",
                    dyn.v3.getVariant("footer-note", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {dyn.v3.getVariant("footer_note", dynamicV3TextVariants, "Each user can only manage their assigned book. Once signed in, visit your profile to review or simulate edits.")}
                </p>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

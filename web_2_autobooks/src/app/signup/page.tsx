"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeedLink } from "@/components/ui/SeedLink";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { getBooks } from "@/dynamic/v2";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { BookOpen, UserPlus, Lock, User, Book as BookIcon } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

const MIN_PASSWORD_LENGTH = 6;
const FALLBACK_BOOK_ID = "book-v2-001";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [assignedBook, setAssignedBook] = useState(FALLBACK_BOOK_ID);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local text variants for signup page
  const dynamicV3TextVariants: Record<string, string[]> = {
    signup_title: ["Create Account", "Sign Up", "Register"],
    signup_description: [
      "Join Autobooks and start curating your favorite books",
      "Start your book collection journey",
      "Become a member and explore books"
    ],
    username_label: ["Username", "User Name", "Account Name"],
    password_label: ["Password", "Pass", "Security Key"],
    confirm_password_label: ["Confirm Password", "Re-enter Password", "Verify Password"],
    assign_book_label: ["Assign Book", "Select Book", "Choose Book"],
    username_placeholder: ["Choose a username", "Pick a username", "Enter username"],
    password_placeholder: ["Create a password", "Set a password", "Enter password"],
    confirm_password_placeholder: ["Confirm your password", "Re-enter password", "Verify password"],
    password_minimum: ["Minimum {MIN} characters", "At least {MIN} characters", "Requires {MIN} characters"],
    assign_book_help: ["Select a book to manage", "Choose your assigned book", "Pick a book to curate"],
    submit_button: ["Create account", "Sign up", "Register"],
    submitting_button: ["Creating account…", "Signing up…", "Registering…"],
    already_have_account: ["Already have an account?", "Existing user?", "Have an account?"],
    sign_in: ["Sign in", "Login", "Access Account"],
    error_username_required: ["Username is required", "Please enter a username", "Username cannot be empty"],
    error_password_too_short: ["Password must be at least {MIN} characters", "Password needs {MIN} or more characters", "Minimum {MIN} characters required"],
    error_password_mismatch: ["Passwords do not match", "Password confirmation failed", "Passwords don't match"],
    error_unknown: ["Unable to register", "Registration failed", "Sign up error"]
  };

  // Dynamic ordering for form fields
  const formFields = useMemo(() => {
    const fields = [
      { key: "username", component: "username" },
      { key: "password", component: "password" },
      { key: "confirmPassword", component: "confirmPassword" },
      { key: "assignBook", component: "assignBook" }
    ];
    const order = dyn.v1.changeOrderElements("signup-form-fields", fields.length);
    return order.map((idx) => fields[idx]);
  }, [dyn.seed]);

  const books = getBooks();
  const bookOptions = useMemo(() => {
    if (!books || books.length === 0) return [];
    return [...books]
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 25);
  }, [books]);

  const preferredDefaultBook = bookOptions[0]?.id ?? FALLBACK_BOOK_ID;

  useEffect(() => {
    if (!assignedBook && preferredDefaultBook) {
      setAssignedBook(preferredDefaultBook);
    }
  }, [assignedBook, preferredDefaultBook]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    if (!normalizedUsername) {
      setError(dyn.v3.getVariant("error_username_required", dynamicV3TextVariants, "Username is required"));
      return;
    }
    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      const errorText = dyn.v3.getVariant("error_password_too_short", dynamicV3TextVariants, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      setError(errorText.replace("{MIN}", MIN_PASSWORD_LENGTH.toString()));
      return;
    }
    if (normalizedPassword !== normalizedConfirmPassword) {
      setError(dyn.v3.getVariant("error_password_mismatch", dynamicV3TextVariants, "Passwords do not match"));
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(normalizedUsername, normalizedPassword, normalizedConfirmPassword);
      logEvent(EVENT_TYPES.REGISTRATION_BOOK, {
        username: normalizedUsername,
      });
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message ?? dyn.v3.getVariant("error_unknown", dynamicV3TextVariants, "Unable to register"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative min-h-screen flex items-center justify-center py-12">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <main 
        id={dyn.v3.getVariant("signup-main", ID_VARIANTS_MAP, "signup-main")}
        className={cn(
          "relative mx-auto w-full max-w-xl px-6",
          dyn.v3.getVariant("signup-main", CLASS_VARIANTS_MAP, "")
        )}
      >
        {dyn.v1.addWrapDecoy("signup-main-container", (
          <div className="space-y-8">
            {/* Header */}
            {dyn.v1.addWrapDecoy("signup-header", (
              <div 
                id={dyn.v3.getVariant("signup-header", ID_VARIANTS_MAP, "signup-header")}
                className={cn(
                  "text-center",
                  dyn.v3.getVariant("signup-header", CLASS_VARIANTS_MAP, "")
                )}
              >
                {dyn.v1.addWrapDecoy("signup-icon-container", (
                  <div 
                    id={dyn.v3.getVariant("signup-icon-container", ID_VARIANTS_MAP, "signup-icon-container")}
                    className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 border border-secondary/30 mb-4",
                      dyn.v3.getVariant("icon-container", CLASS_VARIANTS_MAP, "")
                    )}
                  >
                    <BookOpen 
                      id={dyn.v3.getVariant("signup-icon", ID_VARIANTS_MAP, "signup-icon")}
                      className={cn("h-8 w-8 text-secondary", dyn.v3.getVariant("icon-book", CLASS_VARIANTS_MAP, ""))} 
                    />
                  </div>
                ))}
                <h1 
                  id={dyn.v3.getVariant("signup-title", ID_VARIANTS_MAP, "signup-title")}
                  className={cn(
                    "text-4xl md:text-5xl font-bold text-white mb-3",
                    dyn.v3.getVariant("page-title", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {dyn.v3.getVariant("signup_title", dynamicV3TextVariants, "Create Account")}
                </h1>
                <p 
                  id={dyn.v3.getVariant("signup-description", ID_VARIANTS_MAP, "signup-description")}
                  className={cn(
                    "text-lg text-white/70",
                    dyn.v3.getVariant("page-description", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {dyn.v3.getVariant("signup_description", dynamicV3TextVariants, "Join Autobooks and start curating your favorite books")}
                </p>
              </div>
            ))}

            {/* Register Form */}
            {dyn.v1.addWrapDecoy("signup-form-container", (
              <div 
                id={dyn.v3.getVariant("signup-form-container", ID_VARIANTS_MAP, "signup-form-container")}
                className={cn(
                  "relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl",
                  dyn.v3.getVariant("form-container", CLASS_VARIANTS_MAP, "")
                )}
              >
                <form 
                  id={dyn.v3.getVariant("signup-form", ID_VARIANTS_MAP, "signup-form")}
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
                                    placeholder={dyn.v3.getVariant("username_placeholder", dynamicV3TextVariants, "Choose a username")}
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
                                    placeholder={dyn.v3.getVariant("password_placeholder", dynamicV3TextVariants, "Create a password")}
                                    autoComplete="new-password"
                                    required
                                  />
                                ))}
                                <p 
                                  id={dyn.v3.getVariant("password-help", ID_VARIANTS_MAP, "password-help")}
                                  className={cn(
                                    "mt-1 text-xs text-white/50",
                                    dyn.v3.getVariant("form-help", CLASS_VARIANTS_MAP, "")
                                  )}
                                >
                                  {dyn.v3.getVariant("password_minimum", dynamicV3TextVariants, `Minimum ${MIN_PASSWORD_LENGTH} characters`).replace("{MIN}", MIN_PASSWORD_LENGTH.toString())}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      if (field.key === "confirmPassword") {
                        return (
                          <div key="confirmPassword">
                            {dyn.v1.addWrapDecoy("confirm-password-field", (
                              <div>
                                <label 
                                  id={dyn.v3.getVariant("confirm-password-label", ID_VARIANTS_MAP, "confirm-password-label")}
                                  className={cn(
                                    "flex items-center gap-2 text-sm font-semibold text-white/80 mb-2",
                                    dyn.v3.getVariant("form-label", CLASS_VARIANTS_MAP, "")
                                  )}
                                >
                                  <Lock 
                                    id={dyn.v3.getVariant("confirm-password-icon", ID_VARIANTS_MAP, "confirm-password-icon")}
                                    className={cn("h-4 w-4 text-secondary", dyn.v3.getVariant("icon-lock", CLASS_VARIANTS_MAP, ""))} 
                                  />
                                  {dyn.v3.getVariant("confirm_password_label", dynamicV3TextVariants, "Confirm Password")}
                                </label>
                                {dyn.v1.addWrapDecoy("confirm-password-input-container", (
                                  <Input
                                    id={dyn.v3.getVariant("confirm-password-input", ID_VARIANTS_MAP, "confirm-password-input")}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    className={cn(
                                      "h-12 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                                      dyn.v3.getVariant("form-input", CLASS_VARIANTS_MAP, "")
                                    )}
                                    placeholder={dyn.v3.getVariant("confirm_password_placeholder", dynamicV3TextVariants, "Confirm your password")}
                                    autoComplete="new-password"
                                    required
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      if (field.key === "assignBook" && bookOptions.length > 0) {
                        return (
                          <div key="assignBook">
                            {dyn.v1.addWrapDecoy("assign-book-field", (
                              <div>
                                <label 
                                  id={dyn.v3.getVariant("assign-book-label", ID_VARIANTS_MAP, "assign-book-label")}
                                  className={cn(
                                    "flex items-center gap-2 text-sm font-semibold text-white/80 mb-2",
                                    dyn.v3.getVariant("form-label", CLASS_VARIANTS_MAP, "")
                                  )}
                                >
                                  <BookIcon 
                                    id={dyn.v3.getVariant("assign-book-icon", ID_VARIANTS_MAP, "assign-book-icon")}
                                    className={cn("h-4 w-4 text-secondary", dyn.v3.getVariant("icon-book", CLASS_VARIANTS_MAP, ""))} 
                                  />
                                  {dyn.v3.getVariant("assign_book_label", dynamicV3TextVariants, "Assign Book")}
                                </label>
                                {dyn.v1.addWrapDecoy("assign-book-select-container", (
                                  <select
                                    id={dyn.v3.getVariant("assign-book-select", ID_VARIANTS_MAP, "assign-book-select")}
                                    value={assignedBook}
                                    onChange={(event) => setAssignedBook(event.target.value)}
                                    className={cn(
                                      "h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary hover:bg-white/15 cursor-pointer",
                                      dyn.v3.getVariant("form-select", CLASS_VARIANTS_MAP, "")
                                    )}
                                    style={{
                                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                      backgroundRepeat: 'no-repeat',
                                      backgroundPosition: 'right 12px center',
                                      backgroundSize: '12px',
                                    }}
                                  >
                                    {bookOptions.map((book) => (
                                      <option key={book.id} value={book.id} className="bg-neutral-900 text-white">
                                        {book.title}
                                      </option>
                                    ))}
                                  </select>
                                ))}
                                <p 
                                  id={dyn.v3.getVariant("assign-book-help", ID_VARIANTS_MAP, "assign-book-help")}
                                  className={cn(
                                    "mt-1 text-xs text-white/50",
                                    dyn.v3.getVariant("form-help", CLASS_VARIANTS_MAP, "")
                                  )}
                                >
                                  {dyn.v3.getVariant("assign_book_help", dynamicV3TextVariants, "Select a book to manage")}
                                </p>
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
                      id={dyn.v3.getVariant("signup-error", ID_VARIANTS_MAP, "signup-error")}
                      className={cn(
                        "rounded-xl border border-red-400/30 bg-red-400/10 p-4",
                        dyn.v3.getVariant("error-message", CLASS_VARIANTS_MAP, "")
                      )}
                    >
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  )}

                  {dyn.v1.addWrapDecoy("signup-submit-button", (
                    <Button 
                      id={dyn.v3.getVariant("signup-submit-button", ID_VARIANTS_MAP, "signup-submit-button")}
                      type="submit" 
                      className={cn(
                        "w-full h-12 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105",
                        dyn.v3.getVariant("submit-button", CLASS_VARIANTS_MAP, "")
                      )}
                      disabled={isSubmitting}
                    >
                      <UserPlus 
                        id={dyn.v3.getVariant("signup-submit-icon", ID_VARIANTS_MAP, "signup-submit-icon")}
                        className={cn("h-5 w-5 mr-2", dyn.v3.getVariant("icon-user-plus", CLASS_VARIANTS_MAP, ""))} 
                      />
                      {isSubmitting 
                        ? dyn.v3.getVariant("submitting_button", dynamicV3TextVariants, "Creating account…")
                        : dyn.v3.getVariant("submit_button", dynamicV3TextVariants, "Create account")
                      }
                    </Button>
                  ))}
                </form>
              </div>
            ))}

            {/* Footer Links */}
            {dyn.v1.addWrapDecoy("signup-footer", (
              <div 
                id={dyn.v3.getVariant("signup-footer", ID_VARIANTS_MAP, "signup-footer")}
                className={cn(
                  "text-center",
                  dyn.v3.getVariant("page-footer", CLASS_VARIANTS_MAP, "")
                )}
              >
                <p 
                  id={dyn.v3.getVariant("signup-footer-text", ID_VARIANTS_MAP, "signup-footer-text")}
                  className={cn(
                    "text-sm text-white/60",
                    dyn.v3.getVariant("footer-text", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {dyn.v3.getVariant("already_have_account", dynamicV3TextVariants, "Already have an account?")}{" "}
                  <SeedLink 
                    id={dyn.v3.getVariant("signup-login-link", ID_VARIANTS_MAP, "signup-login-link")}
                    href="/login" 
                    className={cn(
                      "font-semibold text-secondary hover:text-secondary/80 transition-colors",
                      dyn.v3.getVariant("footer-link", CLASS_VARIANTS_MAP, "")
                    )}
                  >
                    {dyn.v3.getVariant("sign_in", dynamicV3TextVariants, "Sign in")}
                  </SeedLink>
                </p>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

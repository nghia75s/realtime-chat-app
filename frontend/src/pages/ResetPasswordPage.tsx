import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, Check, X } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setEmail(emailParam);
    setToken(tokenParam);
  }, [emailParam, tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !token) {
      setError("Liên kết đặt lại không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(email, token, newPassword);
      setSuccessMessage("Đặt lại mật khẩu thành công! Bạn sẽ được chuyển về trang đăng nhập.");
      toast.success("Đặt lại mật khẩu thành công.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể đặt lại mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabel = strengthScore <= 1 ? "Yếu" : strengthScore === 2 ? "Trung bình" : strengthScore === 3 ? "Mạnh" : "Rất mạnh";
  const strengthColor = strengthScore <= 1 ? "bg-red-500" : strengthScore === 2 ? "bg-yellow-500" : strengthScore === 3 ? "bg-blue-500" : "bg-emerald-500";
  const strengthTextColor = strengthScore <= 1 ? "text-red-400" : strengthScore === 2 ? "text-yellow-400" : strengthScore === 3 ? "text-blue-400" : "text-emerald-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-6xl rounded-[24px] border border-white/15 bg-white/[0.05] backdrop-blur-3xl shadow-[0_24px_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row p-6 md:p-8 gap-6">
        <div className="w-full md:w-[48%] flex flex-col justify-center px-4 py-4 md:py-6">
          <div className="flex flex-col items-center gap-2 text-center mb-4">
            <div className="relative w-12 h-10 mb-2">
              <div className="absolute top-0 left-0 w-7 h-7 rounded-full bg-[#38bdf8]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#6366f1]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Đặt lại mật khẩu</h1>
            <p className="text-[14px] text-zinc-400 text-balance">
              Tạo mật khẩu mới cho tài khoản <span className="text-[#38bdf8] font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className="text-[14px] font-normal text-zinc-400">Mật khẩu mới</label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isSubmitting}
                      className={cn(
                        "bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 pl-3 pr-10 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full",
                        error && !newPassword ? "border-red-500/50" : ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-all duration-300",
                              strengthScore >= level ? strengthColor : "bg-white/10"
                            )}
                          />
                        ))}
                      </div>
                      <span className={cn("text-[12px] font-medium", strengthTextColor)}>{strengthLabel}</span>

                      <div className="flex flex-col gap-1 mt-1">
                        {[
                          { ok: hasMinLength, label: "Ít nhất 6 ký tự" },
                          { ok: hasUppercase, label: "Có chữ hoa (A-Z)" },
                          { ok: hasNumber, label: "Có chữ số (0-9)" },
                          { ok: hasSpecial, label: "Có ký tự đặc biệt (!@#...)" },
                        ].map((rule) => (
                          <div key={rule.label} className="flex items-center gap-1.5">
                            {rule.ok ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                            <span className={cn("text-[12px]", rule.ok ? "text-emerald-400" : "text-zinc-500")}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className="text-[14px] font-normal text-zinc-400">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      className={cn(
                        "bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 pl-3 pr-10 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full",
                        confirmPassword && confirmPassword !== newPassword ? "border-red-500/50" : confirmPassword && confirmPassword === newPassword ? "border-emerald-500/50" : ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {confirmPassword === newPassword ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[12px] text-emerald-400">Mật khẩu khớp</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-[12px] text-red-400">Mật khẩu không khớp</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-[14px] rounded-md bg-red-500/10 text-red-400 font-medium p-2.5 text-center border border-red-500/20">{error}</p>
              )}

              {successMessage && (
                <p className="text-[14px] rounded-md bg-emerald-500/10 text-emerald-400 font-medium p-2.5 text-center border border-emerald-500/20">
                  {successMessage}
                </p>
              )}

              <div className="flex flex-col gap-2.5">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#7c3aed] text-white rounded-lg py-2.5 font-normal text-[16px] hover:from-[#2563eb] hover:to-[#8b5cf6] transition-all shadow-md focus:outline-none flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Đặt lại mật khẩu"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/login")}
                  className="w-full text-zinc-200 hover:text-white border border-white/10 bg-white/5"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Quay lại đăng nhập
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="hidden md:flex w-[52%] rounded-[18px] bg-gradient-to-br from-[#121c33] via-[#0f172a] to-[#25103c] border border-white/5 relative overflow-hidden flex-col justify-between p-10 select-none min-h-[460px]">
          <div className="relative w-full h-[220px] flex items-center justify-center mb-6">
            <div className="absolute w-[200px] h-[200px] rounded-full bg-cyan-500/10 blur-[50px] pointer-events-none" />
            <div className="absolute w-[180px] h-[180px] rounded-full bg-purple-500/10 blur-[50px] pointer-events-none" />
            <svg className="absolute inset-0 w-full h-full text-white/5" viewBox="0 0 300 200" fill="none">
              <path d="M 50 150 L 100 120 L 150 150 L 200 90 L 250 140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M 80 80 L 150 150 L 220 70" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="50" cy="150" r="3" className="fill-cyan-400/40 animate-pulse" />
              <circle cx="100" cy="120" r="3" className="fill-indigo-400/40" />
              <circle cx="150" cy="150" r="4" className="fill-purple-400/40 animate-pulse" />
              <circle cx="200" cy="90" r="3" className="fill-pink-400/40" />
              <circle cx="250" cy="140" r="3" className="fill-cyan-400/40" />
              <circle cx="80" cy="80" r="3" className="fill-purple-400/40" />
              <circle cx="220" cy="70" r="3" className="fill-indigo-400/40" />
            </svg>
            <div className="absolute top-[20px] left-[20px] bg-purple-500/10 border border-purple-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_4s_infinite_1s] flex items-center justify-center">
              <span className="text-3xl">💜</span>
            </div>
            <div className="absolute top-[5px] right-[30px] bg-teal-500/10 border border-teal-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_4.5s_infinite] flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <div className="absolute bottom-[20px] right-[10px] bg-indigo-500/10 border border-indigo-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_5s_infinite_0.5s] flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
            <div className="absolute bottom-[10px] left-[30px] bg-pink-500/10 border border-pink-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_3.5s_infinite_1.5s] flex items-center justify-center">
              <span className="text-3xl">💖</span>
            </div>
            <div className="z-10 bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 border border-cyan-400/30 rounded-[28px] w-36 h-24 shadow-[0_10px_25px_rgba(6,182,212,0.15)] backdrop-blur-lg flex items-center justify-center animate-pulse">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-200 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 rounded-full bg-cyan-200 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 rounded-full bg-cyan-200 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[#38bdf8] text-[24px] font-extrabold max-w-sm mb-3 tracking-wide leading-tight">
              Khám phá thế giới trò chuyện mới
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed max-w-sm font-light">
              Kết nối với bạn bè nhanh chóng, mượt mà và bảo mật. Đăng nhập để bắt đầu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

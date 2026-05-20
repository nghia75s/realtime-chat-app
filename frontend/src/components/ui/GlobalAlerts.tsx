import { useAuthStore } from "@/store/useAuthStore"
import { ROLE_LABELS } from "@/store/useAdminStore"

export default function GlobalAlerts() {
  const { roleChangeAlert, accountLockAlert, clearAlerts, logout } = useAuthStore()

  if (!roleChangeAlert && !accountLockAlert) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f22] border border-[#2b2d31] w-full max-w-md rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {roleChangeAlert && (
          <>
            <h2 className="text-xl font-bold text-white mb-2">Thông báo thay đổi quyền</h2>
            <p className="text-[#e1e1e1] mb-6 leading-relaxed">
              Vai trò của bạn đã được quản trị viên thay đổi từ{" "}
              <span className="font-bold text-red-400">{ROLE_LABELS[roleChangeAlert.oldRole as keyof typeof ROLE_LABELS] || roleChangeAlert.oldRole}</span>{" "}
              sang{" "}
              <span className="font-bold text-emerald-400">{ROLE_LABELS[roleChangeAlert.newRole as keyof typeof ROLE_LABELS] || roleChangeAlert.newRole}</span>.
              <br /><br />
              Vui lòng đăng nhập lại để cập nhật phiên làm việc mới.
            </p>
            <button
              onClick={() => {
                clearAlerts()
                logout()
              }}
              className="w-full bg-[#0052cc] hover:bg-[#0052cc]/90 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Đóng và Đăng xuất
            </button>
          </>
        )}

        {accountLockAlert && (
          <>
            <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Tài khoản bị khoá
            </h2>
            <p className="text-[#e1e1e1] mb-6 leading-relaxed">
              Tài khoản của bạn đã bị khoá bởi quản trị viên với lý do:
              <br />
              <span className="inline-block mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md w-full font-medium italic">
                "{accountLockAlert.reason}"
              </span>
            </p>
            <button
              onClick={() => {
                clearAlerts()
                logout()
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </>
        )}

      </div>
    </div>
  )
}

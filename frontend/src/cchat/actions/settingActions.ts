export const settingActions = {
  changeLanguage: (lang: "vi" | "en") => {
    console.log(`Language changed to ${lang}`)
    // Thực tế sẽ dùng i18n change language
  },
  logout: () => {
    console.log("Logging out...")
    window.location.href = "/login"
  }
}

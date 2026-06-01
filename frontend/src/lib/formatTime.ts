export function formatRelativeTime(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const now = new Date()
  
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  // Calculate day difference by ignoring time
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return "Vừa xong"
  }
  
  if (diffDays === 0) {
    if (diffHours < 1) {
      return `${diffMins} phút`
    }
    return `${diffHours} giờ`
  }
  
  if (diffDays === 1) {
    return "Hôm qua"
  }
  
  if (diffDays < 7) {
    return `${diffDays} ngày`
  }
  
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} tuần`
  }
  
  if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} tháng`
  }
  
  return `${Math.floor(diffDays / 365)} năm`
}

export function formatMessageDateDivider(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const now = new Date()
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Hôm nay"
  }
  
  if (diffDays === 1) {
    return "Hôm qua"
  }

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  const dayOfWeek = daysOfWeek[date.getDay()]
  
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()

  return `${dayOfWeek} ${dd}/${mm}/${yyyy}`
}

export const formatDate = (dateStr: string | Date) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const DD = d.getDate().toString().padStart(2, '0');
  const MM = (d.getMonth() + 1).toString().padStart(2, '0');
  const YYYY = d.getFullYear();
  return `${hh}:${mm} ${DD}/${MM}/${YYYY}`;
};

export const formatShortDate = (dateStr: string | Date) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const DD = d.getDate().toString().padStart(2, '0');
  const MM = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${hh}:${mm} ${DD}/${MM}`;
};

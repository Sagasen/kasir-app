export const rupiah = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

export const dateFmt = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
};

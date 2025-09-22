export default function SiteFooter() {
  return (
    <footer className="px-4 py-10">
      <div className="mx-auto w-full max-w-[var(--container-w)] text-center text-xs text-muted">
        © {new Date().getFullYear()} — Stéphane Gelibert. Tous droits réservés.
      </div>
    </footer>
  );
}

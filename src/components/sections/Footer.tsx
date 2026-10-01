import { footer } from "@/data/site";

export default function Footer() {
  return (
    <footer className="pt-8 pb-12 text-center font-mono text-sm text-muted">
      © {new Date().getFullYear()} {footer.name}
    </footer>
  );
}

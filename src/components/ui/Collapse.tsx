import type { HTMLAttributes, ReactNode } from "react";

/** Height-animated disclosure panel (CSS grid-rows transition); inert while closed. */
export default function Collapse({
  open,
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { open: boolean; children: ReactNode }) {
  return (
    <div
      {...props}
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      } ${className}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

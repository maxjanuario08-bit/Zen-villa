"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  revealLabel: string;
  hint?: ReactNode;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  showToggle?: boolean;
};

export default function PasswordField({
  id,
  label,
  revealLabel,
  hint,
  className = "",
  visible: visibleProp,
  onVisibleChange,
  showToggle = true,
  ...inputProps
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const revealId = `${fieldId}-reveal`;
  const [uncontrolled, setUncontrolled] = useState(false);
  const visible = visibleProp ?? uncontrolled;

  function setVisible(next: boolean) {
    onVisibleChange?.(next);
    if (visibleProp === undefined) setUncontrolled(next);
  }

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={fieldId}
        type={visible ? "text" : "password"}
        className={`w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon ${className}`}
        {...inputProps}
      />
      {showToggle ? (
        <label htmlFor={revealId} className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
          <input
            id={revealId}
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="h-4 w-4 rounded border-sand/70 text-lagoon accent-lagoon"
          />
          {revealLabel}
        </label>
      ) : null}
      {hint}
    </div>
  );
}

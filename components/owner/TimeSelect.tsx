"use client";

import { TIME_SLOTS } from "@/lib/time-slots";

type Props = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export default function TimeSelect({
  id,
  name,
  value,
  defaultValue = "10:00",
  onChange,
  className = "",
}: Props) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      defaultValue={value == null ? defaultValue : undefined}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={`w-full rounded-xl border border-sand/60 bg-white px-4 py-2.5 outline-none focus:border-lagoon ${className}`}
    >
      {TIME_SLOTS.map((slot) => (
        <option key={slot} value={slot}>
          {slot}
        </option>
      ))}
    </select>
  );
}

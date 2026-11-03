import { useId } from "react"
import { cn } from "@/lib/utils"

const CONTROL =
  "w-full rounded-[var(--radius-control)] border border-kerb bg-asphalt px-3 py-2.5 text-chalk placeholder:text-fog hover:border-zinc-700 focus-visible:border-signal"

interface FieldProps {
  label: string
  hint?: string
  children: (props: { id: string; className: string; "aria-describedby"?: string }) => React.ReactNode
}

/** A labelled form control: the label is always linked to the control, the hint to aria-describedby. */
export function Field({ label, hint, children }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="block font-bold text-chalk">{label}</label>
      {hint && <p id={hintId} className="mt-0.5 text-sm text-fog">{hint}</p>}
      <div className="mt-2">{children({ id, className: CONTROL, "aria-describedby": hintId })}</div>
    </div>
  )
}

export const controlClass = (extra?: string) => cn(CONTROL, extra)

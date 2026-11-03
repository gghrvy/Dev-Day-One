/**
 * Public demo switch. Explicit NEXT_PUBLIC_DEMO_MODE wins; unset means demo in production builds.
 * This only hides controls: the backend enforces the real boundary with an allow-list.
 */
const flag = process.env.NEXT_PUBLIC_DEMO_MODE

export const IS_DEMO = flag === "true" || (flag !== "false" && process.env.NODE_ENV === "production")

export const DEMO_TURNED_OFF =
  "Connecting repositories, indexing, editing, re-running analyses and sign-in are turned off. Ask answers are pre-recorded."

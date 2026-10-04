import type { ComponentPropsWithoutRef } from "react";

/** Content blocks control their own visibility, including tall mobile sections. */
export function ScrollSection(props: ComponentPropsWithoutRef<"section">) {
  return <section {...props} />;
}

import type { ProjectPreview } from "@/lib/assistantResponse";

/** Snapshot allowlist: preview identifiers and ownership never enter the draft body. */
export function demoProjectSnapshot(project: ProjectPreview, electrical?: Record<string, unknown> | null) {
  return {
    name: project.name, projectType: project.projectType ?? "fire",
    building_type: project.buildingType, usage: project.usage,
    area_m2: project.areaM2, floors: project.floors, occupants: project.occupants,
    ceiling_height_m: project.ceilingHeightM, volume_m3: project.volumeM3,
    requirements: project.requirements ?? [], reference: project.reference ?? [],
    context_cr: (project.contextCr ?? []).map((item) => typeof item === "string" ? item
      : [item.topic, item.detail, item.authority, item.reference].filter(Boolean).join(" — ")),
    risk: project.risk, electrical: electrical ?? project.electrical ?? null,
  };
}

export function demoRegistrationUrl(base: string, draft: { draftId: string; claimToken: string; expiresAt: string }) {
  const url = new URL(base);
  url.searchParams.set("draft", draft.draftId);
  url.searchParams.set("expires", draft.expiresAt);
  url.hash = new URLSearchParams({ claim: draft.claimToken }).toString();
  return url.toString();
}

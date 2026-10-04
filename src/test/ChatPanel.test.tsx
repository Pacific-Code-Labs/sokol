import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { t } from "@/lib/i18n";
import { AssistantProvider, useAssistant } from "@/contexts/AssistantContext";
import { ChatPanel, type Msg } from "@/components/ChatPanel";

const languageState = vi.hoisted(() => ({ lang: "en" as "en" | "es" }));
const api = vi.hoisted(() => ({ evaluateDemo: vi.fn(), evaluateDemoElectrical: vi.fn(), createDemoProjectDraft: vi.fn() }));
vi.mock("@/services/sokolApi", () => ({
  sokolApi: api, BuildingType: { residencial: 1, comercial: 2, industrial: 3 },
  DemoLimitError: class extends Error {}, QuotaError: class extends Error {},
}));
vi.mock("@/contexts/LangContext", () => ({ useLang: () => ({ lang: languageState.lang, tr: t[languageState.lang] }) }));
vi.mock("@/components/UpgradeModal", () => ({ UpgradeModal: () => null }));
vi.mock("@/components/assistant/WelcomeState", () => ({
  WelcomeState: ({ onPick }: { onPick: (scenario: unknown) => void }) =>
    <button onClick={() => onPick({ query: "Evaluate an office", params: { building_type: 2, usage: "office", area_m2: 100 } })}>Start scenario</button>,
}));
vi.mock("@/components/assistant/NeedsInfoForm", () => ({
  NeedsInfoForm: ({ onSubmit }: { onSubmit: (summary: string, answers: Record<string, string>) => void }) =>
    <button onClick={() => onSubmit("30", { occupants: "30" })}>Answer question</button>,
}));
Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });

afterEach(() => { cleanup(); vi.resetAllMocks(); languageState.lang = "en"; });

it("keeps the teaser stage when the agent asks a clarifying question", async () => {
  api.evaluateDemo.mockResolvedValueOnce({ type: "needs_info", data: {
    questions: [{ key: "occupants", label: "Occupants?", type: "number", required: true }], context: {},
  } }).mockResolvedValueOnce({ type: "message", data: { message: "Complete agent teaser" } });
  function Harness() {
    const [messages, setMessages] = useState<Msg[]>([]);
    return <ChatPanel demo buildingType={2} usage="office" messages={messages} setMessages={setMessages} onClose={() => {}} />;
  }
  render(<MemoryRouter><Harness /></MemoryRouter>);
  fireEvent.click(screen.getByText("Start scenario"));
  fireEvent.click(await screen.findByText("Answer question"));
  await waitFor(() => expect(api.evaluateDemo).toHaveBeenCalledTimes(2));
  for (const [body] of api.evaluateDemo.mock.calls) {
    expect(body.context).toEqual({ page: "demo", project: null, demo_step: "teaser", demo_session_id: expect.any(String) });
    expect(body.area_m2).toBeUndefined();
  }
  expect(api.evaluateDemo.mock.calls[0][0].context.demo_session_id).toBe(api.evaluateDemo.mock.calls[1][0].context.demo_session_id);
  expect(await screen.findByText("Complete agent teaser")).toBeInTheDocument();
});


it("offers registration after evaluation, project preview and electrical study", async () => {
  api.evaluateDemo.mockResolvedValueOnce({ type: "message", data: { message: "Useful teaser" } })
    .mockResolvedValueOnce({ type: "evaluation", data: {
      matchedRules: [], foundryUsed: true, requirements: ["Review extinguishers"],
      reference: ["NFPA 10"], contextCr: [], risk: "medio",
    } })
    .mockResolvedValueOnce({ type: "project_created", data: {
      projectId: null, project: { name: "Office preview", areaM2: 100 },
    } });
  api.evaluateDemoElectrical.mockResolvedValue({ demandKva: 12, suggestedTransformerKva: 15 });
  function Harness() {
    const [messages, setMessages] = useState<Msg[]>([]);
    return <ChatPanel demo buildingType={2} usage="office" messages={messages} setMessages={setMessages} />;
  }
  render(<MemoryRouter><Harness /></MemoryRouter>);
  fireEvent.click(screen.getByText("Start scenario"));
  await screen.findByText(t.en.demoStep2Q);
  expect(screen.queryByText(t.en.demoAccountQ)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: t.en.demoSeeEval }));
  await screen.findByText(t.en.demoStep3Q);
  expect(screen.queryByText(t.en.demoAccountQ)).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("button", { name: t.en.demoYes }).find((button) => !button.hasAttribute("disabled"))!);
  await screen.findByText(t.en.demoStep4Q);
  expect(screen.queryByText(t.en.demoAccountQ)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: t.en.demoSeeElectrical }));
  expect(await screen.findByText(t.en.demoAccountQ)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: t.en.demoCreateAccount })).toBeInTheDocument();
  expect(api.evaluateDemo.mock.calls.map(([body]) => body.context.demo_step)).toEqual(["teaser", "full_evaluation", "project"]);
  expect(api.evaluateDemoElectrical).toHaveBeenCalledOnce();
});

it("stores the preview before opening signup and offers a link when popups are blocked", async () => {
  const draft = { draftId: "0f24de61-f193-4fbb-ae93-92802062d21b", claimToken: "a".repeat(43), expiresAt: "2099-01-01T00:00:00Z" };
  api.createDemoProjectDraft.mockResolvedValue(draft);
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  function Harness() {
    const [messages, setMessages] = useState<Msg[]>([
      { role: "assistant", text: "Office preview", type: "project", payload: {
        projectId: null, project: { name: "Office", buildingType: "comercial", usage: "office", risk: "medio",
          requirements: ["Review extinguishers"], reference: ["NFPA 10"], contextCr: ["CR context"] },
      } },
      { role: "assistant", text: "Register", type: "prompt", payload: {
        kind: "create_account", prompt: "Register", options: [{ label: t.en.demoCreateAccount, value: "yes" }],
      } },
    ]);
    return <ChatPanel demo buildingType={2} usage="office" messages={messages} setMessages={setMessages} />;
  }
  render(<MemoryRouter><Harness /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: t.en.demoCreateAccount }));
  const link = await screen.findByRole("link", { name: t.en.demoDraftContinue });
  const url = new URL(link.getAttribute("href")!);
  expect(url.pathname).toBe("/en/register");
  expect(url.searchParams.get("draft")).toBe(draft.draftId);
  expect(url.search).not.toContain(draft.claimToken);
  expect(new URLSearchParams(url.hash.slice(1)).get("claim")).toBe(draft.claimToken);
  expect(api.createDemoProjectDraft).toHaveBeenCalledWith(expect.objectContaining({
    name: "Office", building_type: "comercial", requirements: ["Review extinguishers"], context_cr: ["CR context"],
  }));
  expect(api.evaluateDemo).not.toHaveBeenCalled();
  open.mockRestore();
});

it("keeps the preview and offers retry when draft storage fails", async () => {
  api.createDemoProjectDraft.mockRejectedValue(new Error("offline"));
  const popup = { opener: null, close: vi.fn(), closed: false, location: { replace: vi.fn() } };
  const open = vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
  function Harness() {
    const [messages, setMessages] = useState<Msg[]>([
      { role: "assistant", text: "Office preview", type: "project", payload: { projectId: null, project: { name: "Office" } } },
      { role: "assistant", text: "Register", type: "prompt", payload: {
        kind: "create_account", prompt: "Register", options: [{ label: t.en.demoCreateAccount, value: "yes" }],
      } },
    ]);
    return <ChatPanel demo buildingType={2} usage="office" messages={messages} setMessages={setMessages} />;
  }
  render(<MemoryRouter><Harness /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: t.en.demoCreateAccount }));
  expect(await screen.findByText(t.en.demoDraftError)).toBeInTheDocument();
  expect(screen.getByText("Office preview")).toBeInTheDocument();
  expect(popup.close).toHaveBeenCalledOnce();
  expect(popup.location.replace).not.toHaveBeenCalled();
  expect(screen.getAllByRole("button", { name: t.en.demoCreateAccount }).some((b) => !b.hasAttribute("disabled"))).toBe(true);
  open.mockRestore();
});


it("preserves messages and journey across language and panel remounts", async () => {
  api.evaluateDemo.mockResolvedValueOnce({ type: "message", data: { message: "Office teaser" } })
    .mockResolvedValueOnce({ type: "evaluation", data: { matchedRules: [], foundryUsed: true,
      requirements: ["Review NFPA 10"], reference: ["NFPA 10"], contextCr: [], risk: "medio" } })
    .mockResolvedValueOnce({ type: "message", data: { message: "Electrical follow-up" } });
  function Panel() {
    const { messages, setMessages } = useAssistant();
    return <ChatPanel demo buildingType={2} usage="office" messages={messages} setMessages={setMessages} />;
  }
  function Harness({ variant }: { variant: string }) {
    return <MemoryRouter><AssistantProvider><Panel key={variant} /></AssistantProvider></MemoryRouter>;
  }
  const view = render(<Harness variant="desktop-en" />);
  fireEvent.click(screen.getByText("Start scenario"));
  expect(await screen.findByText("Office teaser")).toBeInTheDocument();
  const journey = api.evaluateDemo.mock.calls[0][0].context.demo_session_id;
  languageState.lang = "es";
  view.rerender(<Harness variant="mobile-es" />);
  expect(screen.getByText("Office teaser")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: t.en.demoSeeEval }));
  await waitFor(() => expect(api.evaluateDemo).toHaveBeenCalledTimes(2));
  expect(api.evaluateDemo.mock.calls[1][0].context).toMatchObject({ demo_step: "full_evaluation", demo_session_id: journey });
  const input = screen.getByPlaceholderText(t.es.askPlaceholder);
  await waitFor(() => expect(input).not.toBeDisabled());
  fireEvent.change(input, { target: { value: "¿Cómo se relaciona con NFPA 70?" } });
  fireEvent.submit(input.closest("form")!);
  await waitFor(() => expect(api.evaluateDemo).toHaveBeenCalledTimes(3));
  const followup = api.evaluateDemo.mock.calls[2][0];
  expect(followup.context.demo_session_id).toBe(journey);
  expect(followup.conversation.some((turn: { content: string }) => turn.content.includes("Review NFPA 10"))).toBe(true);
});

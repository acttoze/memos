import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MemoView from "@/components/MemoView/MemoView";
import type { Memo } from "@/types/proto/api/v1/memo_service_pb";

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ userTagsSetting: {} }) }));
vi.mock("@/hooks/useCurrentUser", () => ({ default: () => ({ name: "users/owner" }) }));
vi.mock("@/contexts/InstanceContext", () => ({ useInstance: () => ({ memoRelatedSetting: { enableDoubleClickEdit: false } }) }));
vi.mock("@/components/MemoContent/MentionResolutionContext", () => ({ useResolvedUser: () => undefined }));
vi.mock("@/components/ColumnGrid/ColumnGridContext", () => ({
  useColumnGridUntrapped: () => ({ setUntrappedKey: () => undefined, clearUntrappedKey: () => undefined }),
}));
vi.mock("@/lib/tag", () => ({ isMemoBlurred: () => false }));
vi.mock("@/components/MemoView/components", () => ({
  MemoHeader: () => <header>Header</header>,
  MemoBody: () => <p>Memo text</p>,
  MemoCommentListView: () => null,
}));
vi.mock("@/components/MemoEditor/loader", () => ({
  loadMemoEditor: async () => ({ default: () => <textarea aria-label="Native editor" /> }),
}));

describe("MemoView blank-card integration", () => {
  it("mounts the native editor after clicking the real editable article", async () => {
    const memo = {
      name: "memos/blank",
      creator: "users/owner",
      relations: [],
      content: "Memo text",
      attachments: [],
      reactions: [],
    } as unknown as Memo;
    const { container } = render(
      <MemoryRouter>
        <MemoView memo={memo} />
      </MemoryRouter>,
    );
    fireEvent.click(container.querySelector("article") as HTMLElement);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Native editor" })).toBeInTheDocument());
  });
});

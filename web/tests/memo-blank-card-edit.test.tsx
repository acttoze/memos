import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMemoHandlers } from "@/components/MemoView/hooks/useMemoHandlers";

vi.mock("@/contexts/InstanceContext", () => ({
  useInstance: () => ({ memoRelatedSetting: { enableDoubleClickEdit: false } }),
}));

function Card({ openEditor, readonly = false, children }: { openEditor: () => void; readonly?: boolean; children?: React.ReactNode }) {
  const handlers = useMemoHandlers({ readonly, openEditor, openPreview: () => undefined });
  return (
    <article
      data-testid="card"
      tabIndex={0}
      onClick={(handlers as unknown as { handleMemoBlankClick?: React.MouseEventHandler }).handleMemoBlankClick}
    >
      {children}
    </article>
  );
}

describe("native blank-card edit", () => {
  it.each([
    '<a href="#">link</a>',
    "<button>action</button>",
    "<input />",
    "<textarea></textarea>",
    "<select></select>",
    '<span role="button">reaction</span>',
    '<span tabindex="0">focusable</span>',
    '<span contenteditable="true">editor</span>',
    '<img src="photo.png" />',
    "<video></video>",
    "<audio></audio>",
    "<label>label</label>",
    "<summary>details</summary>",
  ])("preserves interactive descendants: %s", (html) => {
    const openEditor = vi.fn();
    render(
      <Card openEditor={openEditor}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Card>,
    );
    fireEvent.click(screen.getByTestId("card").querySelector("div")?.firstElementChild as Element);
    expect(openEditor).not.toHaveBeenCalled();
  });
  it("preserves memo text clicks", () => {
    const openEditor = vi.fn();
    render(
      <Card openEditor={openEditor}>
        <p>memo text</p>
      </Card>,
    );
    fireEvent.click(screen.getByText("memo text"));
    expect(openEditor).not.toHaveBeenCalled();
  });
  it("preserves active text selection", () => {
    const openEditor = vi.fn();
    render(
      <Card openEditor={openEditor}>
        <p>selected</p>
      </Card>,
    );
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(screen.getByText("selected"));
    selection?.addRange(range);
    fireEvent.click(screen.getByTestId("card"));
    selection?.removeAllRanges();
    expect(openEditor).not.toHaveBeenCalled();
  });
  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { altKey: true },
    { shiftKey: true },
    { button: 1 },
    { button: 2 },
  ])("preserves modified clicks: %j", (options) => {
    const openEditor = vi.fn();
    render(<Card openEditor={openEditor} />);
    fireEvent.click(screen.getByTestId("card"), options);
    expect(openEditor).not.toHaveBeenCalled();
  });
  it("does not edit readonly cards", () => {
    const openEditor = vi.fn();
    render(<Card readonly openEditor={openEditor} />);
    fireEvent.click(screen.getByTestId("card"));
    expect(openEditor).not.toHaveBeenCalled();
  });
  it("opens on an empty noninteractive descendant", () => {
    const openEditor = vi.fn();
    render(
      <Card openEditor={openEditor}>
        <div data-testid="blank" />
      </Card>,
    );
    fireEvent.click(screen.getByTestId("blank"));
    expect(openEditor).toHaveBeenCalledOnce();
  });
  it("opens the editor on a blank card click even when double-click editing is disabled", () => {
    const openEditor = vi.fn();
    render(<Card openEditor={openEditor} />);
    fireEvent.click(screen.getByTestId("card"));
    expect(openEditor).toHaveBeenCalledOnce();
  });
});

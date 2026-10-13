import { useCallback } from "react";
import { useInstance } from "@/contexts/InstanceContext";
import type { PreviewMediaItem } from "@/utils/media-item";

interface UseMemoHandlersOptions {
  readonly: boolean;
  openEditor: () => void;
  openPreview: (items: string | string[] | PreviewMediaItem[], index?: number) => void;
}

export const useMemoHandlers = (options: UseMemoHandlersOptions) => {
  const { readonly, openEditor, openPreview } = options;
  const { memoRelatedSetting } = useInstance();

  const handleMemoContentClick = useCallback(
    (e: React.MouseEvent) => {
      const targetEl = e.target as HTMLElement;
      if (targetEl.tagName === "IMG") {
        const linkElement = targetEl.closest("a");
        if (linkElement) return; // If image is inside a link, don't show preview
        const imgUrl = targetEl.getAttribute("src");
        if (imgUrl) openPreview(imgUrl);
      }
    },
    [openPreview],
  );

  const handleMemoContentDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (readonly) return;
      if (memoRelatedSetting.enableDoubleClickEdit) {
        e.preventDefault();
        openEditor();
      }
    },
    [readonly, openEditor, memoRelatedSetting.enableDoubleClickEdit],
  );

  const handleMemoBlankClick = useCallback(
    (e: React.MouseEvent) => {
      if (readonly || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest(
        "a,button,input,textarea,select,label,summary,[role],[tabindex],[contenteditable]:not([contenteditable='false']),img,video,audio,iframe,canvas,svg",
      );
      // The article itself has tabindex; only descendants block blank editing.
      if (interactive && interactive !== e.currentTarget) return;
      if (window.getSelection()?.toString()) return;
      // Text containers are not blank; keep ordinary selection and double-click behavior.
      if (target !== e.currentTarget && target.textContent?.trim()) return;
      openEditor();
    },
    [readonly, openEditor],
  );

  return { handleMemoContentClick, handleMemoContentDoubleClick, handleMemoBlankClick };
};

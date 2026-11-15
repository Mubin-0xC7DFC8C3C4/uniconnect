import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50" />
        <Dialog.Content
          className={
            "dialog-panel fixed top-1/2 left-1/2 z-50 max-h-[min(40rem,calc(100dvh-2rem))] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-surface p-6 shadow-float r-lg " +
            (wide ? "max-w-2xl" : "max-w-lg")
          }
        >
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="type-lg text-fg">{title}</Dialog.Title>
            <Dialog.Close
              className="inline-flex size-11 items-center justify-center text-muted r-md hover:bg-sunken hover:text-fg"
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="mt-2 type-sm text-muted">{description}</Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

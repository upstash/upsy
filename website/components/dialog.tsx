"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconX } from "@tabler/icons-react";
import cx from "@/utils/cx";

export interface Props extends Dialog.DialogProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export default function LinkButton({ children, trigger }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-emerald-900/60" />

        <Dialog.Content
          className={cx(
            "fixed inset-2 md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
            "md:max-h-[85vh] md:w-[90vw] md:max-w-[650px]",
            "overflow-y-scroll",
            "rounded-2xl bg-white p-6 shadow-2xl md:p-10",
          )}
        >
          {/* close */}
          <Dialog.Close asChild>
            <button
              className={cx(
                "absolute right-2 top-2",
                "inline-flex h-10 w-10 items-center justify-center",
                "appearance-none rounded-full opacity-60",
              )}
              aria-label="Close"
            >
              <IconX size={20} stroke={1.5} />
            </button>
          </Dialog.Close>

          {/* content */}
          <div className="">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

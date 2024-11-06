"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  title: string;
  message: string;
  callbackFn: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ConfirmModal = ({
  title,
  message,
  callbackFn,
  open,
  setOpen,
}: ConfirmModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isModalOpen = open;
  if (!isModalOpen) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOpen(false)}
              variant={"outline"}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={callbackFn} disabled={isLoading}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;

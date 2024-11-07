import { useState } from "react";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useUpdateJoinCode } from "@/features/workspaces/api/use-update-join-code";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/confirm-modal";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workspaceName: string;
  joinCode: string;
}

const InviteModal = ({
  open,
  setOpen,
  workspaceName,
  joinCode,
}: InviteModalProps) => {
  const { mutate, isPending } = useUpdateJoinCode();
  const { workspaceId } = useWorkspaceId();
  const [updateOpen, setUpdateOpen] = useState(false);

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Link Copied to clipboard"));
  };

  const handleNewCode = () => {
    mutate(
      { workspaceId },
      {
        onSuccess: () => {
          toast.success("Join Code Updated");
        },
      }
    );
    setUpdateOpen(false);
  };

  return (
    <>
      <ConfirmModal
        title="Are You Sure?"
        message="This will deactivate the current code and create new one."
        callbackFn={handleNewCode}
        open={updateOpen}
        setOpen={setUpdateOpen}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>Invite People to {workspaceName}</DialogTitle>
            <DialogDescription>
              Use the code below to invite People to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-center items-center gap-y-4 py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={handleCopy}
              disabled={isPending}
            >
              Copy Link
              <Copy className="size-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-between w-full p-3">
            <Button
              onClick={() => setUpdateOpen(true)}
              variant={"outline"}
              disabled={isPending}
            >
              New Code
              <RefreshCcw
                className={cn("size-4 ml-2", isPending && "animate-spin")}
              />
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InviteModal;

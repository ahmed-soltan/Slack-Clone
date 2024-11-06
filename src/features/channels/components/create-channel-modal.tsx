import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { useCreateChannel } from "../api/use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const CreateChannelModal = () => {
  const [name, setName] = useState("");
  const { mutate, isPending } = useCreateChannel();
  const [open, setOpen] = useCreateChannelModal();
  const { workspaceId } = useWorkspaceId();
  const router = useRouter()
    
  const handleClose = () => {
    setOpen(false);
    setName("");
  };

  const handleChange = (e:ChangeEvent<HTMLInputElement>)=>{
    const value = e.target.value.replace("/\s+/g","-").toLowerCase()
    setName(value);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { workspaceId, name },
      {
        onSuccess: (data) => {
          toast.success("Channel Created");
          router.push(`/workspace/${workspaceId}/channel/${data}`)
          handleClose();
        },
        onError: (error) => {
          toast.error("Failed to create channel");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Channel</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={name}
            required
            disabled={isPending}
            autoFocus
            minLength={3}
            onChange={handleChange}
            placeholder="Channel Name e.g. 'plan-budget'"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;

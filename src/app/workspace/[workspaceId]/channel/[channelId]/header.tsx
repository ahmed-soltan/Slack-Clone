import { Trash } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useRemoveChannel } from "@/features/channels/api/use-delete-channel";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/confirm-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";

interface HeaderProps {
  title: string;
}
const Header = ({ title }: HeaderProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [value, setValue] = useState(title);
  const { channelId } = useChannelId();
  const { workspaceId } = useWorkspaceId();

  const router = useRouter();

  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();

  const { mutate: deleteChannel, isPending: isDeletingChannel } =
    useRemoveChannel();

  const { data: member } = useCurrentMember({ workspaceId });

  const handleEditOpen = (value: boolean) => {
    if (member?.role !== "admin") return;

    setEditOpen(value);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChannel(
      { id: channelId, workspaceId: workspaceId, name: value },
      {
        onSuccess: () => {
          toast.success("Channel Updated");
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to update Channel");
        },
      }
    );
  };

  const handleRemove = async () => {
    deleteChannel(
      { id: channelId, workspaceId },
      {
        onSuccess: () => {
          toast.success("Channel Deleted");
          router.replace(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error("Failed to remove Channel");
        },
      }
    );
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/s+/g, "-").toLowerCase();
    setValue(value);
  };

  return (
    <>
      <ConfirmModal
        title="Are You Sure?"
        message="This action can't be undone "
        open={deleteOpen}
        setOpen={setDeleteOpen}
        callbackFn={handleRemove}
      />
      <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"ghost"}
              className="text-lg font-semibold px-2 overflow-hidden w-auto"
              size={"sm"}
            >
              <span className="truncate"># {title}</span>
              <FaChevronDown className="size-2.5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-white">
              <DialogTitle># {title}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                <DialogTrigger asChild>
                  <div className="px-5 py-4 rounded-lg bg-white hover:bg-gray-50 border cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Channel Name</p>
                      {member?.role === "admin" && (
                        <p className="text-sm text-[#1264a3] font-semibold hover:underline">
                          Edit
                        </p>
                      )}
                    </div>
                    <p className="text-sm"># {title}</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename This Channel</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleEdit}>
                    <Input
                      type="text"
                      value={value}
                      required
                      disabled={isUpdatingChannel}
                      autoFocus
                      minLength={3}
                      maxLength={80}
                      onChange={handleChange}
                      placeholder="Channel Name e.g. 'plan-budget'"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isUpdatingChannel}>
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {member?.role === "admin" && (
                <button
                  className="flex items-center gap-x-2 px-5 py-4 rounded-lg bg-white hover:bg-gray-50 text-rose-500 cursor-pointer border"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isDeletingChannel}
                >
                  <Trash className="size-4" />
                  <p className="text-sm font-semibold">Delete Channel</p>
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Header;

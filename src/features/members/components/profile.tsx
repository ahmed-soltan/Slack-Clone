import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "../api/use-get-member";
import { AlertTriangle, Loader, Mail, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useUpdateMember } from "../api/use-update-member";
import { useRemoveMember } from "../api/use-remove-member";
import { useCurrentMember } from "../api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmModal from "@/components/confirm-modal";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}

const Profile = ({ memberId, onClose }: ProfileProps) => {
  const [onRemoveMember, setOnRemoveMember] = useState(false);
  const [onLeaveWorkspace, setOnLeaveWorkspace] = useState(false);

  const router = useRouter();

  const { workspaceId } = useWorkspaceId();
  const { data: member, isLoading: isLoadingMember } = useGetMember({
    id: memberId,
  });
  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentMember({
      workspaceId,
    });

  const { mutate: updateMember, isPending: isMemberUpdating } =
    useUpdateMember();
  const { mutate: removeMember, isPending: isMemberRemoving } =
    useRemoveMember();

  const onRemove = () => {
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("Member Removed");
          router.replace(`/workspace/${workspaceId}`);
          onClose();
        },
        onError: () => {
          toast.error("Failed to remove member");
        },
      }
    );
  };

  const onLeave = () => {
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("You Left the workspace");
          router.replace("/");
          onClose();
        },
        onError: () => {
          toast.error("Failed to Leave the workspace");
        },
      }
    );
  };

  const onUpdate = (role: "admin" | "member") => {
    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => {
          toast.success("Member Role updated");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update member role");
        },
      }
    );
  };

  if (isLoadingMember || isLoadingCurrentMember) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button size={"iconSm"} onClick={onClose} variant={"ghost"}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button size={"iconSm"} onClick={onClose} variant={"ghost"}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-slate-600" />
          <p className="text-xs text-slate-600">Profile Not Found</p>
        </div>
      </div>
    );
  }

  const avatarFallback = member.user.name?.charAt(0).toUpperCase() || "M";

  return (
    <>
      <ConfirmModal
        open={onRemoveMember ? onRemoveMember : onLeaveWorkspace}
        setOpen={onRemoveMember ? setOnRemoveMember : setOnLeaveWorkspace}
        callbackFn={onRemoveMember ? onRemove : onLeave}
        title={onRemoveMember ? "Remove Member" : "Leave Workspace"}
        message={
          onRemoveMember
            ? "Are You Sure you Want to remove This member"
            : "Are You Sure you want to Leave the workspace"
        }
      />
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button size={"iconSm"} onClick={onClose} variant={"ghost"}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-4">
          <Avatar className="max-w-[256px] max-h-[256px] size-full">
            <AvatarImage src={member.user.image} className="rounded-md" />
            <AvatarFallback className="text-6xl aspect-square">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">{member.user.name}</p>
          {currentMember?.role === "admin" &&
          currentMember?._id !== member._id ? (
            <div className="flex items-center gap-2 mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"} className="w-full capitalize">
                    {member.role} <FaChevronDown className="ml-2 size-4" />{" "}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) =>
                      onUpdate(role as "admin" | "member")
                    }
                  >
                    <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">Member</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant={"outline"}
                className="w-full"
                onClick={() => setOnRemoveMember(true)}
              >
                Remove
              </Button>
            </div>
          ) : currentMember?._id === member._id &&
            currentMember?.role !== "admin" ? (
            <Button
              variant={"outline"}
              className="mt-4"
              onClick={() => setOnLeaveWorkspace(true)}
            >
              Leave
            </Button>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="text-sm font-bold mb-4 ">Contact Information</p>
          <div className="flex items-center gap-x-2">
            <div className="size-9 rounded-md text-slate-600 flex items-center justify-center">
              <Mail className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-slate-600">
                Email Address
              </p>
              <Link
                href={`mailto=${member.user.email}`}
                className="text-sm hover:underline hover:text-[#1264a3]"
              >
                {member.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

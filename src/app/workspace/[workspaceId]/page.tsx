"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const WorkspacePage = () => {
  const { workspaceId } = useWorkspaceId();
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });
  const [open, setOpen] = useCreateChannelModal();
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });

  const router = useRouter();

  const channelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => member?.role === "admin", [member]);

  useEffect(() => {
    if (workspaceLoading || channelsLoading || !workspace) return;

    if (channelId) {
      router.replace(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    workspaceLoading,
    channelsLoading,
    workspace,
    channelId,
    open,
    setOpen,
    router,
    workspaceId,
    isAdmin,
    memberLoading,
    member,
  ]);

  if (workspaceLoading || channelsLoading || memberLoading) {
    return (
      <div className="flex items-center justify-center h-full flex-1 flex-col gap-2">
        <Loader className="size-8 animate-spin text-white" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex items-center justify-center h-full flex-1 flex-col gap-2">
        <AlertTriangle className="size-6 text-slate-700" />
        <span>Workspace Not Found</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full flex-1 flex-col gap-2">
      <AlertTriangle className="size-6 text-slate-700" />
      <span>No Channel Found</span>
    </div>
  );
};

export default WorkspacePage;

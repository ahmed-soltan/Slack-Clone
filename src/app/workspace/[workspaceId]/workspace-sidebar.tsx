import {
  AlertTriangle,
  Hash,
  Loader,
  MessageSquare,
  SendHorizonal,
} from "lucide-react";

import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import WorkspaceSection from "./workspace-section";
import WorkspaceHeader from "./workspace-header";
import SidebarItem from "./sidebar-item";
import UserItem from "./user-item";

const WorkspaceSidebar = () => {
  const { workspaceId } = useWorkspaceId();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels } = useGetChannels({
    workspaceId,
  });
  const { data: members } = useGetMembers({
    workspaceId,
  });

  const { channelId } = useChannelId();

  const [, setOpen] = useCreateChannelModal();

  if (workspaceLoading || memberLoading) {
    return (
      <div className="flex items-center justify-center flex-col h-full bg-[#5E2C5F]">
        <Loader className="size-6 animate-spin text-white" />
      </div>
    );
  }

  if (!member || !workspace) {
    return (
      <div className="flex items-center gap-y-2 justify-center flex-col h-full bg-[#5E2C5F]">
        <AlertTriangle className="size-6 text-white" />
        <p>Workspace Not Found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#5E2C5F]">
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={member.role === "admin"}
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" icon={MessageSquare} id={"threads"} />
        <SidebarItem
          label="Drafts & Sends"
          icon={SendHorizonal}
          id={"drafts"}
        />
      </div>
      <WorkspaceSection
        label={"Channels"}
        hint={"New Channel"}
        onNew={member.role === "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            label={item.name}
            icon={Hash}
            id={item._id}
            key={item._id}
            variant={channelId === item?._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection label="Direct Messages" hint="New Direct Message">
        {members?.map((item) => (
          <UserItem
            label={item.user?.name}
            image={item.user?.image}
            id={item._id}
            key={item._id}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};

export default WorkspaceSidebar;

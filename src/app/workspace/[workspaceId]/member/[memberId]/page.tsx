"use client";

import { AlertTriangle, Loader } from "lucide-react";
import { useEffect } from "react";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import Conversation from "./conversation";

const MemberIdPage = () => {
  const { workspaceId } = useWorkspaceId();
  const { memberId } = useMemberId();

  const { mutate, isPending, data } = useCreateOrGetConversation();

  useEffect(() => {
    mutate({
      workspaceId,
      memberId,
    });
  }, [workspaceId, memberId, mutate]);

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-y-2">
        <AlertTriangle className="size-6 text-slate-600" />
        <span className="text-sm text-slate-600">Conversation not found</span>
      </div>
    );
  }

  return <Conversation id={data._id}/>;
};

export default MemberIdPage;

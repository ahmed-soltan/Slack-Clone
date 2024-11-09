import { Loader } from "lucide-react";

import { useGetMember } from "@/features/members/api/use-get-member";
import { useMemberId } from "@/hooks/use-member-id";
import { useGetMessages } from "@/features/messages/api/use-get-messages";

import { Id } from "../../../../../../convex/_generated/dataModel";
import Header from "./header";
import ChatInput from "./chat-input";
import MessageList from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";

interface ConversationProps {
  id: Id<"conversations">;
}

const Conversation = ({ id }: ConversationProps) => {
  const { memberId } = useMemberId();
  const { onOpenMemberId } = usePanel();

  const { data: currentMember, isLoading: loadingCurrentMember } = useGetMember(
    { id: memberId }
  );

  const { results, loadMore, status } = useGetMessages({
    conversationId: id,
  });

  if (loadingCurrentMember || status === "LoadingFirstPage") {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberImage={currentMember?.user.image}
        memberName={currentMember?.user.name}
        onClick={() => onOpenMemberId(memberId)}
      />
      <MessageList
        canLoadMore={status === "CanLoadMore"}
        variant="conversation"
        memberImage={currentMember?.user.image}
        memberName={currentMember?.user.name}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        data={results}
      />
      <ChatInput
        placeHolder={`Message ${currentMember?.user.name}`}
        conversationId={id}
      />
    </div>
  );
};

export default Conversation;

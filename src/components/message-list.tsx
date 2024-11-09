import { useState } from "react";
import { Loader } from "lucide-react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { Separator } from "./ui/separator";
import Message from "./message";
import ChannelHero from "./channel-hero";
import { Id } from "../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";

const TIME_THRESHOLD = 5;

interface MessageListProps {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: "channel" | "thread" | "conversation";
  data: GetMessagesReturnType | undefined;
  isLoadingMore: boolean;
  loadMore: () => void;
  canLoadMore: boolean;
}

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
};

const MessageList = ({
  memberName,
  memberImage,
  channelName,
  channelCreationTime,
  variant = "channel",
  data,
  isLoadingMore,
  loadMore,
  canLoadMore,
}: MessageListProps) => {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const { workspaceId } = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  const groupedMessages = data?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof data>
  );

  return (
    <div className="flex-1 flex flex-col-reverse pb-4 overflow-auto messages-scrollbar">
      {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => {
        return (
          <div key={dateKey}>
            <div className="text-center my-2 relative">
              <Separator className="absolute top-1/2 left-0 right border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const timeDifference =
                prevMessage &&
                Math.abs(
                  differenceInMinutes(
                    new Date(message._creationTime),
                    new Date(prevMessage._creationTime)
                  )
                );

              const isCompact =
                prevMessage &&
                prevMessage.user._id === message.user._id &&
                timeDifference !== null &&
                timeDifference < TIME_THRESHOLD;

              return (
                <Message
                  key={message._id}
                  id={message._id}
                  memberId={message.memberId}
                  authorImage={message.user?.image}
                  authorName={message.user.name}
                  isAuthor={message.memberId === currentMember?._id}
                  body={message.body}
                  image={message.image}
                  reactions={message.reactions}
                  threadCount={message.threadCount}
                  threadImage={message.threadImage}
                  threadTimestamp={message.threadTimestamp}
                  createdAt={message._creationTime}
                  updatedAt={message.updatedAt}
                  isEditing={editingId === message._id}
                  setEditingId={setEditingId}
                  isCompact={isCompact}
                  hideThreadButton={variant === "thread"}
                />
              );
            })}
          </div>
        );
      })}
      <div
        className="h-1 "
        ref={(el) => {
          if (el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting && canLoadMore) {
                  loadMore();
                }
              },
              {
                threshold: 1.0,
              }
            );
            observer.observe(el);
            return () => {
              observer.disconnect();
            };
          }
        }}
      />
      {isLoadingMore && (
        <div className="text-center my-2 relative">
          <Separator className="absolute top-1/2 left-0 right border-t border-gray-300" />
          <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
            <Loader className="size-4 animate-spin" />
          </span>
        </div>
      )}
      {variant == "channel" && channelName && channelCreationTime && (
        <ChannelHero
          channelName={channelName}
          channelCreationTime={channelCreationTime}
        />
      )}
    </div>
  );
};

export default MessageList;

import { useRef, useState } from "react";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { toast } from "sonner";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import dynamic from "next/dynamic";
import Quill from "quill";

import { useGetMessage } from "../api/use-get-message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCreateMessage } from "../api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";

import { Button } from "@/components/ui/button";
import Message from "@/components/message";

import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMessages } from "../api/use-get-messages";
import { Separator } from "@/components/ui/separator";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image?: Id<"_storage">;
};

const TIME_THRESHOLD = 5;

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
};

const Thread = ({ messageId, onClose }: ThreadProps) => {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const { workspaceId } = useWorkspaceId();
  const { channelId } = useChannelId();

  const { data: currentMember, isLoading: loadingCurrentMember } =
    useCurrentMember({ workspaceId });

  const { data: message, isLoading: LoadingMessage } = useGetMessage({
    id: messageId,
  });

  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const { loadMore, results, status } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>
  );

  if (LoadingMessage || loadingCurrentMember || status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Thread</p>
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

  if (!message) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button size={"iconSm"} onClick={onClose} variant={"ghost"}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-slate-600" />
          <p className="text-xs text-slate-600">Not Found</p>
        </div>
      </div>
    );
  }
  const onSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image?: File | null;
  }) => {
    try {
      setIsPending(true);

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        parentMessageId: message._id,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) {
          throw new Error("Failed to generate upload URL");
        }

        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": image.type,
          },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();

        values.image = storageId;
      }
      await createMessage(values, { throwError: true });

      setEditorKey((prevKey) => prevKey + 1);
    } catch (error) {
      toast.error("failed to Send Message");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 h-[49px] border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button size={"iconSm"} onClick={onClose} variant={"ghost"}>
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
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
                    hideThreadButton
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
        <Message
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
          hideThreadButton={true}
        />
      </div>
      <div className="px-4">
        <Editor
          key={editorKey}
          //@ts-ignore
          ref={editorRef}
          onSubmit={onSubmit}
          disabled={false}
          placeHolder="Reply..."
        />
      </div>
    </div>
  );
};

export default Thread;

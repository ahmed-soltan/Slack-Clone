import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import dynamic from "next/dynamic";

import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useToggleReactions } from "@/features/reactions/api/use-toggle-reaction";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Thumbnail from "./thumbnail";
import Toolbar from "./toolbar";
import Hint from "./hint";
import ConfirmModal from "./confirm-modal";
import Reactions from "./reactions";

import { Doc, Id } from "../../convex/_generated/dataModel";
import { usePanel } from "@/hooks/use-panel";
import ThreadBar from "./thread-bar";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

const formatDateLabel = (date: Date) => {
  return `${
    isToday(date)
      ? "Today"
      : isYesterday(date)
        ? "Yesterday"
        : format(date, "MMM d, yyyy")
  } at ${format(date, "h:mm:ss a")}`;
};

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image?: string | undefined | null;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadTimestamp?: number;
  threadImage?: string;
  threadName?: string;
}
const Message = ({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadTimestamp,
  threadImage,
  isCompact,
  threadName,
}: MessageProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const { onOpen, onClose, parentMessageId, profileMemberId, onOpenMemberId } =
    usePanel();

  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemoveMessage } =
    useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReact } =
    useToggleReactions();

  const isPending = isUpdatingMessage || isRemoveMessage || isTogglingReact;

  const avatarFallback = authorName?.charAt(0).toUpperCase();

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("message updated successfully");
          setEditingId(null);
        },
        onError: (error) => {
          toast.error("Error updating message");
          console.error("Error updating message:", error);
        },
      }
    );
    setEditingId(null);
  };

  const handleDelete = () => {
    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("message deleted successfully");

          if (parentMessageId === id) {
            onClose();
          }
        },
        onError: (error) => {
          toast.error("Error deleting message");
          console.error("Error deleting message:", error);
        },
        onSettled: () => setIsDeleting(false),
      }
    );
  };

  const handleReaction = (value: string) => {
    toggleReaction(
      { value, messageId: id },
      {
        onError: (error) => {
          toast.error("Error adding reaction");
          console.error("Error adding reaction:", error);
        },
      }
    );
  };

  if (isCompact) {
    return (
      <>
        <ConfirmModal
          title="Are You Sure?"
          message="This Action can not be undone"
          callbackFn={handleDelete}
          open={isDeleting}
          setOpen={setIsDeleting}
        />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
            isRemoveMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className="flex items-start gap-2">
            <Hint label={formatDateLabel(new Date(createdAt))}>
              <button className="text-xs text-slate-700 opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline ">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValues={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail url={image} />

                {updatedAt && (
                  <span className="text-xs text-slate-500 font-medium">
                    (edited)
                  </span>
                )}
                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  timestamp={threadTimestamp}
                  image={threadImage}
                  name={threadName}
                  onClick={() => onOpen(id)}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id)}
              handleDelete={() => setIsDeleting(true)}
              handleThread={() => onOpen(id)}
              handleReaction={handleReaction}
              hideThreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmModal
        title="Are You Sure?"
        message="This Action can not be undone"
        callbackFn={handleDelete}
        open={isDeleting}
        setOpen={setIsDeleting}
      />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemoveMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-2">
          <button onClick={() => onOpenMemberId(memberId)}>
            <Avatar>
              <AvatarImage src={authorImage} className="rounded-md" />
              <AvatarFallback className="rounded-md bg-sky-700 text-white text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValues={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  onClick={() => onOpenMemberId(memberId)}
                  className="font-bold text-black hover:underline"
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatDateLabel(new Date(createdAt))}>
                  <button className="text-xs text-slate-600 hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>

              <Renderer value={body} />
              <Thumbnail url={image} />
              {updatedAt && (
                <span className="text-xs text-slate-500 font-medium">
                  (edited)
                </span>
              )}
              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                timestamp={threadTimestamp}
                image={threadImage}
                name={threadName}
                onClick={() => onOpen(id)}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleDelete={() => setIsDeleting(true)}
            handleThread={() => onOpen(id)}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  );
};

export default Message;

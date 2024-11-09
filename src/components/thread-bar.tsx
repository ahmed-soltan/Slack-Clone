import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronRight } from "lucide-react";

interface ThreadBarProps {
  count?: number;
  image?: string;
  timestamp?: number;
  name?:string;
  onClick?: () => void;
}
const ThreadBar = ({ count, image, timestamp, onClick , name="Member" }: ThreadBarProps) => {
    const avatarFallback = name?.charAt(0).toUpperCase();
  if (!count || !timestamp) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md hover:bg-white border border-transparent hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage className="rounded-md" src={image} />
          <AvatarFallback className="rounded-md bg-sky-700 text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-sky-600 hover:underline font-bold truncate">
          {count > 1 ? `${count} Replies` : `${count} Reply`}
        </span>
        <span className="text-xs text-slate-600 truncate group-hover/thread-bar:hidden block">
          Last Reply {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <span className="text-xs text-slate-600 truncate group-hover/thread-bar:block hidden">
          View Thread
        </span>
      </div>
      <ChevronRight className="size-4 text-slate-600 opacity-0 ml-auto group-hover/thread-bar:opacity-100 transition shrink-0" />
    </button>
  );
};

export default ThreadBar;

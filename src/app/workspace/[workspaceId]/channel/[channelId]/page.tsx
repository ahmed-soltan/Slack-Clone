"use client";

import { AlertTriangle, Loader } from "lucide-react";

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import Header from "./header";
import ChatInput from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import MessageList from "@/components/message-list";

const ChannelIdPage = () => {
  const { channelId } = useChannelId();

  const { results, status, loadMore } = useGetMessages({ channelId });

  console.log({ results });

  const { data: channel, isLoading: channelLoading } = useGetChannel({
    channelId,
  });

  if (channelLoading || status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader className="size-5 animate-spin text-slate-700" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full gap-y-2">
        <AlertTriangle className="size-6 text-slate-700" />
        <span className="text-sm text-slate-700">Channel Not Found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        canLoadMore={status === "CanLoadMore"}
        isLoadingMore={status === "LoadingMore"}
      />
      <ChatInput placeHolder={`Message # ${channel.name}`} />
    </div>
  );
};

export default ChannelIdPage;

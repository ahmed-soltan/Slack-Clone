import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

export const useChannelId = () =>{
    const params = useParams();
    const channelId = params.channelId as Id<"channels">;
    return {channelId};
}
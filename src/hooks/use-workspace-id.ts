import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

export const useWorkspaceId = () =>{
    const params = useParams();
    const workspaceId = params.workspaceId as Id<"workspaces">;
    return {workspaceId};
}
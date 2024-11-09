import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

export const useMemberId = () => {
  const params = useParams();
  const memberId = params.memberId as Id<"members">;
  return { memberId };
};

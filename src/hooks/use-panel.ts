import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const [profileMemberId, setProfileMemberId] = useProfileMemberId();


  const onOpenMemberId = (memberId: string) => {
    setProfileMemberId(memberId);
    setParentMessageId(null); 
  };

  const onOpen = (messageId: string) => {
    setParentMessageId(messageId);
    setProfileMemberId(null);  
  };

  const onClose = () => {
    setParentMessageId(null);
    setProfileMemberId(null);
  }


  return {
    onOpen,
    onClose,
    parentMessageId,
    onOpenMemberId,
    profileMemberId,
  };
};

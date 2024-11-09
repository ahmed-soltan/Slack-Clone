import React, { useRef, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Quill from "quill";

import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";

import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputsProps {
  placeHolder: string;
  conversationId: Id<"conversations">;
}

type CreateMessageValues = {
  conversationId: Id<"conversations">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage">;
};

const ChatInput = ({ placeHolder, conversationId }: ChatInputsProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { workspaceId } = useWorkspaceId();

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
        conversationId,
        workspaceId,
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
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeHolder={placeHolder}
        onSubmit={onSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};

export default ChatInput;

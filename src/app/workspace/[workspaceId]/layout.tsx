"use client";

import { Loader } from "lucide-react";

import Toolbar from "./toolbar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkspaceSidebar from "./workspace-sidebar";
import Profile from "@/features/members/components/profile";
import Thread from "@/features/messages/components/thread";

import { usePanel } from "@/hooks/use-panel";

import { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "./Sidebar";

export default function WorkspaceIdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { parentMessageId, onClose, profileMemberId } = usePanel();

  const showPanel = !!parentMessageId || !!profileMemberId;

  return (
    <>
      <div className="h-full">
        <Toolbar />
        <div className="flex h-[calc(100vh-40px)]">
          <Sidebar />
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId={"as_workspace_layout"}
          >
            <ResizablePanel
              defaultSize={20}
              minSize={11}
              className="bg-[#5E2C5F]"
            >
              <WorkspaceSidebar />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={20} defaultSize={89}>{children}</ResizablePanel>
            {showPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={20} defaultSize={29}>
                  {parentMessageId ? (
                    <Thread
                      messageId={parentMessageId as Id<"messages">}
                      onClose={onClose}
                    />
                  ) : profileMemberId ? (
                    <Profile
                      memberId={profileMemberId as Id<"members">}
                      onClose={onClose}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Loader className="size-5 animate-spin text-slate-600" />
                    </div>
                  )}
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </>
  );
}

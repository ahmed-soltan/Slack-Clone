"use client";

import { Info, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useState } from "react";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import Link from "next/link";

const Toolbar = () => {
  const [open, setOpen] = useState(false);
  const { workspaceId } = useWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });
  const { data: channels, isLoading: isLoadingChannels } = useGetChannels({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-[642px] grow-[2] shrink">
        <Button
          size={"sm"}
          className="bg-slate-200/25 hover:bg-slate-200/40 w-full justify-start h-7 px-2"
          onClick={() => setOpen(true)}
        >
          <Search className="size-4 text-white mr-2" />
          <span className="text-white text-xs">Search {data?.name}</span>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Channels">
              {channels?.map((item) => (
                <CommandItem key={item._id} asChild onSelect={()=>setOpen(false)}>
                  <Link href={`/workspace/${workspaceId}/channel/${item._id}`}>
                    # {item.name}
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Members">
              {members?.map((item) => (
                <CommandItem key={item._id} asChild onSelect={()=>setOpen(false)}>
                  <Link href={`/workspace/${workspaceId}/member/${item._id}`}>
                    {item.user?.name}
                  </Link>
                </CommandItem>
              ))}{" "}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <div className="ml-auto flex-1 flex items-center justify-end">
        <Button variant={"transparent"} size={"iconSm"}>
          <Info className="size-5 text-white" />
        </Button>
      </div>
    </nav>
  );
};

export default Toolbar;

"use client";

import Image from "next/image";
import Link from "next/link";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { useJoin } from "@/features/workspaces/api/use-join";
import { cn } from "@/lib/utils";

const JoinPage = () => {
  const { workspaceId } = useWorkspaceId();

  const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });
  const { mutate, isPending } = useJoin();
  const router = useRouter();

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);

  useEffect(() => {
    if (isMember) {
      router.push(`/workspace/${workspaceId}`);
    }
  }, [isMember, workspaceId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="size-4 animate-spin" />
      </div>
    );
  }

  const handleComplete = (value: string) => {
    mutate(
      { workspaceId, joinCode: value },
      {
        onSuccess(id) {
          toast.success("workspace Joined");
          router.replace(`/workspace/${id}`);
        },
        onError(error) {
          console.log(error);
          toast.error("Failed to join workspace");
        },
      }
    );
  };

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <Image src={"/logo.png"} alt="Logo" width={60} height={60} />
      <div className="flex flex-col items-center justify-center max-w-md gap-y-4">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {data?.name}</h1>
          <p className="text-ms text-slate-700">
            Enter the workspace Code to Join
          </p>
        </div>
        <VerificationInput
          length={6}
          classNames={{
            container: cn(
              "flex gap-x-2",
              isPending && "opacity-50 cursor-not-allowed"
            ),
            character:
              "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
            characterInactive: "bg-slate-200",
            characterSelected: "text-black bg-white",
            characterFilled: "text-black bg-white",
          }}
          onComplete={handleComplete}
        />
      </div>
      <div className="flex gap-x-4">
        <Button size="lg" variant={"outline"} asChild>
          <Link href={`/`}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;

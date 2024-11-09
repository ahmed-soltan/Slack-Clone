import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = {
  id: Id<"channels">;
  workspaceId: Id<"workspaces">;
  name: string;
};
type ResponseType = Id<"channels"> | null;

type Options = {
  onSuccess?: (response: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useUpdateChannel = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);

  const [status, setStatus] = useState<
    "error" | "success" | "pending" | "settle" | null
  >(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settle", [status]);

  const mutation = useMutation(api.channels.update);

  const mutate = useCallback(async (values: RequestType, options?: Options) => {
    try {
      setStatus("pending");
      const response = await mutation(values);
      options?.onSuccess?.(response);
      setData(response);
      return response;
    } catch (error) {
      setStatus("error");
      setError(error as Error);
      options?.onError?.(error as Error);
      if (options?.throwError) {
        throw error;
      }
    } finally {
      setStatus("settle");
      options?.onSettled?.();
    }
  }, []);

  return { mutate, isPending, isSuccess, isError, isSettled, data, error };
};

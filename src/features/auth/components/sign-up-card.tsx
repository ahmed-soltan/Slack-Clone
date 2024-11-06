import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { SignInFlow } from "../types";
import { AlertTriangle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

interface SignUpCardProps {
  setState: (state: SignInFlow) => void;
}

const SignUpCard = ({ setState }: SignUpCardProps) => {
  const { signIn } = useAuthActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    void signIn("password", { name, email, password, flow: "signUp" })
      .catch((error) => {
        console.log(error)
        setError("Invalid Email or Password");
      })
      .finally(() => {
        setPending(false);
      });
  };


  const onProviderSignUp = (provider: "github" | "google") => {
    setPending(true);
    void signIn(provider).finally(() => {
      setPending(false);
    });
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="mb-1">Sign up to Continue</CardTitle>
        <CardDescription>
          Use Your Email or Another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className="bg-rose-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-rose-500 mb-6">
          <AlertTriangle className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={onPasswordSignIn} className="space-y-2.5">
          <Input
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            type="email"
            required
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            required
          />
          <Input
            disabled={pending}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            type="password"
            required
          />
          <Button
            type="submit"
            className="w-full"
            size={"lg"}
            disabled={pending}
          >
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            className="w-full relative"
            size={"lg"}
            disabled={pending}
            variant={"outline"}
            onClick={() => onProviderSignUp("google")}
          >
            <FcGoogle className="size-6 absolute top-3 left-2.5" />
            Continue with Google
          </Button>
          <Button
            className="w-full relative"
            size={"lg"}
            disabled={pending}
            variant={"outline"}
            onClick={() => onProviderSignUp("google")}
          >
            <FaGithub className="size-6 absolute top-3 left-2.5" />
            Continue with GitHub
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          Already Have an Account?{" "}
          <span
            className="text-sky-600 hover:underline cursor-pointer"
            onClick={() => setState("signIn")}
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignUpCard;

"use client";

import { Provider } from "jotai";

interface JotiaProviderProps {
  children: React.ReactNode;
}

const JotiaProvider = ({ children }: JotiaProviderProps) => {
  return <Provider>{children}</Provider>;
};

export default JotiaProvider;

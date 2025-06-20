import { ErrorBoundary } from "@sentry/react";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Provider } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query";
import { useHydrateAtoms } from "jotai/react/utils";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import { globalStore } from "./atoms/global_store";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string);
        return response.json();
      },
    },
  },
});

const Providers = composeProviders([
  React.StrictMode,
  (props) => <ErrorBoundary {...props} fallback={<p>Broken</p>} onError={console.error} />,
  (props) => <QueryClientProvider {...props} client={queryClient} />,
  (props) => <Provider {...props} store={globalStore} />,
  HydrateAtoms,
  Suspense,
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Providers>
    <App />
  </Providers>,
);

function composeProviders(components: React.ComponentType<{ children: React.ReactNode }>[]) {
  return function Providers({ children }: { children: React.ReactNode }) {
    return components.reduceRight((acc, Component) => <Component>{acc}</Component>, children);
  };
}

function HydrateAtoms({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
}

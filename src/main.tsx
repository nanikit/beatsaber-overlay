import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "./app";
import "./index.css";

Sentry.init({
  dsn: "https://dce8ee84b40c4538865653bb9f33e378@o4504300642959360.ingest.sentry.io/4504300651216896",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1,
});

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<p>Broken</p>} onError={console.error}>
      <QueryClientProvider client={queryClient}>
        <Suspense>
          <App />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

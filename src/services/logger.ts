import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { atom } from "jotai";

Sentry.init({
  dsn:
    "https://dce8ee84b40c4538865653bb9f33e378@o4504300642959360.ingest.sentry.io/4504300651216896",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1,
});

const isLocal = location.hostname.match(/^(localhost|127\.0\.0\.\d+)$/);

export const loggerAtom = atom<undefined, Sentry.Breadcrumb>(
  undefined,
  (_get, _set, event: Sentry.Breadcrumb) => {
    if (isLocal) {
      console.log(event);
    }
    Sentry.addBreadcrumb(event);
  },
);

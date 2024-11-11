import { addBreadcrumb as sentryAddBreadcrumb, Breadcrumb, init } from "@sentry/react";

const isLocal = location.hostname.match(/^(localhost|127\.0\.0\.\d+)$/);

init({
  dsn:
    "https://dce8ee84b40c4538865653bb9f33e378@o4504300642959360.ingest.sentry.io/4504300651216896",
  tracesSampleRate: 0.1,
});

export function addBreadcrumb(event: Breadcrumb) {
  if (isLocal) {
    console.log(event);
  }
  sentryAddBreadcrumb(event);
}

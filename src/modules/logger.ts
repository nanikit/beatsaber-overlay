import { addBreadcrumb as sentryAddBreadcrumb, Breadcrumb, init } from "@sentry/react";

const isLocal = location.hostname.match(/^(localhost|127\.0\.0\.\d+)$/);

init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

export function addBreadcrumb(event: Breadcrumb) {
  if (isLocal) {
    console.log(event);
  }
  sentryAddBreadcrumb(event);
}

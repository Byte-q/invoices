import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: "https://0b64ea61be704b644eb790d024ff7176@o4510347472011269.ingest.de.sentry.io/4510347475746896",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  // that it will also get attached to your source maps
});
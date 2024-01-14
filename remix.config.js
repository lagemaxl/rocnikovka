/** @type {import('@remix-run/dev').AppConfig} */
export default {
  postcss: true,
  routes(defineRoutes) {
    return defineRoutes((route) => {
      route("/app", "routes/app.tsx", () => {
        route("home", "routes/Home.tsx", { index: true });
        route("new", "components/newevent.tsx", { index: true });
        route("event", "routes/event.tsx", { index: true });
        route("profile", "routes/profile.tsx", { index: true });
      });
    });
  }
};
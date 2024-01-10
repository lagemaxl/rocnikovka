/** @type {import('@remix-run/dev').AppConfig} */
export default {
  postcss: true,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  routes(defineRoutes) {
    return defineRoutes((route) => {
      //route("/app", "routes/app.tsx", { index: true });
      //route("about", "about/route.tsx");
      route("/app", "routes/app.tsx", () => {
        route("home", "routes/Home.tsx", { index: true });
        route("new", "components/newevent.tsx", { index: true });
        route("event", "routes/event.tsx", { index: true });
        route("profile", "routes/profile.tsx", { index: true });
        //route("home", "routes/Home.tsx", { index: true });
        //route("trending", "concerts/trending.tsx");
      });
    });
  }
};
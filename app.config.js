export default {
  expo: {
    name: "fokus-tracker",
    slug: "fokus-tracker",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    // ❌ router kapatma trick'i
    experiments: {
      typedRoutes: false,
    },
  },
};

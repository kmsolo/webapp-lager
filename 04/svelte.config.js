import adapter from "@sveltejs/adapter-static";

export default {
  compilerOptions: {
    runes: true,
  },
  kit: {
    adapter: adapter({ fallback: "index.html" }),
    paths: {
      base: process.env.NODE_ENV === "production" ? "/kmom04" : "",
    },
  },
};

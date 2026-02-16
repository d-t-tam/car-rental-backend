declare namespace NodeJS {
  interface ProcessEnv {
    readonly DATABASE_URL: string;
    readonly DIRECT_URL: string;
    readonly SERVER_PORT: string;
    readonly NODE_ENV: "development" | "production" | "test";
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRES_IN: string;
  }
}

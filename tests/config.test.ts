import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAppConfig } from "@/lib/config";

describe("Environment Configuration (lib/config)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns parsed configuration when DATABASE_URL is present", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";
    process.env.APP_URL = "https://app.vorldx.com";
    process.env.LOCAL_STORAGE_PATH = "/var/data/storage";

    const config = getAppConfig();

    expect(config.databaseUrl).toBe("postgresql://user:pass@localhost:5432/testdb");
    expect(config.appUrl).toBe("https://app.vorldx.com");
    expect(config.localStoragePath).toBe("/var/data/storage");
  });

  it("throws a descriptive error when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;

    expect(() => getAppConfig()).toThrow(
      "[Config Error] Missing required environment variable: DATABASE_URL"
    );
  });

  it("applies sensible defaults for APP_URL and LOCAL_STORAGE_PATH if omitted", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/testdb";
    delete process.env.APP_URL;
    delete process.env.LOCAL_STORAGE_PATH;

    const config = getAppConfig();

    expect(config.appUrl).toBe("http://localhost:3000");
    expect(config.localStoragePath).toBe("./storage");
  });
});


import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/domain/catalog";
import {
  CatalogSnapshotUnavailableError,
  createCatalogSnapshotStore,
} from "./catalog-snapshot";

const MINUTE = 60_000;

function product(id: string): Product {
  return {
    id,
    slug: `product-${id}`,
    name: `Product ${id}`,
    description: "",
    images: [],
    categoryIds: ["women-tops"],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
  };
}

function setup(load: () => Promise<readonly Product[]>) {
  let time = 1_000_000;
  const onRefreshError = vi.fn();
  const loader = vi.fn(load);
  const store = createCatalogSnapshotStore({
    load: loader,
    refreshIntervalMs: 60 * MINUTE,
    maxAgeMs: 24 * 60 * MINUTE,
    failureBackoffMs: 5 * MINUTE,
    now: () => time,
    onRefreshError,
  });
  return {
    store,
    loader,
    onRefreshError,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

describe("createCatalogSnapshotStore", () => {
  it("loads once on first read and shares the load between concurrent readers", async () => {
    const { store, loader } = setup(async () => [product("1")]);

    const [a, b] = await Promise.all([store.getProducts(), store.getProducts()]);

    expect(a).toEqual([product("1")]);
    expect(b).toBe(a);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("serves a fresh snapshot without calling the provider again", async () => {
    const { store, loader, advance } = setup(async () => [product("1")]);
    await store.getProducts();

    advance(59 * MINUTE);
    await store.getProducts();
    await store.getProducts();

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("serves the current snapshot and refreshes once in the background after the interval", async () => {
    let version = 1;
    const { store, loader, advance } = setup(async () => [product(String(version))]);
    await store.getProducts();

    version = 2;
    advance(61 * MINUTE);
    const [first, second] = await Promise.all([store.getProducts(), store.getProducts()]);

    expect(first).toEqual([product("1")]);
    expect(second).toEqual([product("1")]);
    expect(loader).toHaveBeenCalledTimes(2);
    await vi.waitFor(async () => expect(await store.getProducts()).toEqual([product("2")]));
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("keeps the previous snapshot when a background refresh fails and backs off", async () => {
    let fail = false;
    const { store, loader, onRefreshError, advance } = setup(async () => {
      if (fail) throw new Error("provider down");
      return [product("1")];
    });
    await store.getProducts();

    fail = true;
    advance(61 * MINUTE);
    expect(await store.getProducts()).toEqual([product("1")]);
    await vi.waitFor(() => expect(onRefreshError).toHaveBeenCalledTimes(1));

    advance(1 * MINUTE);
    expect(await store.getProducts()).toEqual([product("1")]);
    expect(loader).toHaveBeenCalledTimes(2);

    advance(5 * MINUTE);
    await store.getProducts();
    expect(loader).toHaveBeenCalledTimes(3);
  });

  it("never serves a snapshot older than the maximum age", async () => {
    let fail = false;
    const { store, advance } = setup(async () => {
      if (fail) throw new Error("provider down");
      return [product("1")];
    });
    await store.getProducts();

    fail = true;
    advance(24 * 60 * MINUTE);

    await expect(store.getProducts()).rejects.toBeInstanceOf(CatalogSnapshotUnavailableError);
  });

  it("waits for a refresh when the snapshot has expired", async () => {
    let version = 1;
    const { store, advance } = setup(async () => [product(String(version))]);
    await store.getProducts();

    version = 2;
    advance(25 * 60 * MINUTE);

    expect(await store.getProducts()).toEqual([product("2")]);
  });

  it("reports unavailability without a snapshot and does not retry before the backoff", async () => {
    const { store, loader, onRefreshError, advance } = setup(async () => {
      throw new Error("provider down");
    });

    await expect(store.getProducts()).rejects.toBeInstanceOf(CatalogSnapshotUnavailableError);
    await expect(store.getProducts()).rejects.toBeInstanceOf(CatalogSnapshotUnavailableError);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(onRefreshError).toHaveBeenCalledTimes(1);

    advance(5 * MINUTE);
    await expect(store.getProducts()).rejects.toBeInstanceOf(CatalogSnapshotUnavailableError);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("does not expose the provider error to readers", async () => {
    const { store } = setup(async () => {
      throw new Error("secret-bearing provider detail");
    });

    await expect(store.getProducts()).rejects.toThrow("Catalog snapshot is unavailable");
  });

  it("rejects a refresh interval that is not below the maximum age", () => {
    expect(() =>
      createCatalogSnapshotStore({
        load: async () => [],
        refreshIntervalMs: 10,
        maxAgeMs: 10,
        failureBackoffMs: 0,
      }),
    ).toThrow(RangeError);
  });
});

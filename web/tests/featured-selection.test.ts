import assert from "node:assert/strict";
import test from "node:test";

import { selectDiverseStorefrontProducts, type FeaturedCandidate } from "../src/lib/featured-selection";

function product(partial: Partial<FeaturedCandidate> & Pick<FeaturedCandidate, "id" | "categorySlug">): FeaturedCandidate {
  return {
    inStock: true,
    featured: false,
    ...partial,
  };
}

test("homepage selection mixes categories instead of filling with caps", () => {
  const caps = Array.from({ length: 8 }, (_, index) =>
    product({ id: `cap-${index}`, categorySlug: "cap", featured: true }),
  );
  const selected = selectDiverseStorefrontProducts(
    [
      ...caps,
      product({ id: "jacket", categorySlug: "jackets" }),
      product({ id: "jeans", categorySlug: "jeans-2" }),
      product({ id: "tee", categorySlug: "t-shirt" }),
      product({ id: "felpa", categorySlug: "sweatshirt" }),
    ],
    8,
  );

  const groups = new Set(selected.map((item) => item.categorySlug));
  assert.equal(selected.length, 8);
  assert.equal(selected[0]?.id, "jacket");
  assert.ok(groups.has("jeans-2"));
  assert.ok(groups.has("t-shirt"));
  assert.ok(groups.has("sweatshirt"));
  assert.ok(groups.has("cap"));
  assert.ok(selected.filter((item) => item.categorySlug === "cap").length < 5);
});

test("sold-out statement pieces stay visible but do not lead when something is in stock", () => {
  const selected = selectDiverseStorefrontProducts(
    [
      product({ id: "jacket", categorySlug: "giacca-denim", inStock: false, featured: true }),
      product({ id: "jeans", categorySlug: "jeans-2", inStock: true }),
      product({ id: "cap", categorySlug: "cap", inStock: true, featured: true }),
    ],
    3,
  );

  assert.deepEqual(
    selected.map((item) => item.id),
    ["jeans", "jacket", "cap"],
  );
});

test("prefers the featured piece inside a category and keeps a single size of the list", () => {
  const selected = selectDiverseStorefrontProducts(
    [
      product({ id: "plain", categorySlug: "jeans-2" }),
      product({ id: "featured", categorySlug: "jeans-2", featured: true }),
      product({ id: "shorts", categorySlug: "denim-shorts" }),
    ],
    2,
  );

  assert.deepEqual(
    selected.map((item) => item.id),
    ["featured", "shorts"],
  );
});

export type FeaturedCandidate = {
  id: string;
  categorySlug: string;
  inStock: boolean;
  featured: boolean;
};

const GROUP_RANK = ["outerwear", "bottoms", "layer", "tops", "shirt", "head"] as const;

function diversityGroup(slug: string): string {
  const value = slug.toLowerCase();

  if (/(jacket|giacca)/.test(value)) return "outerwear";
  if (/camicia/.test(value)) return "shirt";
  if (/(t-?shirt|tee|maglia)/.test(value)) return "tops";
  if (/(sweat|felpa|hoodie)/.test(value)) return "layer";
  if (/(short|pantalon|pant|jean)/.test(value)) return "bottoms";
  if (/(cap|hat|cappell|bandana|accessor)/.test(value)) return "head";

  return value || "altro";
}

function groupRank(group: string): number {
  const index = GROUP_RANK.indexOf(group as (typeof GROUP_RANK)[number]);
  return index === -1 ? GROUP_RANK.length : index;
}

function compareCandidates(
  left: { product: FeaturedCandidate; index: number },
  right: { product: FeaturedCandidate; index: number },
): number {
  const stock = Number(right.product.inStock) - Number(left.product.inStock);
  if (stock) return stock;

  const featured = Number(right.product.featured) - Number(left.product.featured);
  if (featured) return featured;

  return left.index - right.index;
}

export function selectDiverseStorefrontProducts<T extends FeaturedCandidate>(
  products: T[],
  limit = 8,
): T[] {
  if (limit <= 0 || products.length === 0) return [];

  const indexed = products.map((product, index) => ({ product, index }));
  const groups = new Map<string, typeof indexed>();

  for (const item of indexed) {
    const group = diversityGroup(item.product.categorySlug);
    const list = groups.get(group) ?? [];
    list.push(item);
    groups.set(group, list);
  }

  const orderedGroups = [...groups.entries()]
    .map(([group, items]) => ({
      group,
      items: [...items].sort(compareCandidates),
    }))
    .sort((left, right) => groupRank(left.group) - groupRank(right.group) || left.group.localeCompare(right.group));

  const picked: T[] = [];
  const seen = new Set<string>();

  const take = (item: (typeof indexed)[number]) => {
    if (seen.has(item.product.id) || picked.length >= limit) return;
    seen.add(item.product.id);
    picked.push(item.product);
  };

  for (const group of orderedGroups) {
    const first = group.items[0];
    if (first) take(first);
  }

  const leftovers = indexed
    .filter((item) => !seen.has(item.product.id))
    .sort((left, right) => {
      const stock = Number(right.product.inStock) - Number(left.product.inStock);
      if (stock) return stock;

      const freshCategory =
        Number(picked.some((product) => product.categorySlug === left.product.categorySlug)) -
        Number(picked.some((product) => product.categorySlug === right.product.categorySlug));
      if (freshCategory) return freshCategory;

      const featured = Number(right.product.featured) - Number(left.product.featured);
      if (featured) return featured;

      const rank =
        groupRank(diversityGroup(left.product.categorySlug)) -
        groupRank(diversityGroup(right.product.categorySlug));
      if (rank) return rank;

      return left.index - right.index;
    });

  for (const item of leftovers) take(item);

  const heroIndex = picked.findIndex((product) => product.inStock);
  if (heroIndex <= 0) return picked.slice(0, limit);

  const hero = picked[heroIndex];
  const rest = picked.filter((product) => product.id !== hero.id);
  const bestHero = rest.reduce((current, product) => {
    if (!product.inStock) return current;
    const currentRank = groupRank(diversityGroup(current.categorySlug));
    const nextRank = groupRank(diversityGroup(product.categorySlug));
    if (nextRank < currentRank) return product;
    if (nextRank === currentRank && product.featured && !current.featured) return product;
    return current;
  }, hero);

  return [bestHero, ...picked.filter((product) => product.id !== bestHero.id)].slice(0, limit);
}

export type ProrationValues = {
  invoice?: string;
  grant?: string;
  credit?: string;
};

const KEY = "prorationSettings";

type Store = {
  site?: ProrationValues;
  plans?: Record<string, ProrationValues>;
  pricePoints?: Record<string, ProrationValues>;
};

const read = (): Store => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

const write = (s: Store) => localStorage.setItem(KEY, JSON.stringify(s));

export const getSite = (): ProrationValues => read().site ?? {};
export const setSite = (v: ProrationValues) => {
  const s = read();
  s.site = v;
  write(s);
};

export const getPlan = (id: string): ProrationValues => read().plans?.[id] ?? {};
export const setPlan = (id: string, v: ProrationValues) => {
  const s = read();
  s.plans = { ...(s.plans ?? {}), [id]: v };
  write(s);
};

const ppKey = (planId: string, currency: string, freq: string) =>
  `${planId}::${currency}::${freq}`;

export const getPricePointProration = (
  planId: string,
  currency: string,
  freq: string
): ProrationValues => read().pricePoints?.[ppKey(planId, currency, freq)] ?? {};

export const getAnyPricePointProration = (): ProrationValues => {
  const pps = read().pricePoints ?? {};
  const first = Object.values(pps)[0];
  return first ?? {};
};

export const setPricePointProration = (
  planId: string,
  currency: string,
  freq: string,
  v: ProrationValues
) => {
  const s = read();
  s.pricePoints = { ...(s.pricePoints ?? {}), [ppKey(planId, currency, freq)]: v };
  write(s);
};

/** Cascade: pricePoint > plan > site */
export const getEffectiveForPricePoint = (
  planId: string,
  currency: string,
  freq: string
): ProrationValues => {
  const site = getSite();
  const plan = planId ? getPlan(planId) : {};
  const pp = planId ? getPricePointProration(planId, currency, freq) : {};
  return {
    invoice: pp.invoice ?? plan.invoice ?? site.invoice,
    grant: pp.grant ?? plan.grant ?? site.grant,
    credit: pp.credit ?? plan.credit ?? site.credit,
  };
};

/** Cascade: plan > site */
export const getEffectiveForPlan = (planId: string): ProrationValues => {
  const site = getSite();
  const plan = planId ? getPlan(planId) : {};
  return {
    invoice: plan.invoice ?? site.invoice,
    grant: plan.grant ?? site.grant,
    credit: plan.credit ?? site.credit,
  };
};

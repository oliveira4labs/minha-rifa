import { readJson, writeJson } from '../../../shared/lib/storage';

const ordersKey = (slug) => `rifa:${slug}:pedidos`;
const BUYER_KEY = 'rifa:comprador';

export const loadOrderTokens = (slug) => readJson(ordersKey(slug), []);

export const addOrderToken = (slug, token) => writeJson(ordersKey(slug), [token, ...loadOrderTokens(slug)]);

export const removeOrderToken = (slug, token) =>
  writeJson(ordersKey(slug), loadOrderTokens(slug).filter((t) => t !== token));

export const loadBuyer = () => readJson(BUYER_KEY, {});

export const saveBuyer = ({ name, phone }) => writeJson(BUYER_KEY, { name, phone });

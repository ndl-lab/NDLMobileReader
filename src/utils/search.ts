import { Book } from '../types';
import axios from 'axios';

export const searchBooksByBib = async (
  query: string,
  from = 0
) => {
  const url = `https://lab.ndl.go.jp/dl/api/book/search?searchfield=metaonly&from=${from}&keyword=${query}`;
  const resp = await axios.get(url);
  const count = resp.data.hit;
  const books = resp.data.list as Book[];
  return { count, books };
};

export const searchBooksByText = async (
  query: string,
  from = 0
) => {
  const url = `https://lab.ndl.go.jp/dl/api/book/search?from=${from}&keyword=${query}`;
  const resp = await axios.get(url);
  const count = resp.data.hit;
  const books = resp.data.list as Book[];
  return { count, books };
};

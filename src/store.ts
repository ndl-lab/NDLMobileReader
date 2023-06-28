import { atom, selector } from 'recoil';
import { BookData, Page } from './utils/book-image-utils';

export const readerPidState = atom<string | null>({
  key: 'readerPidState',
  default: null,
});

export const readerVisibleState = atom({
  key: 'readerVisibleState',
  default: false,
});

export const readerOcrModeState = atom({
  key: 'readerOcrModeState',
  default: false,
});

export const readerLeftOpenModeState = atom({
  key: 'readerLeftOpenModeState',
  default: false,
});

export const readerOpenState = atom({
  key: 'readerOpenState',
  default: false,
});

export const readerActiveIndexState = atom({
  key: 'readerActiveIndexState',
  default: 0,
});

export const readerBookDataState = atom<BookData | null>({
  key: 'readerBookDataState',
  default: null,
});

export const readerPagesState = atom<Page[]>({
  key: 'readerPagesState',
  default: [],
});

export const readerCurrentPageState = selector<Page | null>(
  {
    key: 'readerCurrentPageState',
    get: ({ get }) => {
      const pages = get(readerPagesState);
      const activeIndex = get(readerActiveIndexState);
      return pages[activeIndex] || null;
    },
  }
);

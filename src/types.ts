export interface Book {
  id: string;
  viewCount: number;
  listCount: number;
  reviewCount: number;
  autoTOCFlag: false;
  autoTOCindex: string[];
  index: string[];
  keywordsmetrics: string[];
  leftopen: boolean;
  page: number;
  published: string;
  publisher: string;
  publishyear: number;
  responsibility: string;
  title: string;
  version: number;
  volume: string;
  ndc: string;
  highlights: string[];
}

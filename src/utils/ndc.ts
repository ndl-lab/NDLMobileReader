import Data from './ndc9labels.json';

const NDC = Data as { [key: string]: string | null };

export function getNDCLabel(key: string) {
  return NDC[key];
}

export const NDC_LV1 = [
  '0 総記',
  '1 哲学',
  '2 歴史',
  '3 社会科学',
  '4 自然科学',
  '5 技術',
  '6 産業',
  '7 芸術',
  '8 言語',
  '9 文学',
];

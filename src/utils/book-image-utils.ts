import axios from 'axios';

export interface BookData {
  label: string;
  leftOpen: boolean;
  index?: [string, number][];
  pages: number;
  width: number;
  height: number;
  lx: number;
  ly: number;
  lw: number;
  lh: number;
  rx: number;
  ry: number;
  rw: number;
  rh: number;
}

export interface Page {
  index: number;
  imageUri: string;
  originalIndex: number;
  side: 'left' | 'right';
}

export async function buildBookData(pid: string) {
  const imageInfo: BookData = {
    label: '',
    leftOpen: false,
    index: [],
    pages: 0,
    width: 0,
    height: 0,
    lx: 0,
    ly: 0,
    lw: 0,
    lh: 0,
    rx: 0,
    ry: 0,
    rw: 0,
    rh: 0,
  };
  const url1 = `https://lab.ndl.go.jp/dl/api/book/${pid}`;
  const resp = await axios.get(url1);
  imageInfo.leftOpen = resp.data.leftopen;
  const indexArray = resp.data.index;
  for (let i = 0; i < indexArray.length; i++) {
    const index = indexArray[i];
    const parts = index.split('/');
    try {
      // 右側の文字列から4桁の数値を取得する
      const regex = /\d{4}/; // 4桁の数値にマッチする正規表現
      const matches = parts[1].match(regex);
      const page = matches ? parseInt(matches[0]) : 0;
      if (imageInfo.index)
        imageInfo.index.push([parts[0], page]);
    } catch (error) {
      console.log("Can't parse index", index, error);
    }
  }
  const url2 = `https://dl.ndl.go.jp/api/iiif/${pid}/manifest.json`;
  const resp2 = await axios.get(url2);
  imageInfo.label = resp2.data.label;
  const seq = resp2.data.sequences[0];
  const canvas = seq.canvases[0];
  imageInfo.width = canvas.width;
  imageInfo.height = canvas.height;
  imageInfo.pages = seq.canvases.length;
  const samplePage = Math.floor(imageInfo.pages / 2);
  const pageInfoUri = `https://lab.ndl.go.jp/dl/api/page/${pid}_${samplePage}`;
  const resp3 = await axios.get(pageInfoUri);
  const divide = resp3.data.divide;
  const rectX = resp3.data.rectX / 100;
  const rectY = resp3.data.rectY / 100;
  const rectW = resp3.data.rectW / 100;
  const rectH = resp3.data.rectH / 100;
  imageInfo.lx = Math.floor(imageInfo.width * rectX);
  imageInfo.ly = Math.floor(imageInfo.height * rectY);
  imageInfo.lw = Math.floor(
    imageInfo.width * divide - imageInfo.lx
  );
  imageInfo.lh = Math.floor(
    imageInfo.height * rectH - imageInfo.ly
  );
  imageInfo.rx = imageInfo.lx + imageInfo.lw;
  imageInfo.ry = imageInfo.ly;
  imageInfo.rw = Math.floor(
    imageInfo.width * rectW - imageInfo.rx
  );
  imageInfo.rh = imageInfo.lh;
  return imageInfo;
}

export function buildPages(
  pid: string,
  bookImageInfo: BookData,
  leftOpen: boolean
) {
  const pages: Page[] = [];
  const path = 'https://www.dl.ndl.go.jp/api/iiif';
  for (let i = 1; i <= bookImageInfo.pages; i++) {
    const indexStr = String(i).padStart(7, '0');
    const lxywh = [
      bookImageInfo.lx,
      bookImageInfo.ly,
      bookImageInfo.lw,
      bookImageInfo.lh,
    ].join(',');
    const rxywh = [
      bookImageInfo.rx,
      bookImageInfo.ry,
      bookImageInfo.rw,
      bookImageInfo.rh,
    ].join(',');
    const imageUriLeft = `${path}/${pid}/R${indexStr}/${lxywh}/1000,/0/default.jpg`;
    const imageUriRight = `${path}/${pid}/R${indexStr}/${rxywh}/1000,/0/default.jpg`;
    if (leftOpen) {
      pages.push({
        index: i * 2 - 1,
        imageUri: imageUriLeft,
        originalIndex: i,
        side: 'left',
      });
      pages.push({
        index: i * 2,
        imageUri: imageUriRight,
        originalIndex: i,
        side: 'right',
      });
    } else {
      pages.push({
        index: i * 2 - 1,
        imageUri: imageUriRight,
        originalIndex: i,
        side: 'right',
      });
      pages.push({
        index: i * 2,
        imageUri: imageUriLeft,
        originalIndex: i,
        side: 'left',
      });
    }
  }
  return pages;
}

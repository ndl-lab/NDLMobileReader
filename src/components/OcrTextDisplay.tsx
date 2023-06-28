import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

import { Page } from './SlideContent';
import './OcrTextDisplay.css';
import { BookData } from '../utils/book-image-utils';
import { useRecoilValue } from 'recoil';
import {
  readerActiveIndexState,
  readerPidState,
} from '../store';

type Props = {
  page: Page;
  isOcrMode: boolean;
  bookImageData: BookData;
};

type TextPiece = {
  id: number;
  contenttext: string;
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
};

const THRESHOLD = 5;

const OcrTextDisplay: React.FC<Props> = ({
  page,
  isOcrMode,
  bookImageData,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ocrText, setOcrText] = useState<
    TextPiece[] | null
  >(null);
  const [ctx, setCtx] =
    useState<CanvasRenderingContext2D | null>(null);

  // recoil values
  const activeIndex = useRecoilValue(
    readerActiveIndexState
  );
  const pid = useRecoilValue(readerPidState);

  const isActiveIndexNear = () => {
    return Math.abs(page.index - activeIndex) < THRESHOLD;
  };

  const fetchOcrText = async () => {
    if (isOcrMode && isActiveIndexNear() && !ocrText) {
      const pageInfoUri = `https://lab.ndl.go.jp/dl/api/page/${pid}_${page.originalIndex}`;
      const resp = await axios.get(pageInfoUri);
      const json = resp.data.coordjson;
      const pieces = JSON.parse(json) as TextPiece[];
      // filter text on left/right page
      let filtered = [];
      if (page.side === 'left') {
        filtered = pieces.filter(
          (piece) => piece.xmin < bookImageData!.rx
        );
      } else {
        filtered = pieces.filter(
          (piece) => piece.xmin >= bookImageData!.rx
        );
      }
      setOcrText(filtered);
    }
  };

  const drawText = () => {
    if (ocrText && bookImageData && ctx) {
      ocrText.forEach((text) => {
        let x = 0;
        let y = 0;
        if (text.xmin < bookImageData.rx) {
          const diffX = text.xmin - bookImageData.lx;
          const diffY = text.ymin - bookImageData.ly;
          x = Math.round(
            (diffX / bookImageData.lw) * window.innerWidth
          );
          y = Math.round(
            (diffY / bookImageData.lh) * window.innerHeight
          );
        } else {
          const diffX = text.xmin - bookImageData.rx;
          const diffY = text.ymin - bookImageData.ry;
          x = Math.round(
            (diffX / bookImageData.rw) * window.innerWidth
          );
          y = Math.round(
            (diffY / bookImageData.rh) * window.innerHeight
          );
        }
        if (bookImageData.leftOpen) {
          const w = text.xmax - text.xmin;
          const charSize =
            w / text.contenttext.length / 3.5;
          const fontSize = charSize < 10 ? '8px' : '10px';
          ctx.font = `600 ${fontSize} "游明朝", YuMincho, "Hiragino Mincho ProN W3", "ヒラギノ明朝 ProN W3", "Hiragino Mincho ProN", "HG明朝E", "ＭＳ Ｐ明朝", "ＭＳ 明朝", serif`;
          document.fonts.load(ctx.font).then(() => {
            ctx.fillText(text.contenttext, x, y);
          });
        } else {
          const h =
            ((text.ymax - text.ymin) /
              bookImageData.height) *
            window.innerHeight;
          let charSize = Math.round(
            h / text.contenttext.length
          );
          if (charSize < 10) {
            charSize = 10;
          }
          ctx.font = `600 ${charSize}px tategaki, YuMincho, "Hiragino Mincho ProN W3", "ヒラギノ明朝 ProN W3", "Hiragino Mincho ProN", "HG明朝E", "ＭＳ Ｐ明朝", "ＭＳ 明朝", serif`;
          const chars = text.contenttext.split('');
          const span = h / (text.contenttext.length - 1);
          //console.log(x, y, charSize);
          for (let i = 0; i < chars.length; i++) {
            if (charSize > 6 && charSize < 100) {
              let char = text.contenttext[i];
              if (char === '「') {
                char = '」';
              } else if (char === '」') {
                char = '「';
              } else if (char === '『') {
                char = '』';
              } else if (char === '』') {
                char = '『';
              }
              document.fonts.load(ctx.font).then(() => {
                ctx.fillText(char, x + 30, y + span * i);
              });
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    const canvas = ref.current!;
    const ratio = Math.ceil(window.devicePixelRatio);
    const ctx = ref.current!.getContext('2d');
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    setCtx(ctx);
  }, []);

  useEffect(() => {
    fetchOcrText();
  }, [pid, activeIndex, isOcrMode]);

  useEffect(() => {
    drawText();
  }, [ocrText]);

  return (
    <canvas className='ocr-display' ref={ref}></canvas>
  );
};

export default OcrTextDisplay;

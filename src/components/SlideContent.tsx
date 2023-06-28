import { IonSpinner } from '@ionic/react';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { readerActiveIndexState } from '../store';
import { BookData } from '../utils/book-image-utils';
import OcrTextDisplay from './OcrTextDisplay';
import './SlideContent.css';

export interface Page {
  originalIndex: number;
  index: number;
  imageUri: string;
  side: 'left' | 'right';
}

type Props = {
  page: Page;
  bookImageData: BookData;
  isOcrMode: boolean;
};

const THRESHOLD = 5;

const SlideContent: React.FC<Props> = ({
  page,
  bookImageData,
  isOcrMode,
}) => {
  const activeIndex = useRecoilValue(
    readerActiveIndexState
  );

  const [isLoading, setLoading] = useState(true);

  const isActiveIndexNear = () => {
    return Math.abs(page.index - activeIndex) < THRESHOLD;
  };

  if (!isActiveIndexNear()) {
    return <></>;
  }
  if (isOcrMode) {
    return (
      <OcrTextDisplay
        page={page}
        isOcrMode={isOcrMode}
        bookImageData={bookImageData}
      ></OcrTextDisplay>
    );
  } else {
    return (
      <>
        {isLoading && (
          <div className='container'>
            <IonSpinner></IonSpinner>
          </div>
        )}
        <img
          alt='slide'
          src={page.imageUri}
          style={{
            width: '100%',
            display: isLoading ? 'none' : 'block',
          }}
          onLoad={() => setLoading(false)}
        />
      </>
    );
  }
};

export default SlideContent;

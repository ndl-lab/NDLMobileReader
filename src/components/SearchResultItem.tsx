import {
  IonChip,
  IonItem,
  IonLabel,
  IonThumbnail,
} from '@ionic/react';
import { getNDCLabel } from '../utils/ndc';
import { Book } from '../types';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  readerPidState,
  readerOpenState,
  readerActiveIndexState,
  readerVisibleState,
} from '../store';

type Props = {
  book: Book;
  keyword: string;
};
const SearchResultItem: React.FC<Props> = ({
  book,
  keyword,
}) => {
  const r = book;
  const highlight = (text: string, keyword: string) => {
    return text.replace(keyword, `<em>${keyword}</em>`);
  };
  const info = `${r.responsibility} ${r.publisher} ${r.published}`;

  const setPid = useSetRecoilState(readerPidState);
  const setReaderOpen = useSetRecoilState(readerOpenState);
  const [activeIndex, setActiveIndex] = useRecoilState(
    readerActiveIndexState
  );
  const setReaderVisible = useSetRecoilState(
    readerVisibleState
  );

  const openReader = () => {
    setPid(book.id);
    setActiveIndex(0);
    setReaderVisible(true);
    setReaderOpen(true);
  };

  return (
    <IonItem key={r.id} onClick={openReader}>
      <IonThumbnail slot='start'>
        <img
          alt='doc'
          src={`https://www.dl.ndl.go.jp/api/iiif/${r.id}/R0000002/full/256,/0/default.jpg`}
        />
      </IonThumbnail>
      <IonLabel>
        <h2>
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(r.title, keyword),
            }}
          ></span>
          {r.ndc && (
            <IonChip color='secondary'>
              <IonLabel>{getNDCLabel(r.ndc)}</IonLabel>
            </IonChip>
          )}
        </h2>
        <p
          dangerouslySetInnerHTML={{
            __html: highlight(info, keyword),
          }}
        ></p>
        {r.highlights.length > 0 && (
          <div className='highlight-result'>
            {r.highlights.map((h) => (
              <p
                className='hit-text'
                key={h}
                dangerouslySetInnerHTML={{
                  __html: '・' + h,
                }}
              ></p>
            ))}
          </div>
        )}
      </IonLabel>
    </IonItem>
  );
};

export default SearchResultItem;

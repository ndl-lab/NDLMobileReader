import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonIcon,
} from '@ionic/react';
import { menuController } from '@ionic/core/components';
import { closeOutline, moveOutline } from 'ionicons/icons';
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import {
  readerActiveIndexState,
  readerBookDataState,
  readerCurrentPageState,
  readerOpenState,
  readerPidState,
} from '../store';
import { useState } from 'react';

import PagePositionEditorModal from './PagePositionEditorModal';

const ReaderMenu: React.FC = () => {
  // hooks

  // recoil states
  const [pid, setPid] = useRecoilState(readerPidState);
  const setReaderOpen = useSetRecoilState(readerOpenState);
  const bookData = useRecoilValue(readerBookDataState);
  const [activeIndex, setActiveIndex] = useRecoilState(
    readerActiveIndexState
  );
  const currentPage = useRecoilValue(
    readerCurrentPageState
  );

  // modals
  const [isSearchModalOpen, setSearchModalOpen] =
    useState(false);
  const [
    isPagePositionEditorOpen,
    setPagePositionEditorOpen,
  ] = useState(false);

  const closeReader = () => {
    setReaderOpen(false);
    setPid(null);
  };

  return (
    <IonMenu contentId='reader'>
      <IonHeader>
        <IonToolbar>
          <IonTitle>メニュー</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItemDivider>
            <IonLabel>アクション</IonLabel>
          </IonItemDivider>

          <IonItem
            onClick={() => {
              setPagePositionEditorOpen(true);
              menuController.toggle();
            }}
          >
            <IonIcon
              icon={moveOutline}
              slot='start'
            ></IonIcon>
            <IonLabel>ページ表示位置を調整</IonLabel>
          </IonItem>

          <IonItem onClick={closeReader}>
            <IonIcon
              icon={closeOutline}
              slot='start'
            ></IonIcon>
            <IonLabel>リーダーを閉じる</IonLabel>
          </IonItem>
          <IonItemDivider>
            <IonLabel>ブックマーク</IonLabel>
          </IonItemDivider>

          <IonItemDivider>
            <IonLabel>目次</IonLabel>
          </IonItemDivider>
          {bookData &&
            bookData.index &&
            bookData.index.map((s) => (
              <IonItem
                key={s[0] + s[1] + 'index'}
                onClick={() => {
                  setActiveIndex((s[1] - 1) * 2);
                  menuController.close();
                }}
              >
                {s[0]} コマ{s[1]}
              </IonItem>
            ))}
        </IonList>
      </IonContent>

      <PagePositionEditorModal
        isOpen={isPagePositionEditorOpen}
        setOpen={setPagePositionEditorOpen}
      ></PagePositionEditorModal>
    </IonMenu>
  );
};
export default ReaderMenu;

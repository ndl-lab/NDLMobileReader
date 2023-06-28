import {
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  readerPidState,
  readerActiveIndexState,
  readerBookDataState,
} from '../store';

type Props = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
};

const PagePositionEditorModal: React.FC<Props> = ({
  isOpen,
  setOpen,
}) => {
  const pid = useRecoilValue(readerPidState);

  const activeIndex = useRecoilValue(
    readerActiveIndexState
  );
  const [bookData, setBookData] = useRecoilState(
    readerBookDataState
  );

  const b = bookData;

  const [leftPosition, setLeftPosition] =
    useState<Crop | null>(null);
  const [rightPosition, setRightPosition] =
    useState<Crop | null>(null);
  const [target, setTarget] = useState<'left' | 'right'>(
    'left'
  );
  const originalIndex = Math.round(activeIndex / 2) + 1;
  const indexStr = String(originalIndex).padStart(7, '0');
  const [imageUri, setImageUri] = useState(
    `https://www.dl.ndl.go.jp/api/iiif/${pid}/R${indexStr}/full/1000,/0/default.jpg`
  );

  useEffect(() => {
    if (!b) return;
    setTarget('left');
    setImageUri(
      `https://www.dl.ndl.go.jp/api/iiif/${pid}/R${indexStr}/full/1000,/0/default.jpg`
    );
    setLeftPosition({
      unit: '%',
      x: (b.lx / b.width) * 100,
      y: (b.ly / b.height) * 100,
      width: (b.lw / b.width) * 100,
      height: (b.lh / b.height) * 100,
    });
    setRightPosition({
      unit: '%',
      x: (b.rx / b.width) * 100,
      y: (b.ry / b.height) * 100,
      width: (b.rw / b.width) * 100,
      height: (b.rh / b.height) * 100,
    });
  }, [isOpen, b]);

  const proceed = () => {
    if (!b || !leftPosition || !rightPosition || !pid)
      return;
    if (target === 'left') {
      // adjust the position of the right page based on the left
      rightPosition.x = leftPosition.x + leftPosition.width;
      rightPosition.y = leftPosition.y;
      rightPosition.width = leftPosition.width;
      rightPosition.height = leftPosition.height;
      setTarget('right');
    } else {
      const wRatio = b.width / 100;
      const hRatio = b.height / 100;
      const r = Math.round;
      const nb = { ...b };
      nb.lx = r(leftPosition.x * wRatio);
      nb.ly = r(leftPosition.y * hRatio);
      nb.lw = r(leftPosition.width * wRatio);
      nb.lh = r(leftPosition.height * hRatio);
      nb.rx = r(rightPosition.x * wRatio);
      nb.ry = r(rightPosition.y * hRatio);
      nb.rw = r(rightPosition.width * wRatio);
      nb.rh = r(rightPosition.height * hRatio);
      setBookData(nb);

      setOpen(false);
    }
  };

  if (!b || !leftPosition || !rightPosition) return <></>;
  return (
    <IonModal isOpen={isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonTitle className='ion-text-center'>
            ページ位置を調整
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {target === 'left' && (
          <>
            <ReactCrop
              crop={leftPosition}
              onChange={(_, percentCrop) =>
                setLeftPosition(percentCrop)
              }
            >
              <img
                src={imageUri}
                alt='base for position change'
              />
            </ReactCrop>
            <p className='ion-padding'>
              画像中の<b>左ページ</b>
              の位置を指定してください。位置が決まったら
              <b>決定</b>を押してください。
            </p>
          </>
        )}
        {target === 'right' && (
          <>
            <ReactCrop
              crop={rightPosition}
              onChange={(_, percentCrop) =>
                setRightPosition(percentCrop)
              }
            >
              <img
                src={imageUri}
                alt='base for position change'
              />
            </ReactCrop>
            <p className='ion-padding'>
              次に、画像中の<b>右ページ</b>
              の位置を指定してください。位置が決まったら
              <b>決定</b>を押してください。
            </p>
          </>
        )}
        <IonRow>
          <IonCol>
            <IonButton
              color='light'
              expand='block'
              onClick={() => setOpen(false)}
            >
              キャンセル
            </IonButton>
          </IonCol>
          <IonCol>
            <IonButton expand='block' onClick={proceed}>
              決定
            </IonButton>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonModal>
  );
};

export default PagePositionEditorModal;

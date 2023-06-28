import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  useIonToast,
  IonButtons,
  useIonActionSheet,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import ReactCrop, { PercentCrop } from 'react-image-crop';
import { useRecoilValue } from 'recoil';
import {
  readerPidState,
  readerActiveIndexState,
  readerBookDataState,
  readerCurrentPageState,
} from '../store';

type Props = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onImageCrop: (imageUri: string) => void;
};

const ImageCropModal: React.FC<Props> = ({
  isOpen,
  setOpen,
  onImageCrop,
}) => {
  const pid = useRecoilValue(readerPidState);
  const activeIndex = useRecoilValue(
    readerActiveIndexState
  );
  const bookData = useRecoilValue(readerBookDataState);
  const originalIndex = Math.floor(activeIndex / 2) + 1;
  const indexStr = String(originalIndex).padStart(7, '0');
  const [imageUri, setImageUri] = useState<string>(
    `https://www.dl.ndl.go.jp/api/iiif/${pid}/R${indexStr}/full/1000,/0/default.jpg`
  );
  const [toast] = useIonToast();
  const currentPage = useRecoilValue(
    readerCurrentPageState
  );
  const [position, setPosition] = useState<PercentCrop>({
    x: 10,
    y: 10,
    width: 50,
    height: 50,
    unit: '%',
  });
  const [present] = useIonActionSheet();

  useEffect(() => {
    if (!currentPage) return;
    setImageUri(currentPage.imageUri!);
    setPosition({
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      unit: '%',
    });
  }, [currentPage]);

  const getCroppedImageUri = async () => {
    if (!currentPage || !bookData) return '';
    const pX =
      currentPage.side === 'left'
        ? bookData.lx
        : bookData.rx;
    const pY =
      currentPage.side === 'left'
        ? bookData.ly
        : bookData.ry;
    const pWidth =
      currentPage.side === 'left'
        ? bookData.lw
        : bookData.rw;
    const pHeight =
      currentPage.side === 'left'
        ? bookData.lh
        : bookData.rh;
    const x = Math.round((position.x / 100) * pWidth) + pX;
    const y = Math.round((position.y / 100) * pHeight) + pY;
    const w = Math.round((position.width / 100) * pWidth);
    const h = Math.round((position.height / 100) * pHeight);
    const cropedImageUri = `https://www.dl.ndl.go.jp/api/iiif/${pid}/R${indexStr}/${x},${y},${w},${h}/full/0/default.jpg`;
    return cropedImageUri;
  };

  const copyImageUri = async () => {
    const cropedImageUri = await getCroppedImageUri();
    setOpen(false);
    toast({
      message: '画像URLをコピーしました',
      duration: 500,
      position: 'top',
    });
  };

  const attachToNote = async () => {
    setOpen(false);
    const croppedImageUri = await getCroppedImageUri();
    onImageCrop(croppedImageUri);
  };

  const showActionSheet = () => {
    present({
      header: '画像をどうしますか？',
      buttons: [
        { text: '画像URLをコピー', handler: copyImageUri },
        { text: 'キャンセル', role: 'cancel' },
      ],
    });
  };

  return (
    <IonModal isOpen={isOpen}>
      <IonHeader>
        <IonToolbar mode='ios'>
          <IonButtons
            slot='start'
            onClick={() => setOpen(false)}
          >
            <IonButton fill='clear'>キャンセル</IonButton>
          </IonButtons>
          <IonTitle className='ion-text-center'>
            画像を切り出し
          </IonTitle>
          <IonButtons slot='end'>
            <IonButton
              fill='clear'
              onClick={showActionSheet}
            >
              決定
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <>
          <ReactCrop
            crop={position}
            onChange={(_, percentCrop) =>
              setPosition(percentCrop)
            }
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={imageUri}
              alt='base for position change'
              style={{
                maxHeight: 'calc(100vh - 44px)',
                margin: 'auto',
              }}
            />
          </ReactCrop>
        </>
      </IonContent>
    </IonModal>
  );
};
export default ImageCropModal;

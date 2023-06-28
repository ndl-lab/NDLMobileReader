import { menuController } from '@ionic/core';
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonSpinner,
  IonContent,
  IonFooter,
  IonRange,
  IonMenuButton,
} from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Zoom } from 'swiper';
import 'swiper/css';
import 'swiper/css/zoom';
import '@ionic/react/css/ionic-swiper.css';
import { Swiper as SwiperType } from 'swiper/types';

import {
  readerActiveIndexState,
  readerBookDataState,
  readerLeftOpenModeState,
  readerOpenState,
  readerPagesState,
  readerPidState,
} from '../store';
import {
  buildBookData,
  buildPages,
} from '../utils/book-image-utils';

import SlideContent from './SlideContent';
import './ReaderModal.css';
import ReaderMenu from './ReaderMenu';
import ImageCropModal from './ImageCropModal';

const ReaderModal: React.FC = () => {
  // recoil states
  const pid = useRecoilValue(readerPidState);
  const [isReaderOpen, setReaderOpen] =
    useRecoilState(readerOpenState);
  const [activeIndex, setActiveIndex] = useRecoilState(
    readerActiveIndexState
  );
  const isLeftOpen = useRecoilValue(
    readerLeftOpenModeState
  );
  const [bookData, setBookData] = useRecoilState(
    readerBookDataState
  );

  const [pages, setPages] = useRecoilState(
    readerPagesState
  );

  // states
  const [showToolbars, setShowToolbars] = useState(true);
  const [isOcrMode, setOcrMode] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const swiperRef = useRef<SwiperType | undefined>();

  const [croppedImageUri, setCroppedImageUri] =
    useState('');
  const [showPagePositionAlert, setShowPagePositionAlert] =
    useState(false);

  // modals
  const [isImageCropModalOpen, setImageCropModalOpen] =
    useState(false);
  const [isNoteEditorModalOpen, setNoteEditorModalOpen] =
    useState(false);

  // fetch book image data and build pages
  useEffect(() => {
    const setUpPages = async () => {
      console.log('pid', pid);
      if (!pid) return;
      setLoading(true);
      setBookData(null);
      const bookData = await buildBookData(pid);
      setBookData(bookData);
      const pages = buildPages(pid, bookData, isLeftOpen);
      setPages(pages);
      setLoading(false);
    };
    if (pid) {
      setUpPages();
    }
  }, [pid]);

  // when book data changes, update pages
  useEffect(() => {
    if (!pid || !bookData) return;
    setLoading(true);
    const pages = buildPages(pid, bookData, isLeftOpen);
    setPages(pages);
    setLoading(false);
  }, [bookData]);

  // active index changed, slide to active index
  let timeout: NodeJS.Timeout;
  useEffect(() => {
    const swiper = swiperRef.current!;
    if (swiper && pages.length > 0) {
      swiper.slideTo(activeIndex, 5);
    }
    menuController.close();
  }, [activeIndex]);

  // set active index
  const onSlideChange = (swiper: SwiperType) => {
    const activeSlideIndex = swiper.activeIndex;
    setActiveIndex(activeSlideIndex);
  };

  return (
    <IonModal
      isOpen={isReaderOpen}
      onDidDismiss={() => setReaderOpen(false)}
    >
      <ReaderMenu />
      <IonPage id='reader'>
        {showToolbars && (
          <IonHeader>
            <IonToolbar style={{ position: 'fixed' }}>
              <IonButtons slot='start'>
                <IonButton
                  onClick={() => setReaderOpen(false)}
                >
                  <IonIcon
                    icon={chevronDownOutline}
                  ></IonIcon>
                </IonButton>

                <IonMenuButton></IonMenuButton>
              </IonButtons>
              <IonButtons slot='end'></IonButtons>
              <IonTitle>
                {bookData ? bookData.label : ''}
              </IonTitle>
            </IonToolbar>
          </IonHeader>
        )}
        {showToolbars && bookData && (
          <IonFooter
            style={{ position: 'fixed', bottom: 0 }}
          >
            <IonToolbar>
              <IonRange
                dir={isLeftOpen ? 'ltr' : 'rtl'}
                min={1}
                max={bookData.pages * 2}
                value={activeIndex}
                onIonKnobMoveEnd={(e) =>
                  setActiveIndex(e.detail.value as number)
                }
                pin={true}
                pinFormatter={(index) =>
                  Math.floor(index / 2) + 1
                }
              />
            </IonToolbar>
          </IonFooter>
        )}
        <IonContent
          fullscreen
          forceOverscroll
          scrollY={false}
        >
          {isLoading && (
            <div className='container'>
              <IonSpinner></IonSpinner>
            </div>
          )}
          {!isLoading && pages.length > 0 && (
            <Swiper
              dir={isLeftOpen ? 'ltr' : 'rtl'}
              modules={[Zoom]}
              style={{
                height: '100%',
              }}
              onSlideChangeTransitionEnd={(swiper) =>
                onSlideChange(swiper)
              }
              initialSlide={activeIndex}
              onClick={() => setShowToolbars(!showToolbars)}
              zoom
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
            >
              {pages.map((p) => (
                <SwiperSlide key={p.imageUri} zoom>
                  {bookData && (
                    <SlideContent
                      page={p}
                      bookImageData={bookData}
                      isOcrMode={isOcrMode}
                    ></SlideContent>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          {pages[activeIndex] &&
            showToolbars &&
            bookData && (
              <span className='page-number'>
                {pages[activeIndex].originalIndex}/
                {bookData!.pages}{' '}
                {pages[activeIndex].side === 'left'
                  ? '左'
                  : '右'}
              </span>
            )}
        </IonContent>
      </IonPage>
      <ImageCropModal
        isOpen={isImageCropModalOpen}
        setOpen={setImageCropModalOpen}
        onImageCrop={(imageUri: string) => {
          setCroppedImageUri(imageUri);
          setNoteEditorModalOpen(true);
        }}
      ></ImageCropModal>
    </IonModal>
  );
};

export default ReaderModal;

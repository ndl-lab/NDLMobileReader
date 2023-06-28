import React, { Fragment, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonToolbar,
} from '@ionic/react';

import './Home.css';
import { Book } from '../types';
import SearchResultItem from '../components/SearchResultItem';
import {
  searchBooksByBib,
  searchBooksByText,
} from '../utils/search';
import ReaderModal from '../components/ReaderModal';

type SearchMode = 'bib' | 'text';

const Home: React.FC = () => {
  const [searchMode, setSearchMode] =
    useState<SearchMode>('bib');
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<Book[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [hitCount, setHitCount] = useState(0);

  const search = async (from = 0): Promise<Book[]> => {
    switch (searchMode) {
      case 'bib': {
        const results1 = await searchBooksByBib(
          searchText,
          from
        );
        setHitCount(results1.count);
        return results1.books;
      }
      case 'text': {
        const results2 = await searchBooksByText(
          searchText,
          from
        );
        setHitCount(results2.count);
        return results2.books;
      }
      default:
        return [];
    }
  };

  const freshSeach = async () => {
    setLoading(true);
    const result = await search();
    setLoading(false);
    setSearchResult(result);
  };

  const additionalSearch = async () => {
    const results = await search(searchResult.length);
    const books = searchResult as Book[];
    const newBooks = results as Book[];
    setSearchResult([...books, ...newBooks]);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color='primary' mode='ios'>
          <IonSegment
            value={searchMode}
            onIonChange={(ev) => {
              setSearchMode(ev.target.value as SearchMode);
            }}
          >
            <IonSegmentButton value='bib'>
              <IonLabel>書誌検索</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value='text'>
              <IonLabel>全文検索</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonToolbar>
        <form
          onSubmit={async (ev) => {
            ev.preventDefault();
            await freshSeach();
            const form = ev.target as HTMLFormElement;
            form.blur();
          }}
        >
          <IonSearchbar
            inputMode='search'
            value={searchText}
            onIonInput={(e) =>
              setSearchText(e.detail.value!)
            }
            placeholder='キーワードを入力'
            style={{ marginTop: 12 }}
          ></IonSearchbar>
        </form>
      </IonToolbar>
      <IonContent fullscreen>
        {loading && (
          <div className='container'>
            <IonSpinner></IonSpinner>
          </div>
        )}
        {!loading && (
          <IonItemDivider>
            <IonLabel style={{ margin: 0 }}>
              {hitCount}件の結果が見つかりました
            </IonLabel>
          </IonItemDivider>
        )}
        <IonList>
          {!loading &&
            searchResult.map((r) => (
              <Fragment key={r.id}>
                <SearchResultItem
                  key={r.id}
                  keyword={searchText}
                  book={r}
                ></SearchResultItem>
              </Fragment>
            ))}
        </IonList>
        {!loading && (
          <IonInfiniteScroll
            onIonInfinite={async (ev) => {
              await additionalSearch();
              ev.target.complete();
            }}
          >
            <IonInfiniteScrollContent
              loadingText='読み込み中...'
              loadingSpinner='bubbles'
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        )}
      </IonContent>
      <ReaderModal></ReaderModal>
    </IonPage>
  );
};

export default Home;

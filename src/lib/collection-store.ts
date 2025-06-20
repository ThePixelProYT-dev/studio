import type { CollectionItem } from './types';

const COLLECTION_KEY = 'photoPoetCollections';

export function getCollections(): CollectionItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const storedCollections = localStorage.getItem(COLLECTION_KEY);
  return storedCollections ? JSON.parse(storedCollections) : [];
}

export function saveCollectionItem(item: CollectionItem): void {
  if (typeof window === 'undefined') {
    return;
  }
  const collections = getCollections();
  const updatedCollections = [item, ...collections];
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updatedCollections));
}

export function removeCollectionItem(itemId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const collections = getCollections();
  const updatedCollections = collections.filter(item => item.id !== itemId);
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updatedCollections));
}

export function updateCollectionItem(updatedItem: CollectionItem): void {
  if (typeof window === 'undefined') {
    return;
  }
  const collections = getCollections();
  const itemIndex = collections.findIndex(item => item.id === updatedItem.id);
  if (itemIndex > -1) {
    collections[itemIndex] = updatedItem;
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections));
  }
}

import { useSyncExternalStore } from 'react';
import { store } from './store';

export function useStoreSnapshot() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useDocumentList(status: 'active' | 'archived' | 'pending_deletion') {
  useStoreSnapshot();
  return store.listDocuments(status);
}

export function useDocument(id: number) {
  useStoreSnapshot();
  return store.getDocument(id);
}

export function useAssignments(documentId: number) {
  useStoreSnapshot();
  return store.getAssignments(documentId);
}

export function useDocumentTypes() {
  useStoreSnapshot();
  return store.getDocumentTypes();
}

export interface CollectionItem {
  id: string;
  imageDataUri: string;
  poem: string;
  createdAt: string;
  title?: string; // Optional: for user to name their creation
}

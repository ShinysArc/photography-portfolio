export type ImmichTag = { id: string; name?: string; value?: string | null };
export type ImmichExif = {
  make?: string;
  model?: string;
  lensModel?: string;
  fNumber?: number;
  exposureTime?: string | number;
  iso?: number;
  focalLength?: number;
  dateTimeOriginal?: string;
  exifImageWidth?: number;
  exifImageHeight?: number;
};
export type ImmichAsset = {
  id: string;
  originalFileName?: string;
  originalMimeType?: string;
  originalPath?: string;
  fileCreatedAt?: string;
  fileModifiedAt?: string;
  exifInfo?: ImmichExif;
  tags?: ImmichTag[];
};
export type CacheItem = {
  id: string;
  originalFileName?: string;
  originalMimeType?: string;
  fileCreatedAt?: string;
  fileModifiedAt?: string;
  width?: number;
  height?: number;
  exif: ImmichExif;
  tags: ImmichTag[];
};
export type CacheFile = {
  album: { id: string; name: string; assetCount: number };
  items: CacheItem[];
};

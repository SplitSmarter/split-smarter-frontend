import type {PlacePhotoDetails} from '@/src/api/dto/user/place';

const HTTP_URL = /^https?:\/\//i;

export function isUsablePlacePhotoUrl(url: string | null | undefined): boolean {
    return typeof url === 'string' && HTTP_URL.test(url.trim());
}

/** Keep only photos with absolute http(s) URLs so grids don't reserve empty tiles. */
export function filterUsablePlacePhotos(
    photos: PlacePhotoDetails[] | null | undefined,
): PlacePhotoDetails[] {
    if (!photos?.length) return [];
    return photos.filter((photo) => isUsablePlacePhotoUrl(photo?.url));
}

/** Sanitize ids for FileSystem cache paths (Google media names often contain `/`). */
export function toSafeImageCacheId(id: string): string {
    return id.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180) || 'image';
}

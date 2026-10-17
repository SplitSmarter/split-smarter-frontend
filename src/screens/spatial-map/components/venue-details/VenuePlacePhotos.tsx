import React, {useMemo} from 'react';
import {ImageGrid} from '@/src/utils/place/ImageGrid';
import type {PlacePhotoDetails} from '@/src/api/dto/user/place';
import {filterUsablePlacePhotos} from '@/src/utils/place/placePhotos';

interface VenuePlacePhotosProps {
    photos: PlacePhotoDetails[];
    loading?: boolean;
}

/** Photos strip under quick actions — always ImageGrid so empty/loading keep the same height. */
export function VenuePlacePhotos({photos, loading = false}: VenuePlacePhotosProps) {
    const usablePhotos = useMemo(() => filterUsablePlacePhotos(photos), [photos]);

    return <ImageGrid photos={usablePhotos} loading={loading} />;
}

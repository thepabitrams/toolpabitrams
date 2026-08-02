// src/tools/image/form-crop/useFCCrop.ts
import { useState, useCallback } from "react";

const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

export function useFCCrop() {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(1, prev - ZOOM_STEP));
  }, []);

  const reset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const isZoomMin = zoom <= 1;
  const isZoomMax = zoom >= MAX_ZOOM;

  return {
    crop,
    zoom,
    setCrop,
    setZoom,
    zoomIn,
    zoomOut,
    reset,
    isZoomMin,
    isZoomMax,
  };
}
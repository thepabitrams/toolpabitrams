import { useState, useCallback } from "react";

const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function useFCCrop() {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(1, prev - ZOOM_STEP));
  }, []);

  const rotateLeft = useCallback(() => {
    setRotation((prev) => prev - 90);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  const reset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  const isZoomMin = zoom <= 1;
  const isZoomMax = zoom >= MAX_ZOOM;

  return {
    crop,
    zoom,
    rotation,
    setCrop,
    setZoom,
    setRotation,
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    reset,
    isZoomMin,
    isZoomMax,
  };
}
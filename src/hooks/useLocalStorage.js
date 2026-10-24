import React from 'react';
import { INITIAL_PLANTS, STARTER_PRESETS, STORAGE_KEY, VERSION_KEY, CURRENT_VERSION } from '../constants/presets.js';

const { useState, useEffect, useCallback } = window.React || React;

export function usePlantStorage() {
  const [plants, setPlants] = useState(() => {
    try {
      const storedVersion = window.localStorage.getItem(VERSION_KEY);
      // Migration bump: If version doesn't match or is unversioned, overwrite keepgreen_plants with updated INITIAL_PLANTS array
      if (storedVersion !== CURRENT_VERSION) {
        window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
        return INITIAL_PLANTS;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Reconcile starter plant image updates so starter cards always display crisp, verified photos
          return parsed.map((p) => {
            const starterMatch = INITIAL_PLANTS.find((sp) => sp.id === p.id);
            if (starterMatch && starterMatch.imageUrl && p.imageUrl !== starterMatch.imageUrl) {
              return { ...p, imageUrl: starterMatch.imageUrl, image: starterMatch.image };
            }
            return p;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to parse localStorage plant data, using defaults:', err);
    }
    // Seed default presets on first run or empty
    try {
      window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
    } catch (e) {
      // ignore
    }
    return INITIAL_PLANTS;
  });

  // Persist to localStorage whenever plants state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
    }
  }, [plants]);

  // One-click quick action: mark as watered today (or custom past date)
  const waterPlant = useCallback((id, customDate = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dateToUse = customDate || todayStr;
    setPlants((prev) =>
      prev.map((plant) =>
        plant.id === id ? { ...plant, lastWateredDate: dateToUse } : plant
      )
    );
  }, []);

  // Add new custom plant
  const addPlant = useCallback((plantData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = Date.now();
    const newPlant = {
      id: 'plant-' + now + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: now,
      name: plantData.name.trim(),
      nickname: plantData.nickname?.trim() || null,
      subtitle: plantData.subtitle?.trim() || 'Custom Plant',
      location: plantData.location?.trim() || 'Home',
      waterIntervalDays: Number(plantData.waterIntervalDays) || 7,
      lastWateredDate: plantData.lastWateredDate || todayStr,
      sunlightLevel: plantData.sunlightLevel || 'medium',
      sunlightLabel: plantData.sunlightLabel || (
        plantData.sunlightLevel === 'low' ? 'Low / Shade Light' :
        plantData.sunlightLevel === 'high' ? 'Full Sun' : 'Bright / Indirect Light'
      ),
      waterAmount: plantData.waterAmount || 'medium',
      waterAmountLabel: plantData.waterAmountLabel || 'Medium Water',
      careTips: plantData.careTips?.trim() || 'Water when topsoil feels dry to touch.',
      imageUrl: plantData.imageUrl?.trim() || null,
      colorTheme: plantData.colorTheme || 'emerald'
    };
    setPlants((prev) => [newPlant, ...prev]);
  }, []);

  // Update existing plant
  const updatePlant = useCallback((updatedPlant) => {
    setPlants((prev) =>
      prev.map((plant) =>
        plant.id === updatedPlant.id
          ? {
              ...plant,
              ...updatedPlant,
              name: updatedPlant.name.trim(),
              nickname: updatedPlant.nickname?.trim() || null,
              subtitle: updatedPlant.subtitle?.trim() || plant.subtitle,
              location: updatedPlant.location?.trim() || plant.location,
              waterIntervalDays: Number(updatedPlant.waterIntervalDays) || plant.waterIntervalDays,
              lastWateredDate: updatedPlant.lastWateredDate || plant.lastWateredDate,
              sunlightLevel: updatedPlant.sunlightLevel || plant.sunlightLevel,
              sunlightLabel: updatedPlant.sunlightLabel || plant.sunlightLabel,
              careTips: updatedPlant.careTips?.trim() || plant.careTips,
              imageUrl: updatedPlant.imageUrl?.trim() || null
            }
          : plant
      )
    );
  }, []);

  // Remove a plant
  const deletePlant = useCallback((id) => {
    setPlants((prev) => prev.filter((plant) => plant.id !== id));
  }, []);

  // Reset back to starter preset library
  const resetToPresets = useCallback(() => {
    setPlants(INITIAL_PLANTS);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
      window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    plants,
    waterPlant,
    addPlant,
    updatePlant,
    deletePlant,
    resetToPresets
  };
}

export function getOrCreateAnonymousId() {
  const KEY = 'keepgreen_user_id';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = 'KG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    return 'KG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
}


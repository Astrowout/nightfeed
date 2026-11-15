import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import type { NightPhotoRef } from '../data/types';
import { api } from './auth';

export type PickedPhoto = { data: string; mime: 'image/jpeg'; width: number; height: number; preview: string };

const LONG_EDGE = 1440;

/**
 * Lets the person choose a photo of their day, then shrinks it on the device
 * (longest side 1440 px, JPEG) so uploads stay small and fast. Returns null if they cancel.
 */
export async function pickDayPhoto(): Promise<PickedPhoto | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (res.canceled || !res.assets?.[0]) return null;
  const uri = res.assets[0].uri;
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const scale = Math.min(1, LONG_EDGE / Math.max(original.width, original.height));
  const ctx = ImageManipulator.manipulate(uri);
  if (scale < 1) ctx.resize({ width: Math.round(original.width * scale) });
  const out = await (await ctx.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
  if (!out.base64) throw new Error('Could not read that photo. Try another one.');
  return { data: out.base64, mime: 'image/jpeg', width: out.width, height: out.height, preview: out.uri };
}

export function uploadDayPhoto(nightId: string, p: PickedPhoto) {
  return api<NightPhotoRef>(`/nights/${nightId}/photo`, {
    method: 'PUT',
    body: { data: p.data, mime: p.mime, width: p.width, height: p.height },
  });
}

export function removeDayPhoto(nightId: string) {
  return api(`/nights/${nightId}/photo`, { method: 'DELETE' });
}

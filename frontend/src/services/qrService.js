// src/services/qrService.js

import { apiPrivateRequest } from "./api"

export async function getQR() {
  const data = await apiPrivateRequest("/public/qr")
  return data.qr 
}
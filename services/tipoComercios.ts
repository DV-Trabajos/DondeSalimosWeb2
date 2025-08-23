import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import type { TipoComercio } from "./types";

export const tipoComercioService = {
  getAll: async (): Promise<TipoComercio[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/listado`);
  },

  getById: async (id: number): Promise<TipoComercio> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/buscarIdTipoComercio/${id}`);
  },

  getByName: async (name: string): Promise<TipoComercio[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/buscarNombreTipoComercio/${name}`);
  },

  create: async (
    tipoComercio: Omit<TipoComercio, "iD_TipoComercio" | "fechaCreacion">
  ): Promise<TipoComercio> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/crear`, {
      method: "POST",
      body: JSON.stringify(tipoComercio),
    });
  },

  update: async (
    id: number,
    tipoComercio: Partial<TipoComercio>
  ): Promise<TipoComercio> => {
    const tipoComercioToSend = {
      ...tipoComercio,
      iD_TipoComercio: id,
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(tipoComercioToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/eliminar/${id}`, {
      method: "DELETE",
    });
  },
};
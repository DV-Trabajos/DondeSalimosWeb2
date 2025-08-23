import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import { comercioService } from "./comercios";
import type { Publicidad } from "./types";

export const publicidadService = {
  getAll: async (): Promise<Publicidad[]> => {
    const publicidades = await fetchWithErrorHandling(`${API_BASE_URL}/publicidades/listado`);

    if (Array.isArray(publicidades)) {
      const comerciosPromises = publicidades.map((pub) =>
        comercioService
          .getById(pub.iD_Comercio)
          .then((comercio) => ({
            ...pub,
            comercioNombre: comercio.nombre,
          }))
          .catch(() => ({
            ...pub,
            comercioNombre: "Desconocido",
          }))
      );

      return Promise.all(comerciosPromises);
    }

    return [];
  },

  getById: async (id: number): Promise<Publicidad> => {
    const publicidad = await fetchWithErrorHandling(`${API_BASE_URL}/publicidades/buscarIdPublicidad/${id}`);

    try {
      const comercio = await comercioService.getById(publicidad.iD_Comercio);
      return {
        ...publicidad,
        comercioNombre: comercio.nombre,
      };
    } catch {
      return {
        ...publicidad,
        comercioNombre: "Desconocido",
      };
    }
  },

  getByComercio: async (comercio: string): Promise<Publicidad[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/buscarNombreComercio/${comercio}`);
  },

  create: async (
    publicidad: Omit<Publicidad, "iD_Publicidad" | "fechaCreacion">
  ): Promise<Publicidad> => {
    const publicidadToSend = {
      descripcion: publicidad.descripcion,
      visualizaciones: Number(publicidad.visualizaciones),
      tiempo: publicidad.tiempo,
      estado: Boolean(publicidad.estado),
      iD_Comercio: Number(publicidad.iD_Comercio),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/crear`, {
      method: "POST",
      body: JSON.stringify(publicidadToSend),
    });
  },

  update: async (id: number, publicidad: Partial<Publicidad>): Promise<Publicidad> => {
    const publicidadToSend = {
      ...publicidad,
      iD_Publicidad: id,
      visualizaciones: Number(publicidad.visualizaciones),
      iD_Comercio: Number(publicidad.iD_Comercio),
      estado: Boolean(publicidad.estado),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(publicidadToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/eliminar/${id}`, {
      method: "DELETE",
    });
  },
};
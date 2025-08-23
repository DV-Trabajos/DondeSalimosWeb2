import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import type { Comercio } from "./types";

export const comercioService = {
  getAll: async (): Promise<Comercio[]> => {
    const comercios = await fetchWithErrorHandling(`${API_BASE_URL}/comercios/listado`);

    if (Array.isArray(comercios)) {
      return comercios.map((comercio: Comercio) => ({
        ...comercio,
        tipoComercioNombre: comercio.iD_TipoComercio === 1 ? "Bar" : "Boliche",
      }));
    }
    return [];
  },

  getById: async (id: number): Promise<Comercio> => {
    const comercio = await fetchWithErrorHandling(`${API_BASE_URL}/comercios/buscarIdComercio/${id}`);
    return {
      ...comercio,
      tipoComercioNombre: comercio.iD_TipoComercio === 1 ? "Bar" : "Boliche",
    };
  },

  getByName: async (name: string): Promise<Comercio[]> => {
    const comercios = await fetchWithErrorHandling(`${API_BASE_URL}/comercios/buscarNombreComercio/${name}`);

    if (Array.isArray(comercios)) {
      return comercios.map((comercio: Comercio) => ({
        ...comercio,
        tipoComercioNombre: comercio.iD_TipoComercio === 1 ? "Bar" : "Boliche",
      }));
    }
    return [];
  },

  create: async (
    comercio: Omit<Comercio, "iD_Comercio" | "fechaCreacion">
  ): Promise<Comercio> => {
    console.log("Enviando datos a la API:", comercio);

    const comercioToSend = {
      nombre: comercio.nombre,
      capacidad: Number(comercio.capacidad),
      mesas: Number(comercio.mesas),
      generoMusical: comercio.generoMusical || "",
      tipoDocumento: comercio.tipoDocumento,
      nroDocumento: comercio.nroDocumento,
      direccion: comercio.direccion,
      correo: comercio.correo,
      telefono: comercio.telefono,
      estado: Boolean(comercio.estado),
      iD_TipoComercio: Number(comercio.iD_TipoComercio),
      iD_Usuario: Number(comercio.iD_Usuario),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/comercios/crear`, {
      method: "POST",
      body: JSON.stringify(comercioToSend),
    });
  },

  update: async (id: number, comercio: Partial<Comercio>): Promise<Comercio> => {
    const comercioToSend = {
      ...comercio,
      iD_Comercio: id,
      capacidad: Number(comercio.capacidad),
      mesas: Number(comercio.mesas),
      iD_TipoComercio: Number(comercio.iD_TipoComercio),
      iD_Usuario: Number(comercio.iD_Usuario),
      estado: Boolean(comercio.estado),
    };

    console.log(`Actualizando comercio ${id} con datos:`, comercioToSend);

    return fetchWithErrorHandling(`${API_BASE_URL}/comercios/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(comercioToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    console.log(`Eliminando comercio con ID: ${id}`);
    try {
      const response = await fetchWithErrorHandling(
        `${API_BASE_URL}/comercios/eliminar/${id}`,
        {
          method: "DELETE",
        }
      );
      console.log("Respuesta de eliminación:", response);
      return response;
    } catch (error) {
      console.error(`Error al eliminar comercio con ID ${id}:`, error);
      throw error;
    }
  },
};
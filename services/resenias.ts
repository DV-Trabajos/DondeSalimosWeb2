import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import { comercioService } from "./comercios";
import { usuarioService } from "./usuarios";
import type { Resenia } from "./types";

export const reseniaService = {
  getAll: async (): Promise<Resenia[]> => {
    const resenias = await fetchWithErrorHandling(`${API_BASE_URL}/resenias/listado`);

    if (Array.isArray(resenias)) {
      const reseniaPromises = resenias.map(async (resenia) => {
        try {
          const [comercio, usuario] = await Promise.all([
            comercioService.getById(resenia.iD_Comercio),
            usuarioService.getById(resenia.iD_Usuario),
          ]);

          return {
            ...resenia,
            comercioNombre: comercio.nombre,
            usuarioNombre: usuario.nombreUsuario,
          };
        } catch {
          return {
            ...resenia,
            comercioNombre: "Desconocido",
            usuarioNombre: "Desconocido",
          };
        }
      });

      return Promise.all(reseniaPromises);
    }

    return [];
  },

  getById: async (id: number): Promise<Resenia> => {
    const resenia = await fetchWithErrorHandling(`${API_BASE_URL}/resenias/buscarIdResenia/${id}`);

    try {
      const [comercio, usuario] = await Promise.all([
        comercioService.getById(resenia.iD_Comercio),
        usuarioService.getById(resenia.iD_Usuario),
      ]);

      return {
        ...resenia,
        comercioNombre: comercio.nombre,
        usuarioNombre: usuario.nombreUsuario,
      };
    } catch {
      return {
        ...resenia,
        comercioNombre: "Desconocido",
        usuarioNombre: "Desconocido",
      };
    }
  },

  getByComercio: async (comercio: string): Promise<Resenia[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/buscarNombreComercio/${comercio}`);
  },

  create: async (
    resenia: Omit<Resenia, "iD_Resenia" | "fechaCreacion">
  ): Promise<Resenia> => {
    const reseniaToSend = {
      iD_Usuario: Number(resenia.iD_Usuario),
      iD_Comercio: Number(resenia.iD_Comercio),
      comentario: resenia.comentario,
      estado: Boolean(resenia.estado),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/crear`, {
      method: "POST",
      body: JSON.stringify(reseniaToSend),
    });
  },

  update: async (id: number, resenia: Partial<Resenia>): Promise<Resenia> => {
    const reseniaToSend = {
      ...resenia,
      iD_Resenia: id,
      iD_Usuario: Number(resenia.iD_Usuario),
      iD_Comercio: Number(resenia.iD_Comercio),
      estado: Boolean(resenia.estado),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(reseniaToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/eliminar/${id}`, {
      method: "DELETE",
    });
  },
};
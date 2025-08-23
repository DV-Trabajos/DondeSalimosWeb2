import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import type { RolUsuario } from "./types";

export const rolUsuarioService = {
  getAll: async (): Promise<RolUsuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/listado`);
  },

  getById: async (id: number): Promise<RolUsuario> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/buscarIdRolUsuario/${id}`);
  },

  getByName: async (name: string): Promise<RolUsuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/buscarNombreRolUsuario/${name}`);
  },

  create: async (
    rol: Omit<RolUsuario, "iD_RolUsuario" | "fechaCreacion">
  ): Promise<RolUsuario> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/crear`, {
      method: "POST",
      body: JSON.stringify(rol),
    });
  },

  update: async (id: number, rol: Partial<RolUsuario>): Promise<RolUsuario> => {
    const rolToSend = {
      ...rol,
      iD_RolUsuario: id,
    };

    console.log(`Actualizando rol ${id} con datos:`, rolToSend);

    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(rolToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    console.log(`Eliminando rol con ID: ${id}`);
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/eliminar/${id}`, {
      method: "DELETE",
    });
  },
};
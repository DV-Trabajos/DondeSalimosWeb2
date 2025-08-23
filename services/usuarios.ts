import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import type { Usuario } from "./types";

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/listado`);
  },

  getById: async (id: number): Promise<Usuario> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/buscarIdUsuario/${id}`);
  },

  getByName: async (name: string): Promise<Usuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/buscarNombreUsuario/${name}`);
  },

  update: async (id: number, usuario: Partial<Usuario>): Promise<Usuario> => {
    const usuarioToSend = {
      ID_Usuario: id,
      NombreUsuario: usuario.nombreUsuario,
      Correo: usuario.correo,
      Telefono: usuario.telefono,
      ID_RolUsuario: usuario.iD_RolUsuario,
      Uid: usuario.uid,
      Estado: usuario.estado,
    };

    console.log(`Actualizando usuario ${id} con datos:`, usuarioToSend);

    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(usuarioToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    console.log(`Eliminando usuario con ID: ${id}`);
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/eliminar/${id}`, {
      method: "DELETE",
    });
  },
};
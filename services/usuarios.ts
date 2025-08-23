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

  exists: async (username: string): Promise<boolean> => {
    const users = await fetchWithErrorHandling(
      `${API_BASE_URL}/usuarios/buscarNombreUsuario/${username}`,
    );

    return Array.isArray(users)
      ? users.some((user: Usuario) => user.nombreUsuario.toLowerCase() === username.toLowerCase())
      : false;
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

    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(usuarioToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/eliminar/${id}`, {
      method: "DELETE",
    });
  },
};
import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import type { Comercio } from "./types";

// Función auxiliar para convertir hora HH:MM a formato TimeSpan HH:MM:SS
const formatearHoraTimeSpan = (hora: string): string => {
  // Si ya tiene formato TimeSpan (HH:MM:SS), devolverlo tal cual
  if (/^\d{2}:\d{2}:\d{2}$/.test(hora)) {
    return hora;
  }

  // Si tiene formato HH:MM, agregar :00 al final
  if (/^\d{2}:\d{2}$/.test(hora)) {
    return `${hora}:00`;
  }

  // Si no tiene formato válido, devolver hora por defecto
  console.warn(`Formato de hora inválido: ${hora}, usando valor por defecto`);
  return "00:00:00";
};

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

    const comercioToSend = {
      nombre: comercio.nombre,
      capacidad: Number(comercio.capacidad),
      mesas: Number(comercio.mesas),
      generoMusical: comercio.generoMusical || "",
      tipoDocumento: comercio.tipoDocumento,
      nroDocumento: comercio.nroDocumento,
      direccion: comercio.direccion,
      horaIngreso: formatearHoraTimeSpan(comercio.horaIngreso),
      horaCierre: formatearHoraTimeSpan(comercio.horaCierre),
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
      horaIngreso: comercio.horaIngreso ? formatearHoraTimeSpan(comercio.horaIngreso) : undefined,
      horaCierre: comercio.horaCierre ? formatearHoraTimeSpan(comercio.horaCierre) : undefined,
      capacidad: Number(comercio.capacidad),
      mesas: Number(comercio.mesas),
      iD_TipoComercio: Number(comercio.iD_TipoComercio),
      iD_Usuario: Number(comercio.iD_Usuario),
      estado: Boolean(comercio.estado),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/comercios/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(comercioToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetchWithErrorHandling(
        `${API_BASE_URL}/comercios/eliminar/${id}`,
        {
          method: "DELETE",
        }
      );
      return response;
    } catch (error) {
      console.error(`Error al eliminar comercio con ID ${id}:`, error);
      throw error;
    }
  },
};
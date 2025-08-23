import { API_BASE_URL, fetchWithErrorHandling } from "./api";
import { comercioService } from "./comercios";
import { usuarioService } from "./usuarios";
import type { Reserva } from "./types";

export const reservaService = {
  getAll: async (): Promise<Reserva[]> => {
    const reservas = await fetchWithErrorHandling(`${API_BASE_URL}/reservas/listado`);

    if (Array.isArray(reservas)) {
      const reservaPromises = reservas.map(async (reserva) => {
        try {
          const [comercio, usuario] = await Promise.all([
            comercioService.getById(reserva.iD_Comercio),
            usuarioService.getById(reserva.iD_Usuario),
          ]);

          return {
            ...reserva,
            comercioNombre: comercio.nombre,
            usuarioNombre: usuario.nombreUsuario,
          };
        } catch {
          return {
            ...reserva,
            comercioNombre: "Desconocido",
            usuarioNombre: "Desconocido",
          };
        }
      });

      return Promise.all(reservaPromises);
    }

    return [];
  },

  getById: async (id: number): Promise<Reserva> => {
    const reserva = await fetchWithErrorHandling(`${API_BASE_URL}/reservas/buscarIdReserva/${id}`);

    try {
      const [comercio, usuario] = await Promise.all([
        comercioService.getById(reserva.iD_Comercio),
        usuarioService.getById(reserva.iD_Usuario),
      ]);

      return {
        ...reserva,
        comercioNombre: comercio.nombre,
        usuarioNombre: usuario.nombreUsuario,
      };
    } catch {
      return {
        ...reserva,
        comercioNombre: "Desconocido",
        usuarioNombre: "Desconocido",
      };
    }
  },

  getByComercio: async (comercio: string): Promise<Reserva[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/buscarNombreComercio/${comercio}`);
  },

  create: async (
    reserva: Omit<Reserva, "iD_Reserva" | "fechaCreacion">
  ): Promise<Reserva> => {
    let tiempoTolerancia = reserva.tiempoTolerancia;

    if (!/^\d{2}:\d{2}:\d{2}$/.test(tiempoTolerancia)) {
      const numeros = tiempoTolerancia.match(/\d+/);
      if (numeros && numeros.length > 0) {
        const minutos = Number.parseInt(numeros[0], 10);
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        tiempoTolerancia = `${horas.toString().padStart(2, "0")}:${minutosRestantes
          .toString()
          .padStart(2, "0")}:00`;
      } else {
        tiempoTolerancia = "00:15:00";
      }
    }

    const reservaToSend = {
      iD_Usuario: Number(reserva.iD_Usuario),
      iD_Comercio: Number(reserva.iD_Comercio),
      fechaReserva: reserva.fechaReserva,
      tiempoTolerancia: reserva.tiempoTolerancia,
      comenzales: Number(reserva.comenzales),
      estado: Boolean(reserva.estado),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/crear`, {
      method: "POST",
      body: JSON.stringify(reservaToSend),
    });
  },

  update: async (id: number, reserva: Partial<Reserva>): Promise<Reserva> => {
    let tiempoTolerancia = reserva.tiempoTolerancia;

    if (tiempoTolerancia && !/^\d{2}:\d{2}:\d{2}$/.test(tiempoTolerancia)) {
      const numeros = tiempoTolerancia.match(/\d+/);
      if (numeros && numeros.length > 0) {
        const minutos = Number.parseInt(numeros[0], 10);
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        tiempoTolerancia = `${horas.toString().padStart(2, "0")}:${minutosRestantes
          .toString()
          .padStart(2, "0")}:00`;
      } else {
        tiempoTolerancia = "00:15:00";
      }
    }

    const reservaToSend = {
      ...reserva,
      iD_Reserva: id,
      iD_Usuario: Number(reserva.iD_Usuario),
      iD_Comercio: Number(reserva.iD_Comercio),
      tiempoTolerancia: tiempoTolerancia || reserva.tiempoTolerancia,
      comenzales: Number(reserva.comenzales),
      estado: Boolean(reserva.estado),
    };

    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(reservaToSend),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/eliminar/${id}`, {
      method: "DELETE",
    });
  },
};
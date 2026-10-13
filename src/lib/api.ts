import { projectId, publicAnonKey } from "../../utils/supabase/info";

const apiBase = `https://${projectId}.supabase.co/rest/v1`;

// The public REST API is available as soon as the schema and read policies exist.
export const remoteDatabaseEnabled = true;

const headers = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
  "Content-Type": "application/json",
};

export type MuseumObject = {
  id: string;
  nombre: string;
  descripcion: string;
  historia: string;
  categoria: string;
  periodo: string;
  procedencia: string;
  estado_conservacion: string;
  modelo_3d_url: string;
  imagen_portada_url: string;
  fotografias: string[];
  creditos: string;
  publicado: boolean;
};

export type PortalContent = {
  eventos: Array<Record<string, unknown>>;
  actividades: Array<Record<string, unknown>>;
  objetos_museo: MuseumObject[];
  exposiciones: Array<Record<string, unknown>>;
  evidencias: Array<Record<string, unknown>>;
  aliados: Array<Record<string, unknown>>;
  reconocimientos: Array<Record<string, unknown>>;
};

async function getTable<T>(table: string): Promise<T[]> {
  const response = await fetch(`${apiBase}/${table}?select=*`, { headers });
  if (!response.ok) throw new Error(`No fue posible consultar ${table}.`);
  return response.json();
}

export async function getPortalContent(): Promise<PortalContent> {
  const [eventos, actividades, objetos_museo, exposiciones, evidencias, aliados, reconocimientos] =
    await Promise.all([
      getTable<Record<string, unknown>>("eventos"),
      getTable<Record<string, unknown>>("actividades"),
      getTable<MuseumObject>("objetos_museo"),
      getTable<Record<string, unknown>>("exposiciones"),
      getTable<Record<string, unknown>>("evidencias"),
      getTable<Record<string, unknown>>("aliados"),
      getTable<Record<string, unknown>>("reconocimientos"),
    ]);

  return { eventos, actividades, objetos_museo, exposiciones, evidencias, aliados, reconocimientos };
}

export async function registerAnonymousVisit() {
  // Visitor writes stay disabled until an authenticated server route is deployed.
  // Public clients only receive read access to institutional content.
  return Promise.resolve();
}

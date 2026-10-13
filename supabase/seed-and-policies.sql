-- Ejecutar una vez después de supabase/schema.sql.
-- Añade lectura pública segura y registros iniciales para comprobar el portal.

drop policy if exists "lectura_publica_eventos" on eventos;
create policy "lectura_publica_eventos"
on eventos for select
to anon
using (publicado = true);

drop policy if exists "lectura_publica_objetos" on objetos_museo;
create policy "lectura_publica_objetos"
on objetos_museo for select
to anon
using (publicado = true);

drop policy if exists "lectura_publica_exposiciones" on exposiciones;
create policy "lectura_publica_exposiciones"
on exposiciones for select
to anon
using (publicada = true);

drop policy if exists "lectura_publica_aliados" on aliados;
create policy "lectura_publica_aliados"
on aliados for select
to anon
using (publicado = true);

drop policy if exists "lectura_publica_reconocimientos" on reconocimientos;
create policy "lectura_publica_reconocimientos"
on reconocimientos for select
to anon
using (publicado = true);

drop policy if exists "lectura_publica_actividades" on actividades;
create policy "lectura_publica_actividades"
on actividades for select
to anon
using (
  evento_id is null
  or exists (
    select 1 from eventos
    where eventos.id = actividades.evento_id
      and eventos.publicado = true
  )
);

drop policy if exists "lectura_publica_evidencias" on evidencias;
create policy "lectura_publica_evidencias"
on evidencias for select
to anon
using (
  evento_id is null
  or exists (
    select 1 from eventos
    where eventos.id = evidencias.evento_id
      and eventos.publicado = true
  )
);

insert into eventos (id, titulo, descripcion, lugar, tipo, publicado)
values
  ('00000000-0000-4000-8000-000000000101', '[Visita de institución educativa]', '[Descripción breve del encuentro y sus participantes.]', 'Colegio Tom Adams IED', 'visita_escolar', true),
  ('00000000-0000-4000-8000-000000000102', '[Evento de memoria escolar]', '[Descripción breve de la actividad realizada.]', '[Lugar]', 'evento', true)
on conflict (id) do nothing;

insert into actividades (id, evento_id, titulo, descripcion, curso, responsable, tipo)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', '[Recorrido guiado]', '[Actividad desarrollada con el grupo visitante.]', '[Curso]', 'Equipo RECO', 'recorrido'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', '[Taller de memoria]', '[Descripción del taller.]', '[Curso]', 'Equipo RECO', 'taller')
on conflict (id) do nothing;

insert into objetos_museo (
  id, nombre, descripcion, historia, categoria, periodo, procedencia,
  estado_conservacion, modelo_3d_url, fotografias, creditos, publicado
)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '[Nombre del objeto digital 1]',
    '[Descripción del objeto, su origen, quién lo utilizó y qué memoria conserva.]',
    '[Historia ampliada del objeto.]',
    '[Categoría]',
    '[Periodo]',
    '[Procedencia]',
    '[Estado]',
    '/models/objeto-01.glb',
    '["", "", ""]'::jsonb,
    '[Estudiantes responsables] · Luma AI · [Fecha]',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '[Nombre del objeto digital 2]',
    '[Descripción del objeto, su procedencia y su importancia para la comunidad.]',
    '[Historia ampliada del objeto.]',
    '[Categoría]',
    '[Periodo]',
    '[Procedencia]',
    '[Estado]',
    '/models/objeto-02.glb',
    '["", "", ""]'::jsonb,
    '[Estudiantes responsables] · Fotogrametría · [Fecha]',
    true
  )
on conflict (id) do nothing;

insert into exposiciones (
  id, titulo, descripcion, tema, recorrido_url, objetos_ids, publicada
)
values (
  '00000000-0000-4000-8000-000000000401',
  'Museo Escolar de la Memoria',
  '[Descripción curatorial de la exposición.]',
  'Memoria escolar',
  'https://edu.delightex.com/SRH-SUX',
  '["00000000-0000-4000-8000-000000000301", "00000000-0000-4000-8000-000000000302"]'::jsonb,
  true
)
on conflict (id) do nothing;

insert into evidencias (
  id, actividad_id, evento_id, tipo_archivo, archivo_url, descripcion, autor, creditos
)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'imagen', '', '[Registro fotográfico de la visita.]', '[Autor]', '[Créditos]'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 'imagen', '', '[Registro fotográfico del evento.]', '[Autor]', '[Créditos]')
on conflict (id) do nothing;

insert into aliados (id, nombre, descripcion, tipo_apoyo, publicado)
values
  ('00000000-0000-4000-8000-000000000601', '[Aliado institucional 1]', '[Tipo de apoyo al proyecto.]', '[Apoyo]', true),
  ('00000000-0000-4000-8000-000000000602', '[Aliado institucional 2]', '[Tipo de apoyo al proyecto.]', '[Apoyo]', true)
on conflict (id) do nothing;

insert into reconocimientos (id, nombre, entidad, descripcion, publicado)
values
  ('00000000-0000-4000-8000-000000000701', '[Nombre del reconocimiento]', '[Entidad que lo otorga]', '[Descripción del logro.]', true),
  ('00000000-0000-4000-8000-000000000702', '[Mención o participación destacada]', '[Entidad que lo otorga]', '[Descripción del logro.]', true)
on conflict (id) do nothing;

## LicitIA — Plan del MVP

Plataforma SaaS para monitorear ARCE (compras estatales de Uruguay), clasificar licitaciones con IA y avisar por WhatsApp.

### Stack
- **Frontend**: TanStack Start + React + Tailwind (estética B2B navy, sidebar, mobile-friendly, español).
- **Backend / DB / Auth**: Lovable Cloud (Supabase por debajo).
- **IA**: Lovable AI Gateway con `openai/gpt-4o` para clasificar y resumir.
- **WhatsApp**: Twilio (vía connector de Lovable).
- **Scraping ARCE + cron**: Supabase Edge Function programada con `pg_cron` cada 3 horas.

### Base de datos
- `profiles` — datos del usuario (nombre, empresa, teléfono WhatsApp, plan).
- `plans` enum: `free`, `pro`.
- `tenders` — licitaciones scrapeadas (organismo, título, descripción, monto estimado, fecha límite, URL ARCE, categoría IA, etiquetas, resumen IA, estado, fecha publicación).
- `user_preferences` — categorías de interés y palabras clave (arrays).
- `alerts_sent` — historial (user_id, tender_id, canal, fecha) — sirve para limitar 3/mes en plan free.
- RLS estricto en todas; `tenders` legibles por `authenticated`; resto por dueño.

### Edge Functions / endpoints
- `supabase/functions/scrape-arce` — fetch al portal ARCE, parseo, upsert en `tenders`. Lanza clasificación para cada nueva.
- `supabase/functions/classify-tender` — llama Lovable AI (`openai/gpt-4o`) para categoría + tags + resumen, guarda en la fila.
- `supabase/functions/match-and-alert` — al insertar tender, cruza con `user_preferences`, respeta cuota del plan, llama Twilio WhatsApp.
- `pg_cron` cada 3h dispara `scrape-arce` vía HTTP.

### Frontend (rutas)
- `/` — landing pública con propuesta de valor, cómo funciona, pricing, CTA registrarse.
- `/auth` — login/registro (email + password).
- `/_authenticated/dashboard` — listado de licitaciones con filtros (categoría, fecha, estado, monto), búsqueda.
- `/_authenticated/tenders/$id` — detalle con resumen IA y link a ARCE.
- `/_authenticated/preferencias` — categorías, palabras clave, número WhatsApp, plan actual.
- `/_authenticated/alertas` — historial de alertas enviadas.
- `/pricing` — Gratis (3 alertas/mes) y Pro (ilimitado + resúmenes completos).

### Diseño
- Navy oscuro como primario (`oklch` token), grises neutros, acentos en celeste.
- Sidebar fijo desktop, drawer mobile.
- Tipografía sans moderna (Inter + display sutil).
- Todo el copy en español rioplatense.

### Lo que necesito de vos (después de aprobar el plan)
1. **Conectar Twilio** (connector de Lovable) para enviar WhatsApp reales.
2. Confirmar que use **Lovable AI Gateway con `openai/gpt-4o`** en vez de pedirte tu propia API key de OpenAI (la usás sin configurar nada y se factura por uso desde Lovable).
3. Para el **scraping de ARCE**, voy a implementar parseo del listado público; si ARCE bloquea o cambia el HTML, el cron va a fallar silenciosamente — vas a poder ver errores en los logs. Si tenés acceso a una API oficial de ARCE, decime.

### Alcance fuera de MVP
- Pagos reales de Pro (lo dejo como UI + flag en DB; integramos Stripe/Paddle en una segunda iteración si querés).
- Multi-idioma, multi-país.
- Roles avanzados / equipos.

¿Lo aprobás así o ajustamos algo (ej. proveedor de IA, alcance, diseño)?

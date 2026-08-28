/* ============================================================
   DEMO · configuración.

   La URL apunta a un dominio que NO EXISTE (.invalid está reservado
   justamente para esto por el RFC 2606). Es a propósito: js/demo-api.js
   intercepta estas llamadas y las responde desde el navegador, pero si esa
   intercepción fallara, la petición no llegaría a ningún servidor de la empresa.
   No hay forma de que este demo toque los datos de producción.

   La clave tampoco es real.
   ============================================================ */
window.CURIFOR_AGENDA = {
  url: "https://demo.postventa.invalid",
  anonKey: "demo-anon-key-sin-valor",
  tabla: "reservas_web",
};

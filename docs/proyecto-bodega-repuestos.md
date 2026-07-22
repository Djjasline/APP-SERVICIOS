# Proyecto Documental: Control de Bodega y Despacho de Repuestos

## Objetivo

Diseñar la propuesta de un modulo digital integrado a APP SERVICIOS ASTAP para controlar la bodega de repuestos, registrar ingresos y salidas, gestionar solicitudes de despacho y mejorar la trazabilidad de materiales utilizados en servicios tecnicos, mantenimientos y operaciones.

## Contexto

Este documento conserva la idea base para una futura construccion del modulo dentro del aplicativo. La propuesta nace como proyecto individual academico y de evaluacion, orientado a generar un beneficio realista para la empresa, aunque su elaboracion inicial sea documental y no implique ejecucion obligatoria.

## Justificacion

El control de repuestos puede depender de registros manuales, comunicacion informal o validaciones posteriores. Esto puede generar perdida de trazabilidad, diferencias de inventario, demoras en despachos y dificultad para conocer el consumo real por tecnico, equipo, servicio o cliente.

Integrar un modulo de bodega en APP SERVICIOS permitiria centralizar la informacion, reducir errores administrativos y mejorar el control operativo de los repuestos usados por la empresa.

## Beneficios Esperados

- Mejor control del inventario disponible en bodega.
- Registro claro de entradas, salidas, devoluciones y ajustes.
- Trazabilidad de repuestos por tecnico, equipo, orden de trabajo o servicio.
- Reduccion de perdidas, duplicidad de solicitudes o despachos no registrados.
- Mejor planificacion de compras mediante alertas de stock minimo.
- Reportes de consumo por area, vehiculo, maquina, tecnico o cliente.
- Disminucion del tiempo de busqueda y validacion de repuestos.
- Mayor transparencia entre bodega, tecnicos y administracion.

## Alcance Propuesto

El modulo podria incluir:

- Catalogo de repuestos con codigo, nombre, descripcion, marca, ubicacion, stock actual y stock minimo.
- Registro de ingresos por compra, devolucion o ajuste positivo.
- Solicitudes de repuestos realizadas por tecnicos.
- Aprobacion, rechazo o despacho desde bodega.
- Asociacion del despacho a tecnico, equipo, vehiculo, informe, mantenimiento u orden.
- Historial de movimientos por repuesto.
- Alertas de bajo stock.
- Reportes de consumo y disponibilidad.

Fuera del alcance inicial:

- Integracion contable o facturacion.
- Compra automatica a proveedores.
- Lectores obligatorios de codigo de barras o QR.
- Integracion directa con ERP externo.

## Version Inicial Recomendada

Para una primera version funcional dentro del aplicativo se recomienda construir:

- Pagina principal `Bodega`.
- Seccion `Inventario`.
- Seccion `Solicitar repuesto`.
- Seccion `Despachos`.
- Tabla de movimientos.
- Alerta visual de stock bajo.

Esta version entregaria valor operativo sin volver el proyecto demasiado pesado.

## Datos Necesarios Para Construccion

La base de datos de repuestos deberia venir idealmente con estas columnas:

| Campo | Ejemplo |
| --- | --- |
| codigo | REP-001 |
| descripcion | Filtro de aceite |
| marca | Donaldson |
| equipo compatible | Vactor / Elgin / Piquersa |
| categoria | Filtros |
| unidad | unidad / galon / metro |
| stock actual | 12 |
| stock minimo | 3 |
| ubicacion | Estante A-2 |
| proveedor | Opcional |
| costo | Opcional |

## Secciones Funcionales

| Seccion | Funcion |
| --- | --- |
| Inventario | Lista general de repuestos disponibles |
| Ingreso de repuestos | Registro de compras, devoluciones o ajustes positivos |
| Solicitud de repuestos | Formulario para tecnicos |
| Aprobacion de despacho | Validacion por bodega o responsable |
| Despacho | Registro de salida fisica del repuesto |
| Devoluciones | Reingreso de repuestos no utilizados |
| Historial | Trazabilidad de movimientos |
| Reportes | Consumo, stock bajo y movimientos por tecnico o equipo |

## Plan de Ejecucion

| Fase | Actividad | Resultado esperado |
| --- | --- | --- |
| Fase 1 | Levantamiento de necesidades | Identificar flujo actual de bodega y despacho |
| Fase 2 | Diseno del proceso | Definir como debe funcionar el modulo |
| Fase 3 | Diseno de formularios | Crear estructura de pantallas y campos |
| Fase 4 | Diseno de base de datos | Definir tablas de repuestos, movimientos y solicitudes |
| Fase 5 | Prototipo documental | Presentar vistas simuladas del modulo |
| Fase 6 | Evaluacion | Analizar beneficios, riesgos y viabilidad |

## Cronograma Academico Propuesto

| Semana | Actividad |
| --- | --- |
| Semana 1 | Levantamiento de informacion y analisis del proceso actual |
| Semana 2 | Definicion de alcance, usuarios y flujo operativo |
| Semana 3 | Diseno de formularios y estructura del modulo |
| Semana 4 | Diseno de reportes, alertas e indicadores |
| Semana 5 | Elaboracion del documento final y presentacion |
| Semana 6 | Revision, ajustes y entrega academica |

## Tiempo Estimado Si Se Construye En La App

| Actividad | Tiempo estimado |
| --- | --- |
| Diseno tecnico y base de datos | 1 semana |
| Desarrollo de inventario | 1 a 2 semanas |
| Desarrollo de solicitudes y despachos | 2 semanas |
| Reportes y alertas | 1 semana |
| Pruebas y ajustes | 1 semana |
| Total estimado | 6 a 8 semanas |

## Recursos Necesarios

- Base de repuestos en Excel, CSV o tabla existente.
- Responsable de bodega para validar el flujo real.
- Personal tecnico para definir necesidades de solicitud y despacho.
- Definicion de roles: tecnico, bodega, supervisor y administrador.
- Acceso referencial a formatos actuales de inventario o despacho.
- Equipo de desarrollo si se decide implementar.

## Riesgos y Consideraciones

- Inventario inicial incompleto o desactualizado.
- Resistencia al cambio por procesos manuales existentes.
- Necesidad de responsables claros para aprobar y despachar.
- Posibles errores si no se capacita al personal.
- Dependencia de conexion a internet para uso en tiempo real.
- Necesidad de permisos por rol para proteger movimientos de inventario.

## Indicadores de Exito

- Reduccion de diferencias entre inventario fisico y digital.
- Disminucion de tiempos de despacho.
- Mayor trazabilidad de repuestos usados por servicio.
- Reduccion de solicitudes duplicadas.
- Reportes claros de consumo mensual.
- Identificacion temprana de repuestos criticos con bajo stock.

## Preguntas Pendientes Para Construccion

- Quien puede despachar: bodega, supervisor o administrador.
- Si el tecnico solo solicita o tambien puede retirar directamente.
- Si cada repuesto debe asociarse obligatoriamente a equipo, vehiculo, informe o mantenimiento.
- Si el stock actual de la base entregada ya es confiable.
- Si se requiere controlar costos desde la primera version.
- Si se necesita lectura de codigos QR o barras en una fase posterior.

## Nota

Cuando se reciba la base de datos de repuestos, este documento debe actualizarse con la estructura real de columnas y convertirse en plan tecnico de implementacion.

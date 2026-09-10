# Diario de desarrollo

Por qué este proyecto está construido como está. Cada entrada recoge una
decisión, la alternativa a la que ganó y lo que costó. Ordenado de más antiguo
a más reciente.

> Versión en inglés: [DEVELOPMENT_DIARY_EN.md](./DEVELOPMENT_DIARY_EN.md)

---

## Aplicar la política de código en el linter en lugar de en revisión
`2026-09-06` · `eslint.config.js`

> Una convención que nadie ejecuta se erosiona una excepción a la vez.

- Las reglas que importan aquí —sin punto y coma, toda función como `const` con
  arrow function, techo duro de dos parámetros— son justo las que decaen en
  silencio en revisión.
- Todas son reglas de ESLint, así que `yarn lint` *es* la guía de estilo y la
  deriva no puede acumularse.
- **Descartado** — añadir Prettier: la mitad de lo que hay que vigilar es
  arquitectónico (`max-params`, `func-style`, imports restringidos) y Prettier
  solo formatea, así que serían dos herramientas opinando sobre la misma línea.
- **Coste** — `eslint --fix` carga con un formateo que un formateador dedicado
  haría más rápido, y algún código legítimo necesita un override explícito.

---

## Mantener ESLint en la v9 mientras la config de Expo se pone al día
`2026-09-06` · `package.json`

> Quedarse una major por detrás sale más barato que forkear reglas que el
> framework ya cura.

- `eslint-config-expo@57` no carga bajo ESLint 10.
- Subir a la nueva major habría implicado renunciar al conjunto de reglas de
  React Native de Expo —la parte que entiende Metro, JSX y los globals de RN— y
  reconstruirlo.
- **Descartado** — escribir una config sustituta a mano: es mantenimiento que el
  framework ya hace, y divergiría de upstream de inmediato.
- **Coste** — fijado a sabiendas a `^9` en una herramienta central hasta que
  Expo soporte la 10.

---

## Resolver la configuración de entorno en build y revalidarla en arranque
`2026-09-06` · `app.config.ts` · `src/config/`

> `process.env` no sobrevive dentro de un bundle de React Native, así que la
> config hay que congelarla en el manifest.

- Cuatro entornos (`local`, `test`, `staging`, `prod`) difieren en URL de API,
  timeout y herramientas de desarrollo.
- `app.config.ts` lee `env/<APP_ENV>.env` mientras Expo construye el manifest y
  congela el resultado en `extra.appConfig`.
- `src/config` lo recupera vía `expo-constants`, lo revalida y exporta un único
  `appConfig` tipado como punto de entrada.
- **Descartado** — referencias sueltas a `process.env`: reparten el conocimiento
  del entorno por cada fichero que necesita un valor.
- **Coste** — una unión `AppEnv` duplicada; `app.config.ts` corre en Node antes
  de que exista el resolutor de alias, así que no puede importar de `src/`.

---

## Fallar ante configuración ausente en lugar de recurrir a un valor por defecto
`2026-09-06` · `app.config.ts` · `src/config/env.ts`

> Un defecto silencioso convierte el caso más peligroso en el invisible.

- Un `API_URL` ausente que pasa a cadena vacía reaparece luego como un error de
  red confuso, a capas de distancia del fichero de entorno que lo causó.
- El build lanza nombrando la clave y el fichero exactos; el lector en runtime
  rechaza un `extra.appConfig` ausente o malformado con un mensaje accionable.
- Los valores con un defecto realmente seguro (`API_TIMEOUT_MS`, `SENTRY_DSN`)
  lo conservan: solo son fatales los que no admiten una suposición razonable.
- **Descartado** — caer a un valor de desarrollo: una build de producción
  apuntando a una API local sería entonces idéntica a una correcta.
- **Coste** — un fichero de entorno incompleto detiene el build en seco.

---

## Dar a cada entorno no productivo su propio bundle identifier y scheme
`2026-09-06` · `app.config.ts`

> Cuatro builds que conviven en un dispositivo, cada una diciendo cuál es.

- Probar staging obliga normalmente a desinstalar producción, lo que destruye su
  estado local e impide comparar los dos comportamientos.
- Cada entorno no productivo recibe bundle id, scheme de deep link y nombre
  visible con sufijo.
- **Descartado** — un único identificador cambiando solo la URL de la API:
  oculta el error que interesa detectar, porque una build en el backend
  equivocado es idéntica a una correcta.
- **Coste** — cuatro juegos de credenciales nativas que gestionar cuando esto
  llegue a builds de store.

---

## Escribir la política de código como skills de agente, no como guía de contribución
`2026-09-07` · `.claude/skills/`

> La política va en la herramienta que escribe el código, no en un fichero que
> alguien debe acordarse de abrir.

- Casi todo el código se escribe con un agente de IA, y un `CONTRIBUTING.md`
  solo ayuda en un momento que nunca coincide con el de teclear.
- Once skills llevan las convenciones —naming, estructura de carpetas por capa,
  arrow functions, condicionales planos, sin comentarios, inversión de
  dependencias—, cada una con la regla, el razonamiento y ejemplos ❌/✅.
- **Descartado** — dejar las reglas solo en el linter: un linter rechaza una
  violación, pero no puede expresar *qué hacer en su lugar*, que es la parte que
  da forma a un diseño.
- **Coste** — un segundo sitio donde vive la política, que revisar cada vez que
  cambia una convención.

---

## Sustituir los enums de TypeScript por objetos `as const`
`2026-09-07` · todo el proyecto

> `enum` es de las pocas construcciones de TS que no es sintaxis de tipos
> borrable.

- Compila a un objeto en runtime que el bundler no puede tree-shakear, y produce
  un tipo nominal que rechaza un string literal idéntico.
- Las enumeraciones son un objeto congelado más un tipo derivado que comparte
  nombre con sufijo `Types`: JavaScript corriente en runtime, unión normal en
  compilación.
- **Descartado** — conservar `enum` por comodidad: el coste de bundle y la
  fricción del tipado nominal se pagan en cada uso, la comodidad solo al
  escribir.
- **Coste** — el par objeto-tipo se lee como redeclaración, así que
  `@typescript-eslint/no-redeclare` está desactivado en todo el proyecto y se
  pierde su protección frente a las accidentales de verdad.

---

## Fijar la separación entre view y screen antes de escribir ninguna de las dos
`2026-09-07` · `.claude/skills/view-structure` · `.claude/skills/screen-structure`

> Decidir dónde termina la carga de datos es barato ahora y caro tras una docena
> de screens.

- Por defecto una screen hace fetch, captura, mapea y pinta, y para cuando eso
  incomoda ya está repartido en muchos ficheros.
- Una view en `.ts` llama a los repositories del dominio y entrega a la screen un
  view model terminado donde cada sección es datos o un mensaje de error
  controlado.
- `Promise.allSettled` frente a `Promise.all` es la pieza que sostiene el
  diseño: una llamada fallida degrada una sección en vez de vaciar la pantalla.
- **Descartado** — dejar que la primera screen establezca el patrón: lo que ella
  necesitara se habría convertido en convención por accidente.
- **Coste** — diseñar antes de construir arriesga resolver problemas que no
  llegarán.
- **Abierto** — ninguna de las dos capas está implementada aún, así que la forma
  está razonada pero no probada.

---

## Envolver toda librería de terceros tras un puerto propio
`2026-09-08` · `src/services/`

> Nada por encima de una librería debería necesitarla presente para poder
> testearse.

- Las librerías usadas directamente desde screens y dominios filtran sus tipos a
  los nuestros y arrastran un módulo nativo a cada test por encima de ellas.
- Cada capacidad —http, traducción, detección de idioma, selección de
  documentos— es una carpeta bajo `src/services/` donde un único adapter importa
  la librería.
- Todo lo demás depende de nuestros modelos, así que un test mockea un módulo
  nuestro en vez del SDK.
- **Descartado** — recibir la dependencia como parámetro: los parámetros se
  reservan para entradas dinámicas, y enhebrar una dependencia fija por cada
  punto de llamada sube el acoplamiento un nivel en vez de eliminarlo.
- **Coste** — un puerto y un juego de modelos por librería, y por eso solo
  existen los cuatro que la app necesita de verdad.

---

## Convertir la frontera del puerto en un error de lint, no en una convención
`2026-09-08` · `eslint.config.js`

> Un puerto que nadie vigila se desmorona en el primer import directo.

- Ese import es invisible en revisión porque tiene el mismo aspecto que
  cualquier otro import del fichero.
- `no-restricted-imports` nombra cada librería envuelta y el puerto que hay que
  usar; `no-restricted-globals` bloquea el `fetch` global.
- Cada carpeta de adapter vuelve a abrir solo la librería que le pertenece, de
  modo que la arquitectura rompe el build en vez de degradarse en silencio.
- **Descartado** — confiar solo en las skills: guían al agente que escribe
  código nuevo, pero no hacen nada con el código pegado desde fuera.
- **Coste** — el flat config de ESLint fusiona reglas por nombre, así que cada
  bloque de adapter repite la lista completa menos su propia librería; una
  quinta librería envuelta obliga a tocar cinco sitios.

---

## Traducir los payloads de la API a modelos de dominio en el borde
`2026-09-08` · `src/core/domains/document/`

> El naming de campos del backend debe detenerse en el borde del dominio, no
> llegar a la UI.

- La API de documentos responde con la forma del backend: su naming y sus fechas
  nullables viajarían a cada componente que tocase un documento.
- Un mapper `<entity>PayloadToModel` es el único sitio donde se entiende el
  payload, así que un renombrado aguas arriba es un cambio de un fichero.
- **Descartado** — mapear al vuelo en cada punto de llamada: la misma traducción
  se reescribe allí donde haga falta, y cada copia es libre de discrepar.
- **Coste** — un payload model, un modelo de dominio y un mapper por endpoint:
  tres ficheros para describir una respuesta.

---

## Dejar que los repositories lancen un error de dominio, no el del transporte
`2026-09-08` · `src/core/domains/document/repositories/`

> Quien llama a `getDocumentList` no debería tener que saber que la lista llega
> por HTTP.

- Si un `HttpError` escapa, cada `catch` por encima codifica el transporte, y
  pasar luego a una fuente cacheada o local los rompe todos.
- Los repositories capturan lo que lanzó el puerto y relanzan un `DocumentError`
  con el original como `cause`, así el motivo real sigue disponible para logs.
- **Descartado** — devolver un objeto resultado en vez de lanzar: obliga a todos
  los puntos de llamada a ramificar incluso donde el fallo es genuinamente
  excepcional.
- **Coste** — un try/catch envolviendo cada repository, y la disciplina de
  mantenerlo ahí.

---

## Separar la detección de idioma de la traducción en dos puertos
`2026-09-08` · `src/services/language/` · `src/services/translate/`

> En qué idioma está el dispositivo y cómo renderizar una clave en él son
> trabajos distintos que cambian a ritmos distintos.

- Están respaldados por librerías distintas (`expo-localization`, `i18n-js`).
- Servicios separados hacen que añadir un selector manual de idioma toque solo
  el puerto de idioma, y cambiar el motor de traducción solo el de traducción.
- **Descartado** — un único servicio `i18n`: haría que el locale del
  dispositivo, una preocupación de plataforma, fuese alcanzable a través de una
  API de traducción.
- **Coste** — dos puertos y un paso de cableado entre ambos que un servicio
  fusionado no habría necesitado.

---

## Derivar la lista de alias de imports desde `tsconfig.json`
`2026-09-08` · `scripts/import-aliases.js` · `eslint.config.js`

> `@core` es indistinguible de un paquete npm con scope solo por su forma.

- El ordenador de imports archivaba los alias del proyecto entre las
  dependencias de terceros, así que cada fichero abría con módulos locales
  disfrazados de dependencias.
- La config de ESLint construye sus patrones de alias leyendo el mapa `paths` de
  `tsconfig.json`, que sigue siendo el único sitio donde se declara un alias.
- **Descartado** — listar los alias otra vez en la config del linter: las dos
  listas serían iguales solo hasta el siguiente alias, y el fallo sería un
  import mal ordenado en silencio en lugar de un error.
- **Coste** — un acoplamiento en build entre la config del linter y
  `tsconfig.json`, y un script que debe quedar fuera del conjunto linteado.

---

## Construir la UI en Storybook antes de que existan las screens
`2026-09-09` · `.storybook/`

> Un componente sin banco de pruebas solo se ve en la primera screen que lo
> necesitó.

- El conjunto de componentes se construye por delante de sus screens, así que la
  alternativa es una screen desechable por componente o ninguna comprobación
  visual.
- Storybook muestra los estados de cada componente uno junto a otro, así que las
  variantes deshabilitada y pulsada de un botón se ejercitan el día que se
  escribe.
- **Descartado** — aplazar la UI hasta tener screens: colapsa el diseño del
  componente y la composición de pantalla en un paso, y el componente acaba con
  la forma que le dio su primer llamador.
- **Coste** — un segundo pipeline de build (Storybook sobre Vite, la app sobre
  Metro) y una story que mantener por componente.

---

## Organizar `src/ui` por atomic design
`2026-09-09` · `src/ui/`

> La ruta debería decir qué puede depender de qué.

- Una carpeta plana pone un botón y el layout completo de una tarjeta como
  iguales hasta que los imports se enredan.
- `atoms`, `molecules` y `organisms` hacen legible la dirección de las
  dependencias antes de abrir un fichero.
- **Descartado** — agrupar por feature en esta capa: `src/ui` guarda las piezas
  reutilizables, así que archivarlas por la primera feature que las necesitó las
  representaría falsamente como suyas.
- **Coste** — un juicio recurrente sobre a qué capa pertenece cada cosa;
  `InputDocument` como molecule y no como organism es exactamente eso.

---

## Dar a todo componente y screen la misma forma de carpeta
`2026-09-09` · `src/ui/`

> Encontrar los estilos de un componente no debería exigir abrirlo primero.

- Todo componente es una carpeta PascalCase: `index.tsx` para el componente,
  `styles.ts` para estilos, un `resources/` opcional con un hook
  `use<ComponentName>` y un `components/` opcional para los subcomponentes que
  no tienen sentido fuera de él.
- El anidamiento coincide con lo que se renderiza: `DropdownButton` contiene
  `DropdownMenu`, que contiene `DropdownMenuOption`.
- Las screens siguen la forma idéntica, así que moverse entre las dos capas no
  exige un mapa mental nuevo.
- **Descartado** — dejar que cada componente elija su disposición: el coste de
  encontrar las cosas se paga entonces en cada visita en lugar de una vez.
- **Coste** — ceremonia en los pequeños; un componente con dos líneas de estilos
  también se lleva su carpeta.

---

## Envolver `react-native-svg` tras componentes de icono
`2026-09-09` · `src/ui/atoms/icons/`

> La regla del puerto aplicada al render en lugar de a un servicio.

- Los iconos en línea significan datos de paths SVG pegados en código de
  feature, repegados en el siguiente uso y divergiendo en tamaño y color de la
  copia de al lado.
- Cada icono es un componente bajo `src/ui/atoms/icons/` con props nuestras, y
  la config del linter hace de esa carpeta el único sitio donde se puede
  importar `react-native-svg`.
- **Descartado** — una fuente de iconos: añade un asset que cargar y renuncia al
  control por icono del trazo y el color.
- **Coste** — un componente por icono, escrito a mano.

---

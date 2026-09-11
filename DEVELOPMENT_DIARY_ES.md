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

## Envolver AsyncStorage tras un port de storage propio
`2026-09-10` · `src/services/storage/`

> La persistencia es una implementación reemplazable, así que la app pide
> guardar un valor bajo una clave y nunca sabe quién le responde.

- Todavía nada en la app persistía nada, así que la primera llamada a storage
  era el momento de decidir si `@react-native-async-storage/async-storage` se
  importa una vez o en todas partes.
- `src/services/storage/` expone `getItem` / `setItem` / `removeItem` /
  `clear` sobre nuestro propio `StorageServiceModel`, y
  `asyncStorageAdapter.ts` es el único fichero que puede importar la librería:
  lo sostiene la misma lista `no-restricted-imports` que ya protege el picker,
  la localización, i18n y los SVG.
- El port habla de valores, no de strings: el adapter es el dueño del
  `JSON.stringify` / `JSON.parse`, así que un valor guardado ilegible llega
  como `StorageError` en la frontera en vez de como `SyntaxError` dentro de una
  screen.
- **Descartado** — un port que guarde strings y deje el parseo a quien lo
  llama: el mismo parseo y su `try`/`catch` se reescriben entonces en cada
  punto de llamada, cada uno libre de discrepar sobre qué significa un valor
  corrupto.
- **Coste** — `getItem<TValue>` castea lo que vuelva, así que un cambio de
  forma se detecta donde se usa el valor y no donde se lee.
- **Abierto** — se eligió async-storage sobre `expo-sqlite/kv-store` (el
  drop-in de Expo con la misma API más una lectura síncrona) porque es la
  librería que se pidió por su nombre; nunca se sopesó el intercambio entre
  ambas.

---

## Envolver `FlatList` tras un `List` que solo sabe cuántas columnas hay
`2026-09-10` · `src/ui/molecules/List/`

> Un listado y un grid son la misma colección vista dos veces, así que no
> deberían ser dos componentes.

- El listado de documentos se pinta o como filas `CardListItem` apiladas o como
  celdas `CardGridItem` en mosaico, y el usuario alterna entre ambas a voluntad.
- `List` recibe `items`, `renderItem`, `keyExtractor` y un único mando de
  layout: `columns`. Una columna es un listado, dos son un grid, y el cambio es
  un número en vez de un segundo componente o una bifurcación en quien llama.
- Es el único fichero de la app que importa `FlatList`, así que la
  virtualización viene activada por defecto en todas partes en lugar de ser algo
  que cada llamada recuerda, y la API de listas de React Native no llega nunca a
  un template ni a una screen.
- El `gap` se aplica igual entre filas y entre columnas, y `empty` se pinta en
  el espacio que habrían ocupado las filas: las dos cosas que si no iba a
  volver a deducir cada llamada.
- **Descartado** — un wrapper de `View` que mapee children con un gap: más
  simple de escribir, pero renderiza todos los documentos de golpe y traslada
  la cuenta de las dos columnas a `flexWrap` en cada punto de uso.
- **Descartado** — llamar a `FlatList` directamente desde el template: un
  fichero menos, pero `columnWrapperStyle`, `contentContainerStyle` y la regla
  de remontaje de `numColumns` se reescriben luego en quien pinte la siguiente
  colección.
- **Coste** — `columns` está tipado como número, así que `columns={7}` compila;
  el componente no acota nada y se fía de quien llama.

---

## Añadir los templates como quinta capa, y que sean dueños de sus textos
`2026-09-10` · `src/ui/templates/`

> Una screen debería decir qué página es, no cómo se monta esa página.

- `DocumentListScreen` estaba a punto de criar una cabecera, una toolbar, un
  cuerpo y un pie: layout que pertenece al sistema de diseño, no a la ruta.
- `src/ui/templates/` continúa la escalera de atomic design que la carpeta `ui`
  ya sube, y `DocumentListTemplate` es dueño de la página entera, safe area
  incluida. La screen se reduce a cableado: estado dentro, handlers fuera.
- Los átomos y las moléculas siguen recibiendo strings planos, que es lo que
  los hace reutilizables. El template se renderiza exactamente una vez, así que
  lee sus propios textos con `useTranslate` en lugar de obligar a la screen a
  hacer de correa de transmisión de nueve de ellos.
- El texto que no es de la página sigue llegando de fuera: el mensaje de error
  es una prop, porque quien cargó los documentos sabe qué ha fallado y el
  template no.
- **Descartado** — componer la página dentro de la screen: el layout queda
  entonces inalcanzable desde Storybook, y cada estado hay que producirlo desde
  la app para poder mirarlo.
- **Descartado** — un template que reciba cada texto como prop: mantiene la
  capa perfectamente pura, pero la screen se convierte en un relé de strings
  estáticos y los textos de una página acaban partidos entre dos capas.
- **Coste** — la capa `ui` depende ahora de `@hooks/useTranslate`, así que un
  template no se puede renderizar sin el catálogo de traducciones detrás.

---

## Un template con estado discriminado, no un template por estado
`2026-09-10` · `src/ui/templates/DocumentListTemplate/`

> Loading, error y contenido se diferencian en un bloque; los otros tres son
> idénticos en los tres casos.

- La página tiene tres estados, y la cabecera, la toolbar y el botón de añadir
  son los mismos en todos. Tres templates duplicarían ese cromo tres veces y
  cobrarían tres veces por un cambio de cabecera.
- Los estados llegan como un único `DocumentListStateModel` discriminado
  (`loading` | `error` | `content`), y `DocumentListBody` intercambia solo el
  bloque entre la toolbar y el pie, con una guard clause por estado y sin
  anidar.
- Una lista vacía es `content` sin documentos, no un cuarto estado: la propia
  lista pinta el mensaje de vacío, así que el template no tiene que preguntar
  nunca cuántos documentos hay.
- El orden y el layout son asimétricos a propósito. El orden reordena los
  documentos, que el template no posee, así que se controla desde fuera. El
  layout no cambia nada más allá de esta página, así que el template lo guarda
  en su propio hook e `initialLayout` solo dice por dónde empieza.
- **Descartado** — tres templates, uno por estado: cada uno se lee más plano
  por separado, pero la screen vuelve a decidir cuál monta y el cromo
  compartido necesita igualmente un cuarto componente.
- **Descartado** — un template con un slot `children`: flexibilidad máxima, y
  renuncia a la única garantía para la que sirve un template — que cada estado
  de esta página se vea como se diseñó.
- **Coste** — añadir un estado obliga a tocar la unión, el cuerpo y las
  stories a la vez; el compilador lo fuerza, pero son tres ficheros en lugar de
  uno.

> **Superseded** parcialmente el `2026-09-11` por [Sacar la elección de layout del template para poder recordarla](#sacar-la-elección-de-layout-del-template-para-poder-recordarla) — el layout también se controla desde fuera ahora, así que la asimetría descrita arriba ya no se sostiene.

---

## Nombrar las claves de traducción para que no se lean como un string suelto
`2026-09-10` · `src/translations/`

> En el punto de uso, `translate('documentListAdd')` y una etiqueta hardcodeada
> se parecen exactamente igual.

- El catálogo usaba claves en camelCase, que se leen como cualquier otro
  identificador: y lo único con lo que una clave no se puede confundir nunca es
  con el literal al que sustituye.
- Ahora las claves son `_SCREAMING_SNAKE` con guion bajo inicial, con el ámbito
  de quien es dueño del texto: `_DOCUMENT_LIST_TEMPLATE_TITLE`,
  `_DOCUMENT_LIST_TEMPLATE_ADD`. Los textos compartidos por toda la app se
  quedan sin ámbito — `_LOADING`, `_CANCEL`, `_RETRY`.
- El prefijo lleva implícita una reclamación de propiedad: borrar
  `DocumentListTemplate` señala qué claves se mueren con él, sin tener que
  buscar los textos uno a uno.
- **Descartado** — un mapa de constantes generado
  (`TranslationKeys.documentListAdd`): da autocompletado, pero
  `TranslationsModel = typeof en` ya tipa cada clave contra el catálogo inglés,
  así que sería un segundo fichero que mantener al día sin ganar seguridad.
- **Coste** — las claves son largas y los catálogos se leen con más ruido;
  renombrar un componente obliga a renombrar sus claves en tres ficheros a la
  vez.

---

## Todo color sale del theme, y cada superficie declara el suyo
`2026-09-10` · `src/constants/theme.ts` · `src/ui/`

> Un código hexadecimal dentro de un componente es un color que ningún otro
> componente puede encontrar.

- `Colors`, en `src/constants/theme.ts`, es la única fuente de color de la app.
  Ningún componente escribe `#FFFFFF`, `'white'` ni un `rgba()`: pide el rol
  que quiere decir — `background.default`, `text.light`, `border.dark`.
- El significado lo llevan los roles, así que repintar es una edición en un
  fichero en vez de una búsqueda de hexadecimales que se han ido separando
  entre sí en una docena de componentes.
- Las superficies se pintan explícitamente, no se heredan.
  `DocumentListTemplate` da un fondo propio a su cabecera, a su cuerpo y a su
  pie, incluso donde hoy dos coinciden, porque una página que depende del color
  de su padre se rompe en silencio en cuanto se monta en otro sitio — y en un
  template ese padre es la safe area, cuyos insets enseñarían si no el color
  equivocado por encima de la cabecera.
- **Descartado** — un hexadecimal en línea «solo por esta vez»: es exactamente
  así como se escriben la segunda y la tercera copia, y ninguna se mueve cuando
  se mueve la paleta.
- **Coste** — la paleta es un conjunto plano de roles con tres variantes cada
  uno, así que un color que no encaje en ningún rol existente tiene que
  ganarse uno nuevo en vez de escribirse donde hace falta.

---

## Colocar las views en `src/core/views/`, no junto a las screens
`2026-09-11` · `src/core/views/` · `.claude/skills/view-structure`

> Una view orquesta domains y no pinta nada, así que le toca estar donde están
> los domains.

- Una capa se coloca por lo que hace, no por quién la consume. Una view
  orquesta domains y no pinta nada, así que es trabajo de datos — y `src/views/`
  le daba una dirección de presentación, hermana de `src/screens/` y `src/ui/`,
  a una carpeta que tiene prohibido contener JSX.
- Las views viven ahora en `src/core/views/<Entity><Purpose>View/`, al lado de
  `src/core/domains/`, alcanzables por el alias `@core/*` que ya existe en
  `tsconfig.json`, Metro y Jest.
- Las cuatro skills que nombraban la ruta antigua se reescribieron en el mismo
  cambio, para que la política escrita y el árbol no puedan separarse.
- **Descartado** — mantener `src/views/` y registrar un alias `@views/*`
  nuevo: parte en dos mitades la capa de datos a lo ancho del árbol y añade un
  alias a tres configuraciones para decir menos de lo que ya dice `core`.
- **Coste** — `core` ya no se lee como «los domains»: ahora contiene dos tipos
  de cosa, y dónde cae la frontera hay que aprenderlo en vez de deducirlo.

---

## Propagar el abort signal desde la screen hasta el `fetch`
`2026-09-11` · `src/services/http/` · `src/core/` · `src/screens/DocumentListScreen/`

> Una cancelación que se queda en la view no cancela nada — solo el transporte
> puede abandonar una petición en vuelo.

- La screen es dueña del `AbortController` porque es dueña del tiempo de vida
  del montaje, pero el signal solo hace trabajo en el `fetch`, cuatro capas más
  abajo.
- `HttpServiceModel.get` ganó un argumento `options` que lleva el signal;
  `getDocumentList(signal)` y `loadDocumentListView(signal)` son conductos
  puros que lo reenvían y no lo usan para nada propio.
- El adapter conserva su controller para el timeout y engancha en él el signal
  de quien llama, de modo que aborta la petición el primero que dispare sin que
  ninguno de los dos mecanismos tenga que conocer al otro.
- **Descartado** — proteger el `setState` en la screen y dejar que la petición
  termine: calla el aviso mientras la conexión, el parseo y el mapeo siguen
  ocurriendo para una pantalla que ya no mira nadie.
- **Coste** — todo repositorio que quiera ser cancelable tiene que aceptar y
  reenviar un signal que él mismo nunca lee.

---

## Dar tipo de error propio al abort para que salir de una pantalla no sea un fallo
`2026-09-11` · `src/services/http/models/` · `src/core/views/DocumentListView/`

> Irse de una pantalla no es un error, y desde luego no hay que reportarlo como
> un timeout.

- El adapter mapeaba cualquier `AbortError` a `HttpErrorTypes.Timeout`, así que
  cerrar la lista registraba «Request to /documents timed out» — un diagnóstico
  sencillamente falso, y del tipo que manda a alguien a buscar un problema de
  red que no existe.
- `HttpErrorTypes.Aborted` separa la cancelación de quien llama del timeout
  propio del adapter; cuál de los dos disparó se decide preguntando si el
  signal de quien llama es el que está abortado.
- La view lo sube como un tercer estado de sección, `Aborted`, junto a `Ok` y
  `Error`, de forma que la screen sale antes en vez de loguear y pintar un
  error sobre una pantalla que se está yendo.
- **Descartado** — dejar que el abort caiga como un rechazo cualquiera: sale
  más barato, pero llena la consola de fallos durante la navegación normal, que
  es la manera de que los fallos de verdad dejen de leerse.
- **Coste** — una tercera rama en todo consumidor de una sección de view, sobre
  las dos que el patrón ya tenía.

---

## Dar el gesto de pull-to-refresh a `List` en lugar de a un wrapper
`2026-09-11` · `src/ui/molecules/list/`

> El gesto pertenece a lo que hace scroll, y en esta app solo hay un componente
> con permiso para hacer scroll.

- `List` es el único sitio que habla con `FlatList`, así que también es el único
  que puede entregar un `RefreshControl` a la prop `refreshControl` que el gesto
  necesita de verdad.
- Esa prop recibe un elemento, no un componente: en Android `ScrollView` lo
  clona y lo convierte en el padre del propio scroll view, así que tiene que ser
  el `RefreshControl` de verdad y no un wrapper nuestro.
- `onRefresh` es lo que enciende el gesto — sin él la prop se queda en
  `undefined`, de modo que una lista que nadie puede refrescar tampoco se gana
  el wrapper de swipe-refresh de Android.
- `isRefreshing` se queda en quien llama, porque solo quien llama sabe cuándo ha
  terminado su recarga — `List` nunca baja el spinner por su cuenta.
- **Descartado** — un `pullToRefreshBox` envolviendo la lista: un wrapper solo
  puede aportar su propio `ScrollView`, y meter una lista virtualizada dentro de
  uno cambia la virtualización por un gesto que `FlatList` ya expone.
- **Coste** — dos props más en una molecule que tenía cinco, y el gesto alcanza
  únicamente lo que pinta `List`: el estado de error es una `View` normal y no
  se puede estirar.

---

## Mantener el refresco al lado del estado de la lista y no dentro de él
`2026-09-11` · `src/screens/documentListScreen/` · `src/ui/templates/documentListTemplate/`

> Un refresco que pinta el estado de carga esconde justo las filas de las que el
> gesto está tirando.

- `DocumentListStateModel` ya tenía `Loading`, y reutilizarlo para un refresco
  cambiaría el cuerpo por un spinner — los documentos desaparecen en el momento
  en que tiras de ellos.
- `isRefreshing` viaja al lado de `state` desde la screen hasta el template, así
  que el bloque de contenido sigue pintado y el `RefreshControl` se dibuja
  encima.
- El resultado del refresco pasa igualmente por el mismo `toDocumentListState`,
  de modo que una recarga fallida sustituye las filas por el mensaje de error
  controlado exactamente igual que haría la primera carga.
- **Descartado** — un cuarto `DocumentListStateTypes.Refreshing` cargando con
  los documentos actuales: duplica el caso de contenido con el único fin de
  etiquetarlo, y todo consumidor gana una rama que pinta lo mismo.
- **Coste** — dos maneras de decir «cargando» en una misma pantalla, y quien lee
  tiene que saber cuál de las dos vacía el cuerpo.

---

## Refrescar con el abort controller que la screen ya tiene
`2026-09-11` · `src/screens/documentListScreen/resources/`

> Una recarga lanzada por un gesto merece la misma cancelación que la lanzada al
> montar.

- El efecto de montaje ya tenía un `AbortController` que se aborta al
  desmontar, pero un refresco disparado justo antes de salir de la pantalla no
  tenía nada que lo cancelara.
- El efecto guarda ahora ese controller en una ref, y `handleRefresh` pasa su
  signal por el mismo camino que `loadDocumentListState` ya enhebra hasta
  `fetch`.
- `refreshDocumentListState` levanta el flag, espera la carga y lo vuelve a
  bajar — también en un abort, donde `toDocumentListState` devuelve `null` y no
  se escribe ningún estado.
- **Descartado** — un controller nuevo por refresco: permitiría que un segundo
  tirón cancelase al primero, pero necesita su propia contabilidad para seguir
  atado al desmontaje, que es la cancelación que aquí importa de verdad.
- **Coste** — dos tirones seguidos se ejecutan ambos hasta el final, y gana la
  respuesta que llega más tarde por llegar la última, no por diseño.

---

## Construir el `RefreshControl` inline en vez de tras un resource `to*`
`2026-09-11` · `src/ui/molecules/list/`

> Un nombre `to*` promete un mapper, y lo que estaba nombrando devolvía JSX.

- El refresh control nació como `toListRefreshControl` dentro de `resources/`,
  junto a `toListColumnStyle` y `toListContentStyle` — que devuelven estilos, no
  elementos.
- Todo lo que lleva el prefijo `to*` en este repo es un mapper, así que el
  nombre le decía a quien lee que esperara datos y le entregaba un componente.
- Ascenderlo a un componente `ListRefreshControl` era el arreglo evidente y el
  equivocado: `refreshControl` recibe un elemento que Android clona como padre
  del scroll view, así que el wrapper tendría que reenviar el `style` y los
  `children` que inyecta React Native, y el call site necesitaría un cast.
- Ahora es un ternario dentro de `List` que elige entre un elemento y
  `undefined`, que es una elección entre dos valores y no una rama que merezca
  un archivo.
- **Descartado** — mantener la extracción con un nombre `get*`: cumple la
  convención dejando un archivo de un solo llamante cuyo único trabajo es
  guardar JSX que se lee perfectamente donde se usa.
- **Coste** — `List` carga ahora con una prop de ocho líneas en su JSX, y el
  próximo control que le crezca empujará otra vez hacia la misma pregunta.

---

## Que la reconexión viva en el port de WebSocket y no en las pantallas
`2026-09-11` · `src/services/webSocket/`

> Que un socket se caiga es tráfico normal, no un error que cada consumidor
> tenga que aprender a reintentar.

- El port de http responde una petición y termina; un socket sobrevive a la
  pantalla que lo abrió y lo cierra cualquier suspensión, túnel o cambio de red.
- `createNativeWebSocketAdapter` reabre ante un cierre inesperado con un retardo
  que se dobla hasta `maxReconnectDelayMs`, reinicia la cuenta de intentos en
  cuanto una conexión se abre, y se rinde del todo cuando el llamante invoca
  `close()`.
- Los consumidores solo ven el reintento como un `onStatusChange` de
  `Reconnecting`, así que una pantalla pinta un aviso en lugar de gestionar un
  temporizador.
- **Descartado** — exponer connect/disconnect en crudo y dejar que cada llamante
  reintente: cada consumidor reimplementaría el mismo backoff, y dos pantallas
  discreparían sobre cuántos intentos son demasiados.
- **Coste** — una conexión reintenta quiera o no su llamante, y el presupuesto
  de intentos es fijo para toda la app en vez de por conexión.

---

## Devolver un handle de conexión y empujar los mensajes por callbacks
`2026-09-11` · `src/services/webSocket/models/`

> Un stream que no termina nunca no tiene promesa que resolver.

- `httpService.get` devuelve `Promise<TResponse>` porque una petición tiene
  exactamente una respuesta; una suscripción no tiene ninguna, o tiene miles.
- `connect` devuelve un `WebSocketConnectionModel` — `send` y `close` — de forma
  síncrona, y los mensajes, el estado y los errores llegan por `onMessage`,
  `onStatusChange` y `onError`.
- El handle existe antes de que el socket se abra, así que el llamante siempre
  puede cerrarlo: durante el handshake, o mientras una reconexión sigue
  pendiente.
- **Descartado** — resolver una promesa al abrir: deja al llamante sin nada que
  cancelar durante el handshake, y no puede informar de una reconexión posterior
  porque la promesa ya se resolvió.
- **Coste** — un `send` antes de que el socket esté abierto lanza en vez de
  encolar, así que el llamante tiene que mirar el estado.

---

## La URL del socket en los env y los parámetros de reconexión en código
`2026-09-11` · `env/` · `src/services/webSocket/constants.ts`

> Una dirección cambia con el entorno; una curva de backoff es una decisión
> sobre la app.

- `WEB_SOCKET_URL` acompaña a `API_URL` en cada `env/<name>.env` y `readAppConfig`
  la valida al arrancar igual que a la otra, así que un build sin ella revienta
  en lugar de apuntar en silencio a otro sitio.
- El timeout de conexión, el retardo base, su techo y el presupuesto de intentos
  viven en `src/services/webSocket/constants.ts`, donde el port arma su propia
  config.
- **Descartado** — cuatro variables más en cada archivo de entorno: ninguna
  llegaría a diferir entre local y prod, y cada una necesitaría su validación y
  su valor por defecto.
- **Coste** — reajustar el backoff es un cambio de código y una release, no una
  edición de env.

---

## Combinar los providers globales en un componente en vez de anidarlos a mano
`2026-09-11` · `src/context/`

> Añadir un contexto global debería costar una entrada en un array, no otro
> nivel de indentación en el layout raíz.

- `_layout.tsx` es el único sitio donde montar un contexto para toda la app, y
  cada provider que se añade ahí hunde un nivel más el árbol de navegación y
  reindenta todo lo que hay debajo.
- `combineComponents` pliega una lista de providers en un solo componente — la
  primera entrada queda más afuera y los children llegan intactos al más
  interno — y `AppContextProvider` es ese pliegue aplicado a
  `APP_CONTEXT_PROVIDERS`.
- El pliegue se ejecuta una vez a nivel de módulo, así que la identidad del
  componente es estable; combinar durante el render reconstruiría el tipo del
  componente en cada pasada y remontaría todo el árbol que cuelga de él.
- **Descartado** — anidar a mano un provider por concepto en el layout: se lee
  bien con dos y es una pirámide irrevisable con seis, donde añadir un contexto
  reindenta todas las líneas de debajo.
- **Coste** — el orden de anidamiento pasa a ser una posición en un array en vez
  de algo visible en el JSX, así que un provider que dependa de otro hay que
  colocarlo bien sin que nada en el código lo garantice.

---

## Dar al dominio de notificaciones una suscripción de solo lectura, no el socket
`2026-09-11` · `src/core/domains/notification/`

> Un consumidor que puede hacer `send` sobre el stream de notificaciones es un
> consumidor que puede inventarse un protocolo que nadie ha escrito.

- `/notifications` es un canal de una sola dirección: el servidor empuja, la app
  escucha. Por eso `subscribeToNotifications` devuelve un
  `NotificationSubscriptionModel` que solo lleva `close`, aunque
  `webSocketService.connect` devuelva `send` y `close`.
- El consumidor pasa `onNotification` y recibe un `NotificationModel` ya mapeado
  desde el payload en PascalCase del servidor, así que nada por encima del
  dominio ve nunca `UserID` ni `DocumentTitle`.
- Un `WebSocketError` que llega a `onError` se reenvuelve como
  `NotificationError` con el original en `cause`, y un `connect` que lanza
  directamente aflora igual — la capa de vista atribuye el fallo a las
  notificaciones, no a "un socket en alguna parte".
- **Descartado** — devolver el `WebSocketConnectionModel` tal cual: es una línea
  menos y pone toda la superficie del transporte, `send` incluido, en manos de
  cualquier consumidor.
- **Coste** — el día que una notificación necesite un mensaje de salida (un ack,
  un filtro), el modelo de suscripción tendrá que crecer con un método en vez de
  que el consumidor use lo que el puerto ya ofrece.

---

## Abrir el stream de notificaciones desde un context provider, no desde el layout raíz
`2026-09-11` · `src/context/notificationContext/`

> El socket tiene que vivir tanto como la app, y `_layout.tsx` es un navegador,
> no un ciclo de vida.

- `NotificationContextProvider` es una entrada de `APP_CONTEXT_PROVIDERS`, así
  que se monta con la app, se suscribe una vez al montar y cierra el stream al
  desmontar — el mismo hueco que usará cualquier otro global.
- El trabajo está en `resources/services.ts` (`startNotificationLogging` y los
  dos loggers que cablea) y `useNotificationSubscription` es un `useEffect`
  pelado alrededor, así que el comportamiento se testea sin renderer — este
  proyecto no tiene `@testing-library/react-native`.
- `context.test.ts` mockea el provider: ese test va del pliegue, y el provider
  real arrastraría `appConfig` y un socket vivo a un test de composición.
- **Descartado** — un `useEffect` en `_layout.tsx`: funciona, y mete ciclo de
  vida de toda la app en el fichero que debería describir rutas, donde el
  siguiente concepto global acabaría al lado.
- **Coste** — el provider hoy no comparte nada, así que es un context solo por
  ubicación; hasta que guarde estado, hay que abrirlo para descubrir que existe
  por su efecto secundario.

---

## Que las pantallas lleguen a las notificaciones por un hook, nunca por el context
`2026-09-11` · `src/hooks/useNotifications.ts` · `src/context/notificationContext/`

> Una pantalla debería pedir "el contador de notificaciones", no "lo que el
> context de notificaciones resulta que guarda".

- `NotificationContext` lleva ahora `{ count, startSubscription,
  stopSubscription }`, y el provider sigue abriendo el stream al montar — la app
  queda suscrita desde la raíz sin que ninguna pantalla lo pida.
- `useNotifications`, en `src/hooks/`, es el único consumidor de `useContext`,
  así que una pantalla importa `@hooks/useNotifications` y nunca se entera de
  que existe un context. Lanza si se llama fuera del árbol de providers, en vez
  de devolver un `null` que cada call site tendría que estrechar.
- El ciclo start/stop vive en `createNotificationStreamController`, un closure
  plano en `resources/services.ts` que guarda una sola suscripción: `start` no
  hace nada mientras haya stream abierto, `stop` lo cierra y lo limpia, y
  volver a arrancar abre uno nuevo. Eso hace la semántica testeable sin
  renderer, y convierte el doble disparo del efecto bajo StrictMode en un no
  problema.
- Esto deja atrás el coste apuntado en la entrada anterior — el provider ya
  guarda estado, así que es un context de verdad y no solo por ubicación.
- **Descartado** — exportar `NotificationContext` para que las pantallas lo
  consuman directamente: un import menos, y cada pantalla quedaría acoplada a
  cómo se provee el valor, así que mover las notificaciones a un store más
  adelante las tocaría todas.
- **Coste** — hay un único stream compartido, así que una pantalla que llame a
  `stopSubscription` lo para para toda la app, no solo para ella. Nada en la API
  lo dice.

---

## Rendirse con el stream de notificaciones tras tres fallos y decirlo
`2026-09-11` · `src/context/notificationContext/` · `src/hooks/useNotifications.ts`

> Un stream que falla en silencio es peor que uno que se para y lo admite.

- El adapter de websocket ya reintenta con backoff, pero por encima nadie
  decidía nunca que un stream ya no tenía arreglo: contra un backend caído
  reconectaba en bucle mientras la UI mostraba un contador viejo sin forma de
  saberlo.
- `createNotificationStreamController` ahora cuenta fallos consecutivos, cierra
  la suscripción al tercero y llama a `onFailureLimitReached`. Una notificación
  entregada reinicia la cuenta, así que un fallo suelto nunca lo dispara, y una
  vez alcanzado el límite los errores siguientes se ignoran en vez de volver a
  reportarlo.
- `useNotificationSubscription` lo convierte en `isError`, que `useNotifications`
  entrega a las pantallas, así que la UI puede ofrecer un reintento —
  `startSubscription` limpia el flag y abre un stream nuevo.
- **Descartado** — poner el límite en `nativeWebSocketAdapter`: ahí se cuentan
  *reconexiones*, que son cosa del transporte, mientras que "esta feature está
  rota, avisa al usuario" le toca a la suscripción y necesita una señal visible
  para React que el adapter no tiene por qué gestionar.
- **Coste** — todos los fallos pesan igual, así que tres mensajes malformados
  cierran un socket sano, y el `maxReconnectAttempts: 5` del adapter es
  inalcanzable en la práctica porque tres reconexiones fallidas paran el stream
  antes. Los dos límites solo se entienden leídos juntos.

---

## Declarar todo con const y ponerle nombre al estado mutable
`2026-09-11` · `.claude/skills/const-bindings/` · `src/context/notificationContext/resources/services.ts`

> `let` no es más lento — simplemente es una promesa que el lector nunca recibe.

- El controller de notificaciones guardaba su suscripción y su contador de
  fallos en dos `let` al principio de un closure, que es como toda factory de
  este codebase había guardado estado hasta ahora.
- En `src/` las declaraciones son solo `const`. El estado que tiene que cambiar
  vive en un objeto ligado a `const` y tipado por una interfaz
  `<Thing>StateModel`, así la memoria de un closure es una única declaración
  tipada en vez de bindings sueltos repartidos por el fichero.
- El motivo es el coste de lectura, no la velocidad. `let` y `const` compilan al
  mismo scope slot y hacen hoisting igual, a la misma temporal dead zone, así
  que aquí no corre nada más rápido. Lo que cambia es que un nombre significa
  una sola cosa en todo su scope, y que la mutación hay que escribirla
  `state.x` justo donde ocurre.
- **Descartado** — apoyarse en `prefer-const`: solo marca un `let` que nunca se
  reasigna, que es justo el caso que nadie falla, así que dejaría intacto todo
  binding del que va realmente esta política.
- **Coste** — la regla todavía no está en `eslint.config.js`, porque activarla
  rompe los adapters de websocket y de language, anteriores a la política. Hasta
  reformarlos esto depende de la review, que es justo de lo que este proyecto
  decidió no depender en su primera entrada.

---

## Avisar del feed de notificaciones roto en el propio badge, no al lado
`2026-09-11` · `src/ui/atoms/badge/` · `src/screens/documentListScreen/`

> La campana ya sabía que el stream había muerto; simplemente seguía mostrando el último count que tenía, y eso se lee como actual.

- `useNotifications` expone `isError` desde que el stream se rinde tras tres
  fallos, pero nadie lo pintaba. Un count del que no se puede responder es peor
  que ningún count, porque un número obsoleto no lleva ninguna marca de serlo.
- `Badge` recibe `isError`: fondo rojo, `!` en lugar del número, y visible en
  cero — el único caso en que un count a cero pinta algo. El count se ignora en
  vez de borrarse, así que la pastilla vuelve al número en cuanto se va el error.
- El hook de la screen lee `count` e `isError` del hook de contexto y los baja
  como `notificationCount` y `hasNotificationError`. El template sigue recibiendo
  props planas y nunca toca el contexto, así que se puede pintar desde Storybook.
  `disabled` gana a `isError` — un control inerte no debería gritar en rojo
  mientras el icono de al lado se apaga en gris.
- **Descartado** — un banner o un toast sobre la lista: el fallo es de la
  campana, no de los documentos, y un mensaje que se cierra ya no está cuando el
  usuario se pregunta si el count es real. El badge es justo donde estaría el
  número equivocado.
- **Coste** — `!` no explica nada por sí solo, y el fondo rojo no le dice
  absolutamente nada a un lector de pantalla, así que el label accesible tiene
  que cambiar a `_DOCUMENT_LIST_TEMPLATE_NOTIFICATIONS_ERROR` para transmitir el
  estado. Aparece un cuarto rol de paleta (`Colors.error`) para una sola pastilla.
- **Abierto** — `startSubscription` está conectado y sigue sin llamarse: no hay
  retry desde la UI, así que el badge informa del fallo sin ofrecer una salida.

---

## Que el formulario de nuevo documento sea dueño de sus campos y `onSubmit` del resultado
`2026-09-11` · `src/ui/templates/newDocumentFormTemplate/`

> El template puede sostener un nombre a medio escribir, pero no le corresponde
> decidir qué le dice al usuario una creación fallida.

- El formulario tiene tres campos, un botón de envío y un camino de fallo. Subir
  los valores a la screen supone re-renderizar todo el sheet en cada pulsación
  por un estado que nadie por encima del template puede aprovechar; dejar el
  fallo dentro supone que el template se invente el texto de una llamada que no
  ha hecho.
- El reparto sigue a quién puede responder la pregunta. Los valores,
  `isSubmitting` y si el botón es pulsable se quedan en
  `useNewDocumentFormTemplate`; `onSubmit` recibe los valores y responde con un
  `NewDocumentFormResponseModel` — éxito, o error con su propio `message` — y el
  template se limita a pintarlo.
- Un error deja los campos tal cual se escribieron para que reintentar no cueste
  nada, y los bloquea en lugar de cambiar el formulario por un spinner, así que
  lo que se está creando sigue legible mientras está en vuelo.
- **Descartado** — `onSubmit: () => void` con una prop `errorMessage` aparte, la
  forma que usa `DocumentListTemplate` para su state. Allí funciona porque la
  screen es dueña de los documentos; aquí obligaría a la screen a sostener un
  estado cuyo único lector es el template, y a mantenerlo al día con un envío que
  el template ya controla.
- **Coste** — ahora conviven dos formas de fallar: una promesa rechazada sigue
  escapándose del template sin tocar, así que cada caller tiene que resolver sus
  errores dentro del modelo de respuesta en vez de lanzarlos.
- **Abierto** — qué hace el éxito más allá de limpiar los campos nunca se cerró.
  El template no cierra el sheet, así que quien conecte `onSubmit` decide si un
  documento creado además lo descarta.

---

## Compartir el cierre del sheet-sobre-ruta entre las dos screens de sheet
`2026-09-11` · `src/hooks/useBottomSheetScreen.ts`

> Un sheet que en realidad es una ruta tiene que cerrarse dos veces — visualmente
> y luego navegando atrás — y ese doble paso estaba a punto de copiarse y pegarse.

- `/detail` y ahora `/new` son rutas `transparentModal` pintadas como bottom
  sheet, así que cerrar una implica ocultar el sheet, dejar que termine la
  animación de salida y solo entonces llamar a `goBack` — si no, la ruta se
  desmonta a media animación y el sheet desaparece en vez de deslizarse.
- `useBottomSheetScreen(sheetScreenRatio)` es ahora dueño de esa secuencia — el
  flag `isVisible`, el aplazamiento con
  `InteractionManager.runAfterInteractions(goBack)` y su cancelación — y cada
  screen conserva solo su propia proporción de alto: `0.5` para el detalle,
  `0.75` para el formulario, que tiene que encajar una cabecera, tres campos y un
  botón fijado debajo.
- **Descartado** — copiar el cuerpo de `useDocumentDetailScreen` dentro de
  `useDocumentNewScreen`. El aplazamiento es de esos detalles que se arreglan en
  una copia y no en la otra, y un sheet que desaparece en vez de cerrarse pasa
  desapercibido con facilidad en una revisión.
- **Coste** — `src/hooks/` guarda ahora un hook que solo pueden usar dos
  screens, y la proporción de alto pasó a ser un parámetro, así que la
  proporción de un sheet se decide en el call site mientras su ciclo de vida se
  decide en el hook.
- **Abierto** — presentar el formulario como una ruta en lugar de como un flag en
  `DocumentListScreen` se especificó, no se sopesó aquí, así que la comparación
  contra el estado inline nunca se argumentó.

> **Superseded** el `2026-09-11` por [Presentar las screens de sheet como rutas formSheet nativas](#presentar-las-screens-de-sheet-como-rutas-formsheet-nativas) — una ruta `formSheet` nativa se cierra sola, así que ya no queda cierre en dos pasos que compartir.

---

## Resolver el submit sin conectar como un éxito en vez de fingir un fallo
`2026-09-11` · `src/screens/documentNewScreen/resources/services.ts`

> Todavía no hay endpoint de creación, y el contrato del formulario no tiene
> forma de decir "no ha pasado nada".

- `NewDocumentFormSubmitType` tiene que responder con éxito o con un error que
  lleva un mensaje, así que un submit que no tiene nada detrás sigue teniendo
  que elegir uno — y el template actúa según lo que reciba.
- `submitNewDocumentWithoutPersistence` resuelve con éxito y no hace nada más. Su
  nombre es toda la advertencia: el día que exista un repository de creación, ese
  único binding es lo que se reemplaza, y ni la screen ni el template se mueven.
- **Descartado** — responder con un error tipo "no implementado". Pinta un
  mensaje rojo que el usuario no puede arreglar ni superar reintentando, y
  ejercita el camino de fallo justo donde no ha fallado nada.
- **Coste** — el template limpia sus campos al tener éxito, así que el sheet
  informa ahora de un documento creado que nunca se guardó. Quien haga una demo
  de esto verá un flujo de creación que funciona.
- **Abierto** — si un éxito real debería además descartar el sheet sigue sin
  responderse, heredado de la entrada del propio template; el stub lo deja
  abierto.

---

## Entregar todo el ancho del sheet al contenido que trae su propio padding
`2026-09-11` · `src/ui/organisms/bottomSheetNavigationWrapper/`

> Un template que ya se paddea solo y dibuja reglas de borde a borde no puede
> vivir dentro del margen de 16pt del propio sheet.

- El `BottomSheet` de `@expo/ui` paddea a sus children por defecto en todas las
  plataformas — 16pt a los lados — y el wrapper nunca pasaba `contentPadding`,
  así que lo heredaba. Inofensivo para el texto centrado del sheet de detalle;
  incorrecto para `NewDocumentFormTemplate`, que es dueño de su padding
  `Spacing.three` y termina en un footer cuyo borde superior debería cruzar el
  sheet entero.
- `hasContentInset` (por defecto `true`) lo decide ahora, y la `View` de
  contenido se estira a `width: '100%'` en vez de confiar en que el host la
  dimensione. `DocumentNewScreen` es el único caller que apaga el inset.
- **Descartado** — quitar el inset para todos. Es el valor correcto para
  contenido que no trae padding propio, que es justo lo que demuestran los
  stories del wrapper, y quitarlo reespaciaría ese contenido en silencio.
- **Coste** — un cuarto booleano en un wrapper que ya llevaba tres, y una regla
  de layout que el caller tiene que conocer: si apagas el inset, el padding pasa
  a ser tu problema.

> **Superseded** el `2026-09-11` por [Presentar las screens de sheet como rutas formSheet nativas](#presentar-las-screens-de-sheet-como-rutas-formsheet-nativas) — el contenido de la ruta llena el sheet, así que no hay inset de wrapper del que salirse.

---

## Separar por nombre los dos colores del sheet en vez de llamar background al scrim
`2026-09-11` · `src/ui/organisms/bottomSheetNavigationWrapper/styles.ts`

> Una prop llamada `backgroundColor` estaba pintando lo que hay detrás del sheet,
> no el sheet.

- `BOTTOM_SHEET_NAVIGATION_WRAPPER_BACKGROUND_COLOR` era un negro translúcido que
  alimentaba `scrimColor`, así que el chrome propio del sheet — la zona del drag
  indicator y, en iOS, el inset del home indicator — se quedaba con el valor por
  defecto de la plataforma y se leía como un borde gris alrededor de un
  formulario que se pinta a sí mismo con `Colors.background.default`.
- Ahora están separados: `backgroundColor` es la superficie del sheet, conectada
  a `containerColor` y con el blanco del theme por defecto, y `scrimColor` es el
  velo de detrás, que conserva el negro translúcido.
- **Descartado** — poner el constant existente en blanco donde estaba, siguiendo
  conectado al scrim. Habría dejado la lista de detrás en blanco opaco en Android
  en vez de atenuarla, y el borde gris se habría quedado igual.
- **Coste** — una quinta prop, y la matriz de plataformas se ensancha en vez de
  estrecharse: la superficie llega a Android, iOS 16.4+ y web; el velo solo a
  Android.
- **Abierto** — el velo sigue siendo un `#00000066` literal. La paleta no tiene
  ningún rol translúcido del que sacarlo, así que se queda en hex hasta que
  exista uno.

> **Superseded** el `2026-09-11` por [Presentar las screens de sheet como rutas formSheet nativas](#presentar-las-screens-de-sheet-como-rutas-formsheet-nativas) — la plataforma pinta superficie y scrim; solo la superficie sigue siendo nuestra, vía `contentStyle`.

---

## Presentar las screens de sheet como rutas formSheet nativas
`2026-09-11` · `src/app/_layout.tsx`

> El sheet se estaba construyendo dos veces: una por el navegador al presentar la
> ruta, y otra por un componente que presentaba un sheet dentro de ella.

- `/detail` y `/new` eran rutas `transparentModal`, cada una pintando un
  `BottomSheetNavigationWrapper` alrededor del `BottomSheet` de `@expo/ui`. Un
  modal dentro de un modal, así que cerrar costaba dos pasos en un orden fijo
  —ocultar el sheet, esperar su animación, y entonces sacar la ruta— y cada
  asunto del sheet (scrim, inset, color de superficie, qué gestos cierran) había
  que volver a exponerlo como prop.
- expo-router llega al mismo sheet nativo desde la declaración de la ruta:
  `presentation: 'formSheet'` con `sheetAllowedDetents` conservando las alturas
  que tenían los ratios (`0.5` para el detalle, `0.75` para el formulario). Las
  screens pintan ahora su contenido y nada más, y el cierre es de la plataforma.
- Eso ha borrado el wrapper y sus diez ficheros, el aplazamiento de
  `useBottomSheetScreen`, `useDocumentDetailScreen` entero, y con ellos las props
  de inset y de color que las dos entradas de arriba acababan de introducir.
- **Descartado** — conservar el wrapper por las escapatorias que documentaban sus
  stories: modifiers de cierre por plataforma y un color de scrim para Android.
  Ninguna ruta llegó a pasarlos nunca, así que eran mandos sin nadie al mando.
- **Coste** — el control que queda es el que expone el navegador.
  `sheetGrabberVisible` es solo de iOS, la lista de detents es toda la API de
  dimensionado, y los interruptores separados de swipe y backdrop ya no existen.
  `@expo/ui` es ahora una dependencia sin uso.
- **Abierto** — esto no se ha ejecutado en dispositivo. Si `0.75` deja los campos
  del formulario libres del teclado es justo lo que tiene que responder la
  prueba; un segundo detent (`[0.75, 1]`) es la palanca si no lo hace.

---

## Añadir una capa de actions como contrapartida de escritura de las views
`2026-09-11` · `src/core/actions/createDocumentAction/`

> Una view responde a "qué pinta esta screen al cargar". Nada respondía a "qué
> pasa cuando esta screen envía".

- Crear un documento son tres pasos seguidos —leer el fichero elegido,
  codificarlo, enviarlo— y cada uno puede fallar con un mensaje distinto.
  Ponerlo en el hook de la screen haría que la screen orquestase dominios;
  ponerlo en el dominio haría que un repositorio leyese el sistema de ficheros.
- `src/core/actions/` replica exactamente `src/core/views/`: una carpeta por
  operación, un punto de entrada, una carpeta de mappers nombrados por la
  dirección que recorren, models, mocks y un test. La diferencia es la dirección
  —una view abre en abanico con `Promise.allSettled` y devuelve estado por
  sección; una action es una sola secuencia y devuelve un `ActionResultType`
  (`ok`, o `error` con mensaje traducido y la causa cruda).
- La screen conserva su forma: `documentNewScreen` sigue dando a la template un
  `NewDocumentFormSubmitType`, y hace dos cosas con el resultado de la action —
  traducirlo al modelo de respuesta de la template, y cerrar el sheet cuando dice
  que el documento se ha creado. Ambas viven en `resources/`, así que el hook se
  queda en cableado y el comportamiento se puede testear sin renderer.
- **Descartado** — reutilizar `ViewSectionType` para el resultado: su rama
  `aborted` no significa nada en un envío, y un caso `ok` que no lleva datos
  habría necesitado un parámetro de tipo `void` en cada llamada.
- **Coste** — una segunda unión de estados (`ActionStatusTypes`) conviviendo con
  `ViewSectionStatusTypes`, y una segunda convención de carpetas que aprender.

---

## Simular el endpoint de creación dentro del repositorio, no por encima
`2026-09-11` · `src/core/domains/document/repositories/createDocument.ts`

> El endpoint todavía no existe. Todo lo que depende de su *forma* se puede
> construir y probar igualmente hoy.

- `createDocument` mapea el modelo al payload `{name, version, file_base_64,
  file_name}` que tomará la API y luego espera 2000 ms como sustituto de la
  petición. La llamada real está justo debajo, comentada, tomando la misma
  variable `payload` — así que aterrizar el endpoint es borrar dos líneas y
  descomentar dos.
- El retardo no es decorado: es la única razón por la que se puede ver funcionar
  el bloqueo de campos del formulario y la etiqueta `Enviando…` antes de que
  haya servidor.
- Mantener la simulación *dentro* del repositorio significa que la action, la
  screen y sus tests se escriben contra la firma definitiva. Nada por encima del
  dominio sabe que falta el endpoint.
- **Descartado** — simular en la action o en la screen: el mapper del payload se
  habría quedado sin quien lo llamase, y todas las capas de arriba habría que
  reescribirlas al aterrizar el endpoint.
- **Coste** — código comentado en `src/`, que la propia política del proyecto
  prohíbe; una rama `DocumentError` que ningún test alcanza honestamente, porque
  el sustituto nunca rechaza; y `@services/http` aún no tiene `post`, así que la
  línea comentada no compilará tal cual está hasta que lo tenga.

---

## Leer el fichero a través de un port en vez de dejar que la action importe Expo
`2026-09-11` · `src/services/fileReader/` · `eslint.config.js`

> El trabajo de la action es orquestar. Saber que el base64 sale de
> `new File(uri).base64()` no es orquestar.

- `@services/fileReader` expone un solo método, `readAsBase64(uri)`, y su adapter
  de Expo es el único fichero del proyecto autorizado a importar
  `expo-file-system` — vigilado por el mismo bloque `no-restricted-imports` que
  ya guarda las librerías de picker, storage, localización e i18n.
- Los fallos vuelven como `FileReaderError` nombrando el uri, así que la action
  nunca ve un tipo de error de Expo.
- Para que el uri llegase siquiera hasta ahí, `InputDocument` ha tenido que dejar
  de informar del *nombre* del fichero y pasar a informar del `PickedDocumentModel`
  entero; el formulario guarda ahora `fileName` para lo que pinta y `fileUri`
  para lo que envía.
- **Descartado** — falsear también el base64, ya que el endpoint ya está
  falseado: la codificación es la única parte real de este flujo, y falsearla
  habría escondido si el uri cacheado del picker es legible siquiera.
- **Coste** — una dependencia de runtime nueva (`expo-file-system@57`), una
  quinta entrada en cada lista de imports restringidos, y el fichero entero se
  sostiene en memoria como string base64, lo que no aguantará adjuntos grandes.

---

## Sacar la elección de layout del template para poder recordarla
`2026-09-11` · `src/screens/documentListScreen/` · `src/ui/templates/documentListTemplate/`

> Una preferencia que tiene que sobrevivir a la app no puede guardarla el
> componente que la pinta.

- El selector de lista/cuadrícula volvía a `list` en cada arranque: el template
  lo guardaba en su propio `useState`, e `initialLayout` era una prop que
  ninguna screen llegaba a pasar.
- El layout se controla ahora igual que el orden — la screen es dueña del
  estado, lo escribe en `@services/storage` en cada cambio y lo vuelve a leer
  al montar, así que el template regresa a pintar lo que le dan.
- El string almacenado pasa por el propio `isDocumentListLayout` del template
  antes de darlo por bueno, así que un layout renombrado o un valor editado a
  mano cae de vuelta a `list` en lugar de llegar a la toolbar como una opción
  desconocida.
- Un fallo de lectura o de escritura se registra y se traga: un dispositivo que
  no puede guardar una preferencia debería seguir abriendo la página.
- **Descartado** — dejar el estado en el template y sembrarlo con
  `initialLayout` desde storage: storage responde de forma asíncrona, así que
  la semilla llega después del primer render, que es justo cuando `useState`
  deja de escucharla.
- **Coste** — cambiar de layout vuelve a renderizar la screen entera y no solo
  el template, y el primer frame tras el arranque siempre pinta `list` antes de
  que aterrice el valor guardado.

---

## Aplicar el orden en el template y reducir los criterios al nombre
`2026-09-11` · `src/ui/templates/documentListTemplate/` · `src/translations/`

> Un control de orden que solo resalta la opción elegida es un botón que miente.

- `sort` viajaba de la screen al template y ahí se quedaba: fijaba el valor
  seleccionado del dropdown y nunca se usaba para ordenar nada, así que la
  lista salía en el orden en que la devolvía la API.
- `Más recientes` era un criterio que la lista no podía cumplir —
  `DocumentListItemModel` lleva id, title, description, contributors y
  attachments, y ninguna fecha que comparar — así que las dos opciones son
  ahora `nameAsc` y `nameDesc` sobre `title`.
- `sortDocumentList` ordena una copia con `localeCompare` y se aplica en
  `DocumentListBody`, en el único camino que entrega los documentos a la lista,
  de modo que no hay ningún estado que mantener al día con el criterio.
- **Descartado** — reordenar en `documentListView` o pedir la lista ya ordenada
  a la API: ambas convierten en una recarga lo que es reordenar filas que ya
  están en pantalla, y el view mapea una sola vez al cargar por diseño.
- **Coste** — el array se copia y se reordena en cada render del body y no solo
  cuando cambia el criterio, y el criterio no se guarda a propósito, así que se
  reinicia al arrancar a diferencia del layout que tiene al lado.

---

## Acumular el feed de notificaciones en el context, no solo su contador
`2026-09-11` · `src/context/notificationContext/` · `src/hooks/useNotifications.ts`

> Una notificación que solo se cuenta es una notificación que nadie podrá leer.

- El context exponía `count` e `isError` y nada más, así que cada notificación
  se registraba en consola y desaparecía — el websocket es la única fuente y no
  hay repositorio al que volver a pedirla.
- `useNotificationSubscription` guarda ahora las notificaciones en sí, la más
  reciente primero, y `NotificationEntryModel` extiende el modelo de dominio
  con un `id` que el context asigna a partir del tamaño de la lista, porque el
  payload no trae ninguno.
- **Descartado** — usar como clave `documentId` más `timestamp`: dos ediciones
  del mismo documento dentro del mismo segundo chocan, y la lista se come una
  fila sin decir nada.
- **Descartado** — un `notificationListView` bajo `src/core/views/`: los views
  existen para llamar a repositorios y mapear una sola vez al cargar, y este
  feed llega por push sin carga que mapear, así que la screen lo mapea en sus
  propios `resources/`.
- **Coste** — la lista crece durante toda la vida del proceso sin tope ni
  desalojo, así que una sesión abierta todo el día retiene en memoria cada
  notificación recibida.

---

## Marcar las notificaciones como leídas al abrir su pantalla
`2026-09-11` · `src/screens/notificationListScreen/` · `src/context/notificationContext/`

> Leerlas es la única señal disponible, así que tiene que ser la que valga.

- El badge contaba cada notificación que el stream había entregado y nada lo
  limpiaba, así que solo sabía subir.
- La screen llama a `markAsRead` una vez al montar y el context devuelve
  `count` a cero conservando la lista acumulada, lo que convierte el badge en
  «sin leer desde la última vez que miraste» y deja la lista como registro
  completo.
- **Descartado** — un flag `read` por notificación: nada en este feed es
  direccionable, sin id de servidor ni persistencia, así que un estado de
  lectura por elemento sería estado inventado que muere con el proceso igual.
- **Coste** — una notificación que llega con la pantalla abierta vuelve a subir
  el badge aunque el usuario la esté mirando de frente.

---

## Avisar de una suscripción caída encima del feed, no en su lugar
`2026-09-11` · `src/ui/templates/notificationListTemplate/`

> Sustituir el feed por su mensaje de error tira la única copia que hay de él.

- Tras tres fallos seguidos el controller del stream cierra el socket y el
  context levanta `isError`; hasta ahora eso solo cambiaba el badge de la
  campana, y la página que había detrás no tenía forma de contar qué pasaba.
- El template pinta un banner de alerta con un botón de reconexión encima de la
  lista, y el botón llama a `startSubscription`, que limpia el error y abre un
  socket nuevo.
- Las notificaciones ya recibidas siguen pintadas debajo, porque una reconexión
  no las reemite y nada más las guarda.
- **Descartado** — cambiar el cuerpo por un estado de error como hace
  `documentListTemplate`: allí los documentos se pueden volver a pedir, aquí la
  lista en pantalla es la única copia que existe.
- **Coste** — la página puede mostrar un feed de aspecto sano bajo un banner
  que dice que el feed está caído, lo cual es exacto pero solo si se lee el
  banner.

---

## Ser dueños del estado de red tras un puerto en vez de llamar al hook de Expo
`2026-09-11` · `src/services/network/` · `src/hooks/useNetworkState.ts`

> Un hook que cada componente llama por su cuenta le da a cada uno su propia respuesta.

- `expo-network` trae `useNetworkState()`, pero abre un listener de plataforma
  por cada componente que lo llama y devuelve un objeto nuevo en cada render, así
  que nadie aguas abajo puede compartir una lectura ni comparar dos.
- `networkService` envuelve la librería en el único adapter con permiso para
  importarla, guarda un único snapshot y abre el listener de plataforma una sola
  vez — con el primer suscriptor — de modo que `useNetworkState` es un
  `useSyncExternalStore` sobre una sola verdad, la forma que `useTranslate` ya
  usa para el idioma.
- El snapshot solo se sustituye cuando `isOnline` o `status` cambian de verdad,
  así que una lectura repetida devuelve la misma referencia y no re-renderiza
  nada.
- La app arranca optimista (online, estado desconocido) y la primera lectura real
  llega de forma asíncrona, así que el aviso de sin conexión no puede parpadear
  en un arranque sano.
- **Descartado** — `isInternetReachable` como único veredicto: se queda en
  `undefined` hasta que Android valida la conexión, lo que se leería como sin
  conexión durante los primeros instantes de cada arranque.
- **Coste** — una conexión levantada que no llega a internet solo se detecta en
  Android; en iOS ese campo refleja `isConnected`, así que un portal cautivo pasa
  desapercibido.

---

## Bloquear la app sin red con una hoja sobre la ruta, no con una ruta propia
`2026-09-11` · `src/ui/organisms/networkStatusGate/` · `src/ui/organisms/networkStatusSheet/` · `src/app/_layout.tsx`

> Navegar fuera de la ruta tira justo aquello que el usuario quiere recuperar.

- `NetworkStatusGate` se monta una vez junto a `<Stack>` en el layout raíz y no
  pinta nada mientras el dispositivo está online, así que hay un único punto de
  cableado y ninguna pantalla tiene que saber que la red existe.
- Sin conexión llena la pantalla con `BottomSheet`, cuyo `onDismiss` ahora es
  opcional: sin él el overlay no tiene zona pulsable, así que la hoja bloquea
  todo lo que hay detrás y el botón de reintentar es la única salida.
- La hoja no lee ningún servicio ni guarda estado — recibe el estado de la
  conexión, si hay una comprobación en curso y el handler de reintento — así que
  el gate se queda con todas las decisiones.
- **Descartado** — una ruta `/offline` empujada al perder la red: la ruta de
  debajo es exactamente lo que tiene que volver, y empujar dejaría una pantalla
  de sin conexión en el historial de la que el usuario luego tiene que salir.
- **Coste** — la hoja tapa la pantalla incluso para trabajo que no necesita red,
  así que un borrador de formulario sin enviar queda fuera de alcance hasta que
  vuelve la conexión.

---

## Cortar el stream con el estado de red y recuperar reemplazando la ruta
`2026-09-11` · `src/context/notificationContext/` · `src/hooks/useAppNavigation.ts`

> Un socket reintentando contra una red muerta es gastar batería con una línea de log.

- `useNotificationSubscription` engancha su efecto a `isOnline` y, en la rama de
  sin conexión, llama a `fail` en vez de a `stop`: perder la red toma exactamente
  el mismo camino que ya tomaban tres errores seguidos del stream, así que el
  socket se cierra, sus timers de reconexión se van con él y el feed se declara
  no disponible en lugar de aparentar salud estando congelado.
- `fail` vive en el controller del stream y no en el hook, porque el contador de
  fallos es suyo: fija la cuenta en el límite, así que un error tardío del socket
  que acaba de cerrar no puede reportar dos veces la misma caída.
- Volver a tener red limpia el error durante el render, donde es estado derivado
  y no un efecto secundario; el efecto abre después un socket nuevo.
- Perder la red ya es un estado que la app tiene previsto, así que el stream
  reporta sus fallos con `console.warn` y no con `console.error`: LogBox pintaba
  una caja roja de crash en dev para algo que acaba en un aviso de diseño.
- `startSubscription` — el botón de reconectar de la página de notificaciones —
  se niega a ejecutarse sin conexión, así que la única vía pública de vuelta al
  stream no puede reabrirlo por debajo del aviso.
- Caerse la red normalmente falla el stream tres veces antes y deja `isError`
  levantado, así que el hook lo limpia en la transición a online durante el
  render — si no, el feed volvería sano bajo un banner caduco de "desconectado".
- Reintentar le pide a `networkService.refresh()` una lectura nueva y solo llama
  a `refreshCurrentRoute` si vuelve online; eso hace `router.replace` del
  pathname actual, y replace siempre monta una key de ruta nueva, así que la
  pantalla vuelve a ejecutar sus cargas donde el usuario ya estaba.
- **Descartado** — remontar el árbol con una key que cambia: el estado del
  navegador vive en ese árbol, así que el remontaje dejaría al usuario en la
  primera ruta en lugar de en la que perdió.
- **Coste** — el reintento rehace la ruta desde cero, así que todo lo que la
  pantalla tuviera y no viniera de un repositorio se va con ella.

---

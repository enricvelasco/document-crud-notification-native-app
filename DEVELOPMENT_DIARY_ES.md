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

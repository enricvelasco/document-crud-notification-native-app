// `@constants/theme` imports `src/global.css` for its web font variables. Metro
// and Vite handle that; Jest has no CSS transform and would choke on the first
// `:root {`. Mapping every stylesheet to this empty module keeps the theme —
// and therefore every UI unit test — importable under Jest.
module.exports = {}

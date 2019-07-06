export default {
  'url_escape': (x: string) => encodeURI(x),
  'url_param_escape': (x: string) => encodeURIComponent(x)
}

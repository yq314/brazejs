export default {
  json_escape: (x: string) => JSON.stringify(x).slice(1, -1)
}

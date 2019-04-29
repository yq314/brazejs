import TagToken from '../../parser/tag-token'
import Context from '../../context/context'
import ITagImplOptions from '../../template/tag/itag-impl-options'
import {AbortError} from '../error';

const re = new RegExp(`\\(('([^']*)'|"([^"]*)")?\\)`)

export default <ITagImplOptions>{
  parse: function (tagToken: TagToken) {
    const match = tagToken.args.match(re)
    if (!match) {
      throw new Error(`illegal token ${tagToken.raw}`);
    }

    this.msg = match[2] || match[3] || 'message is aborted'
  },
  render: async function (ctx: Context) {
    throw new AbortError(this.msg)
  }
}

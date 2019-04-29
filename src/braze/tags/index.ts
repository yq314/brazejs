import connectedContent from './connectedContent'
import abortMessage from './abortMessage'
import ITagImplOptions from '../../template/tag/itag-impl-options'

const tags: { [key: string]: ITagImplOptions } = {
  'connected_content': connectedContent,
  'abort_message': abortMessage,
}

export default tags;

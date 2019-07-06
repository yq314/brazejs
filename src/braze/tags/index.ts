import connectedContent from './connectedContent'
import abortMessage from './abortMessage'
import contentBlocks from './contentBlocks'
import ITagImplOptions from '../../template/tag/itag-impl-options'

const tags: { [key: string]: ITagImplOptions } = {
  'connected_content': connectedContent,
  'abort_message': abortMessage,
  'content_blocks': contentBlocks
}

export default tags

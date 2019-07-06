import whiteSpaceCtrl from './whitespace-ctrl'
import HTMLToken from './html-token'
import TagToken from './tag-token'
import Token from './token'
import OutputToken from './output-token'
import { TokenizationError } from '../util/error'
import { NormalizedFullOptions, applyDefault } from '../liquid-options'

enum ParseState { HTML, OUTPUT, TAG, ATTRIBUTE, CONTENT_BLOCKS }

export default class Tokenizer {
  private options: NormalizedFullOptions
  constructor (options?: NormalizedFullOptions) {
    this.options = applyDefault(options)
  }
  tokenize (input: string, file?: string) {
    const tokens: Token[] = []
    const {
      tagDelimiterLeft,
      tagDelimiterRight,
      outputDelimiterLeft,
      outputDelimiterRight
    } = this.options
    const attributeLeft = '${'
    const attributeRight = '}'
    const contentBlocksTag = 'content_blocks'

    let p = 0
    let curLine = 1
    let state = ParseState.HTML
    let buffer = ''
    let lineBegin = 0
    let line = 1
    let col = 1
    let originalState = ParseState.HTML

    while (p < input.length) {
      if (input[p] === '\n') {
        curLine++
        lineBegin = p + 1
      }
      if (state === ParseState.HTML) {
        if (input.substr(p, outputDelimiterLeft.length) === outputDelimiterLeft) {
          if (buffer) tokens.push(new HTMLToken(buffer, input, line, col, file))

          line = curLine
          col = p - lineBegin + 1
          buffer = outputDelimiterLeft
          p += outputDelimiterLeft.length

          // handle content blocks
          while (input.substr(p, 1) === ' ') {
            buffer += ' '
            p += 1
          }

          if (input.substr(p, contentBlocksTag.length) === contentBlocksTag) {
            buffer += contentBlocksTag
            p += contentBlocksTag.length
            state = ParseState.CONTENT_BLOCKS
          } else {
            state = ParseState.OUTPUT
          }

          continue
        } else if (input.substr(p, tagDelimiterLeft.length) === tagDelimiterLeft) {
          if (buffer) tokens.push(new HTMLToken(buffer, input, line, col, file))
          buffer = tagDelimiterLeft
          line = curLine
          col = p - lineBegin + 1
          p += tagDelimiterLeft.length
          state = ParseState.TAG
          continue
        }
      } else if (
        (state === ParseState.OUTPUT || state === ParseState.CONTENT_BLOCKS) &&
        input.substr(p, attributeLeft.length) === attributeLeft
      ) {
        originalState = state
        buffer += attributeLeft
        line = curLine
        col = p - lineBegin + 1
        p += attributeLeft.length
        state = ParseState.ATTRIBUTE
        continue
      } else if (state === ParseState.ATTRIBUTE && input[p] === attributeRight) {
        buffer += attributeRight
        line = curLine
        col = p - lineBegin + 1
        p += attributeRight.length
        state = originalState
        originalState = ParseState.HTML
        continue
      } else if (
        (state === ParseState.OUTPUT || state === ParseState.CONTENT_BLOCKS) &&
        input.substr(p, outputDelimiterRight.length) === outputDelimiterRight
      ) {
        buffer += outputDelimiterRight
        const tokenType = state === ParseState.OUTPUT ? OutputToken : TagToken
        tokens.push(new tokenType(buffer, buffer.slice(outputDelimiterLeft.length, -outputDelimiterRight.length), input, line, col, this.options, file))
        p += outputDelimiterRight.length
        buffer = ''
        line = curLine
        col = p - lineBegin + 1
        state = ParseState.HTML
        continue
      } else if (input.substr(p, tagDelimiterRight.length) === tagDelimiterRight) {
        buffer += tagDelimiterRight
        tokens.push(new TagToken(buffer, buffer.slice(tagDelimiterLeft.length, -tagDelimiterRight.length), input, line, col, this.options, file))
        p += tagDelimiterRight.length
        buffer = ''
        line = curLine
        col = p - lineBegin + 1
        state = ParseState.HTML
        continue
      }
      buffer += input[p++]
    }
    if (state !== ParseState.HTML) {
      const t = state === ParseState.OUTPUT ? 'output' : 'tag'
      const str = buffer.length > 16 ? buffer.slice(0, 13) + '...' : buffer
      throw new TokenizationError(
        `${t} "${str}" not closed`,
        new Token(buffer, input, line, col, file)
      )
    }
    if (buffer) tokens.push(new HTMLToken(buffer, input, line, col, file))

    whiteSpaceCtrl(tokens, this.options)
    return tokens
  }
}

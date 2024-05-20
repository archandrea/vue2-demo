import { generate } from './generator.js'
import { parse } from './parser.js'

export function compile(html) {
  // console.log(generate(parse(html)).toString())
  // function anonymous() {
  //   with (this) {
  //     return __h__(
  //       'div',
  //       { attrs: { "id": ("app") } },
  //       __flatten__([" ",
  //         __h__(
  //           'h3',
  //           {},
  //           __flatten__([String((message))])
  //         ),
  //         " ",
  //         __h__(
  //           'div',
  //           { attrs: { "style": ("cursor:pointer;") } },
  //           __flatten__(["btn"])
  //         ),
  //         " ",
  //         (list).map(function (item, $index) {
  //           return __h__(
  //             'span',
  //             {},
  //             __flatten__([String((item))])
  //           )
  //         }),
  //         " ",
  //         __h__(
  //           'p',
  //           {},
  //           __flatten__([String((datas.name))])
  //         ),
  //         " "]
  //       ))
  //   }
  // }
  return generate(parse(html))
}
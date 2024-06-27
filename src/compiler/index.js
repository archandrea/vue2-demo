import { generate } from './generator.js'
import { parse } from './parser.js'

export function compile(html) {
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

  // parse transform html string to ast tree
  // generate transform ast to render function
  return generate(parse(html))
}
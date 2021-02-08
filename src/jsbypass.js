const acorn = require('acorn'),
  fetch = require('node-fetch'),
  walk = require('acorn-walk')

const Constants = require('./consts')

const CHAL_REGEX = /<script src="(\/[\w-]+.js)"><\/script>.*<script>window.onload=function\(\){(\w+)\(\);}<\/script>/i,
  HEX_REGEX = /^[0-9A-F]{32}$/gi
async function getChallengeScript() {
  let res = await fetch('https://lolz.guru')
  let text = await res.text()

  let matches = text.match(CHAL_REGEX)

  const [_, jsPath, fn] = matches

  let jsRes = await fetch(`https://lolz.guru${jsPath}`, {
    headers: {},
  })
  let js = await jsRes.text()
  return [js, fn]
}

module.exports = async function getProtectionCookie() {
  try {
    let [script, fn] = await getChallengeScript()
    let ast = acorn.parse(script, { ecmaVersion: 'latest' })

    walk.simple(ast, {
      BinaryExpression(node) {
        // string concatenation
        if (
          node.left.type === 'Literal' &&
          node.right.type === 'Literal' &&
          typeof node.left.value === 'string' &&
          typeof node.right.value === 'string'
        ) {
          node.type = 'Literal'
          node.value = node.left.value + node.right.value
        }
      },
    })
    let array = ast.body[0].declarations[0].init // ArrayExpression
    if (!array || array.type !== 'ArrayExpression')
      throw new Error(
        'Failed to solve JSChallenge, body el 0 is not of ArrayExpression'
      )
    let arr = array.elements.map((i) =>
      Buffer.from(i.value, 'base64').toString('utf8')
    )
    let id = arr.find(
      (i) => i && typeof i === 'string' && i.length === 32 && i.match(HEX_REGEX)
    )
    if (!id) throw new Error('Failed to solve JSChallenge, cookie not found')
    return id
  } catch (err) {
    console.error('Failed to solve JSChallenge, err:', err)
    process.exit(1)
  }
}

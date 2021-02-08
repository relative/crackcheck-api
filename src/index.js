const getProtectionCookie = require('./jsbypass'),
  express = require('express'),
  fetch = require('node-fetch').default
const app = express()

let df_id = ''

async function getLztCookie() {
  return `df_id=${df_id}; xf_market_search_url=%2Fmarket%2Fsteam%2F`
}

async function lookupSteamId(steamId) {
  const cookie = await getLztCookie()
  const headers = {
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    cookie,
    dnt: '1',
    pragma: 'no-cache',
    referer: 'https://lolz.guru/market/steam',
    'sec-ch-ua':
      '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
    'x-ajax-referer': 'https://lolz.guru/market/steam',
    'X-Requested-With': 'XMLHttpRequest',
  }

  const url = `https://lolz.guru/market/steam/?user_id=&category_id=1&pmin=&pmax=&title=${steamId}&_itemCount=10778&daybreak=&login=&rt=&medal_min=&medal_max=&eg=&reg=&reg_max=&recently_hours_min=&recently_hours_max=&limit=&faceit_lvl_min=&faceit_lvl_max=&rmin=&rmax=&inv_game=&inv_min=&inv_max=&csgo_profile_rank=&solommr_min=&solommr_max=&balance_min=&balance_max=&points_min=&points_max=&lmin=&lmax=&friend_min=&friend_max=&gmin=&gmax=&win_count_min=&win_count_max=&order_by=&_formSubmitted=true&countItemsOnly=true&_xfRequestUri=%2Fmarket%2Fsteam%2F&_xfNoRedirect=1&_xfResponseType=json`
  const res = await fetch(url, {
    headers: { ...headers },
  })
  const json = await res.json()
  return json.totalItems.toString()
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

app.get('/lookup', async (req, res) => {
  try {
    let soldTimes = 0
    try {
      soldTimes = await lookupSteamId(req.query.xuid)
    } catch (err) {
      df_id = await getProtectionCookie()
      soldTimes = await lookupSteamId(req.query.xuid)
    }

    return res.send(soldTimes)
  } catch (err) {
    console.error(`Failed in GET ${req.originalUrl}:`, err)
    return res.send('-1')
  }
})

app.listen(3000)

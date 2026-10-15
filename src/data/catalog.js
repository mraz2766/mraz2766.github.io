/**
 * 藏品资料 Catalog entries — keyed by photo slug (file name, lower-cased,
 * "_" → "-", no extension; e.g. R0003833.JPG → "r0003833").
 *
 * Every field is optional; a photo without an entry still shows up as
 * "No.xxx" with its series. Fill in as much or as little as you like:
 *
 *   name      中文名            '阿尼亚'
 *   nameEn    English name      'Anya Forger'
 *   franchise key of FRANCHISES 'spy-family'
 *   maker     品牌 / 系列线      'S.H.Figuarts'
 *   scale     比例              '1/12'
 *   year      入手年份          '2024'
 *   note      一句话备注        '...'
 *
 * The names below were pre-filled from the photos and may contain mistakes —
 * please check them. Maker / scale / year are left for you.
 */

export const FRANCHISES = {
  marvel: { en: 'Marvel', zh: '漫威' },
  dc: { en: 'DC', zh: 'DC' },
  'dragon-ball': { en: 'Dragon Ball', zh: '龙珠' },
  transformers: { en: 'Transformers', zh: '变形金刚' },
  'fighting-games': { en: 'Fighting Games', zh: '格斗游戏' },
  anime: { en: 'Anime', zh: '动画' },
  'toy-story': { en: 'Toy Story', zh: '玩具总动员' },
  disney: { en: 'Disney', zh: '迪士尼' },
  horror: { en: 'Horror', zh: '恐怖片' },
  mecha: { en: 'Mecha', zh: '机甲' },
  'the-boys': { en: 'The Boys', zh: '黑袍纠察队' },
  hellboy: { en: 'Hellboy', zh: '地狱男爵' },
  tokusatsu: { en: 'Tokusatsu', zh: '特摄' },
};

export const CATALOG = {
  // Dragon Ball 龙珠
  '022e2a10-920b-4c6c-be39-6e9212e4c093': { name: '孙悟空', nameEn: 'Son Goku (Super Saiyan)', franchise: 'dragon-ball' },
  r0003392: { name: '布罗利', nameEn: 'Broly', franchise: 'dragon-ball' },
  r0004526: { name: '布罗利', nameEn: 'Broly', franchise: 'dragon-ball' },
  r0004944: { name: '布罗利', nameEn: 'Broly', franchise: 'dragon-ball' },
  r0004919: { name: '魔人布欧', nameEn: 'Majin Buu', franchise: 'dragon-ball' },
  r0005366: { name: '孙悟空', nameEn: 'Son Goku (Super Saiyan)', franchise: 'dragon-ball' },
  r0005421: { name: '孙悟空', nameEn: 'Son Goku (Super Saiyan)', franchise: 'dragon-ball' },

  // Marvel 漫威
  '20210918-095509-01': { name: '格鲁特', nameEn: 'Groot', franchise: 'marvel' },
  'img-1114': { name: '蜘蛛侠', nameEn: 'Spider-Man', franchise: 'marvel' },
  'img-1499': { name: '蜘蛛侠', nameEn: 'Spider-Man', franchise: 'marvel' },
  'img-1965': { name: '月光骑士', nameEn: 'Moon Knight', franchise: 'marvel' },
  r0001113: { name: '蜘蛛格温', nameEn: 'Spider-Gwen', franchise: 'marvel' },
  r0001351: { name: '月光骑士', nameEn: 'Mr. Knight', franchise: 'marvel' },
  r0001360: { name: '犀牛人', nameEn: 'Rhino', franchise: 'marvel' },
  r0001375: { name: '蜘蛛侠', nameEn: 'Spider-Man', franchise: 'marvel' },
  r0001408: { name: '美国队长与红骷髅', nameEn: 'Captain America & Red Skull', franchise: 'marvel' },
  r0001806: { name: '蜘蛛侠', nameEn: 'Spider-Man', franchise: 'marvel' },
  r0001808: { name: '蜘蛛侠', nameEn: 'Spider-Man', franchise: 'marvel' },
  r0001939: { name: '黑色战衣蜘蛛侠', nameEn: 'Spider-Man (Black Suit)', franchise: 'marvel' },
  r0001944: { name: '黑色战衣蜘蛛侠', nameEn: 'Spider-Man (Black Suit)', franchise: 'marvel' },
  r0001952: { name: '黑色战衣蜘蛛侠', nameEn: 'Spider-Man (Black Suit)', franchise: 'marvel' },
  r0001953: { name: '黑色战衣蜘蛛侠', nameEn: 'Spider-Man (Black Suit)', franchise: 'marvel' },
  r0001955: { name: '黑色战衣蜘蛛侠', nameEn: 'Spider-Man (Black Suit)', franchise: 'marvel' },
  r0003020: { name: '暗影蜘蛛侠', nameEn: 'Spider-Man Noir', franchise: 'marvel' },
  r0003347: { name: '屠杀', nameEn: 'Carnage', franchise: 'marvel' },
  r0003350: { name: '毒液与屠杀', nameEn: 'Venom & Carnage', franchise: 'marvel' },

  // DC
  'img-1130': { name: '蝙蝠侠与超人', nameEn: 'Batman & Superman', franchise: 'dc' },
  r0000279: { name: '毒藤女', nameEn: 'Poison Ivy', franchise: 'dc' },
  r0000778: { name: '大笑之蝠', nameEn: 'The Batman Who Laughs', franchise: 'dc' },
  r0003352: { name: '超人', nameEn: 'Superman', franchise: 'dc' },
  r0003845: { name: '蝙蝠侠', nameEn: 'Batman', franchise: 'dc' },

  // Transformers 变形金刚
  r0001036: { name: '钢索', nameEn: 'Grimlock', franchise: 'transformers' },
  r0001124: { name: '擎天柱', nameEn: 'Optimus Prime', franchise: 'transformers' },
  r0001374: { name: '擎天柱', nameEn: 'Optimus Prime', franchise: 'transformers' },
  r0002672: { name: '擎天柱', nameEn: 'Optimus Prime', franchise: 'transformers' },
  r0003453: { name: '红蜘蛛', nameEn: 'Starscream', franchise: 'transformers' },
  r0003457: { name: '红蜘蛛', nameEn: 'Starscream', franchise: 'transformers' },

  // Fighting games 格斗游戏
  'img-1673': { name: '爬虫', nameEn: 'Reptile', franchise: 'fighting-games' },
  r0000215: { name: '布鲁·玛丽', nameEn: 'Blue Mary', franchise: 'fighting-games' },
  r0001353: { name: '布鲁·玛丽', nameEn: 'Blue Mary', franchise: 'fighting-games' },
  r0001532: { name: '肯', nameEn: 'Ken', franchise: 'fighting-games' },
  r0001815: { name: '特瑞·博加德', nameEn: 'Terry Bogard', franchise: 'fighting-games' },
  r0001823: { name: '特瑞·博加德', nameEn: 'Terry Bogard', franchise: 'fighting-games' },
  r0001830: { name: '特瑞·博加德', nameEn: 'Terry Bogard', franchise: 'fighting-games' },
  r0001870: { name: '布鲁·玛丽与特瑞', nameEn: 'Blue Mary & Terry Bogard', franchise: 'fighting-games' },
  r0005418: { name: '沙加特', nameEn: 'Sagat', franchise: 'fighting-games' },

  // Anime 动画
  'fullsizerender-vsco': { name: '明日香', nameEn: 'Asuka Langley', franchise: 'anime' },
  r0000587: { name: '明日香', nameEn: 'Asuka Langley', franchise: 'anime' },
  r0000701: { name: '灶门祢豆子', nameEn: 'Nezuko Kamado', franchise: 'anime' },
  r0003833: { name: '阿尼亚', nameEn: 'Anya Forger', franchise: 'anime' },
  r0003837: { name: '阿尼亚与祢豆子', nameEn: 'Anya & Nezuko', franchise: 'anime' },
  r0005028: { name: '小杰与奇犽', nameEn: 'Gon & Killua', franchise: 'anime' },

  // Mecha 机甲
  r0001311: { name: '高达 RX-78-2', nameEn: 'RX-78-2 Gundam', franchise: 'mecha' },
  r0003420: { name: '魔神 Z', nameEn: 'Mazinger Z', franchise: 'mecha' },

  // Tokusatsu 特摄
  r0001880: { name: '机器人小子', nameEn: 'Robocon', franchise: 'tokusatsu' },
  r0001882: { name: '机器人小子', nameEn: 'Robocon', franchise: 'tokusatsu' },
  r0001883: { name: '机器人小子', nameEn: 'Robocon', franchise: 'tokusatsu' },
  r0001884: { name: '机器人小子', nameEn: 'Robocon', franchise: 'tokusatsu' },
  r0001986: { name: '机器人小子', nameEn: 'Robocon', franchise: 'tokusatsu' },
  r0001987: { name: '机器人小子', nameEn: 'Robocon', franchise: 'tokusatsu' },

  // Others 其他
  'img-2512': { name: '胡迪与巴斯光年', nameEn: 'Woody & Buzz Lightyear', franchise: 'toy-story' },
  r0002617: { name: '米奇一家', nameEn: 'Mickey, Donald & Goofy', franchise: 'disney' },
  r0000277: { name: '竖锯玩偶', nameEn: 'Billy the Puppet', franchise: 'horror' },
  r0003784: { name: '潘尼怀斯', nameEn: 'Pennywise', franchise: 'horror' },
  r0002247: { name: '祖国人', nameEn: 'Homelander', franchise: 'the-boys' },
  r0003462: { name: '地狱男爵', nameEn: 'Hellboy', franchise: 'hellboy' },
};

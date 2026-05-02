import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const TITLES = {
  "akagi-shizen-no-ie":       "【心霊】赤城少年自然の家｜林間学校で子供たちが見た影の記録と怪現象",
  "akigase-park":             "【心霊】秋ヶ瀬公園｜荒川沿いの公園で夜に目撃される女の霊の真相",
  "aoi-yane-no-ie":           "【心霊】青い屋根の家｜入居者が次々消えた岩見沢の廃屋の正体",
  "aokigahara":               "【心霊】青木ヶ原樹海｜行方不明者が絶えない自殺の名所と異変の真相",
  "ashizuri-misaki":          "【心霊】足摺岬｜身投げが絶えない四国最南端の岬で目撃される霊の正体",
  "banba-ana":                "【心霊】バンバ穴｜老婆が子を捨てたとされる富士山麓の縦穴の正体",
  "business-hotel-tropical":  "【心霊】ビジネスホテルトロピカル｜「出るから泊まれ」と言われ廃業した新横浜の廃ホテルの真相",
  "chikyu-misaki":            "【心霊】地球岬｜断崖から消えた者が目撃される室蘭の岬の異変",
  "chitose-ro":               "【心霊】千歳楼｜白骨死体が発見された廃旅館と繰り返す不審火の真相",
  "crystal-house":            "【心霊】クリスタルハウス｜誰も建てた理由を知らないガラスの廃墟で起きた異変の記録",
  "daisenji-amusement-park":  "【心霊】大川寺遊園地｜廃観覧車から聞こえる子供の声と目撃される霊の正体",
  "doryodo-ato":              "【心霊】道了堂跡｜廃寺跡で目撃される白装束の霊と死亡事故の記録",
  "egota-no-mori-park":       "【心霊】江古田の森公園｜防空壕跡の公園で夜に聞こえる声の正体",
  "hachioji-castle-ruins":    "【心霊】八王子城跡｜落城で姫君たちが消えた滝と心霊写真の異変",
  "hanetaki-bridge":          "【心霊】はねたき橋｜ライトアップされた橋で目撃される人影の正体",
  "heiwa-no-taki":            "【心霊】平和の滝｜地元住民が近づかない滝から聞こえる声の真相",
  "hotel-celine":             "【心霊】ホテルセリーヌ｜廃墟の壁に描かれた妊婦の絵と聞こえる泣き声の真相",
  "hotel-katsugyo":           "【心霊】ホテル活魚｜殺人事件の現場となった千葉の廃ラブホテルの真相",
  "hotel-lisbon":             "【心霊】ホテルリスボン｜44年間幽霊が出た三重の廃ラブホテルの正体",
  "hotel-queen":              "【心霊】ホテルクイン｜客室ドアが内側から施錠されたまま発見された廃ラブホテルの異変",
  "hotel-skylove":            "【心霊】ホテルすかいらぶ｜廃ラブホテルで心霊写真に写る女の霊の真相",
  "hotel-suzukigaike":        "【心霊】ホテルすずきヶ池｜迷路のような廃ホテルで消えた宿泊客の異変",
  "hototogisu-ryokan":        "【心霊】ほととぎす旅館｜大阪の山中で廃墟化した旅館に残る霊気と目撃記録",
  "innai-ginzan":             "【心霊】院内銀山｜廃銀山で多発した死亡事故と今も現れる霊の正体",
  "inokashira-park":          "【心霊】井の頭公園｜弁財天の呪いで次々消えるカップルと水中の異変",
  "inuyama-tengu-jinja":      "【心霊】犬山天狗神社｜山岳信仰の地で目撃される死亡事故と天狗の正体",
  "ioto-tokyo":               "【心霊】硫黄島｜2万人が戦死した島で自衛隊員が目撃する霊の正体",
  "irei-no-mori":             "【心霊】慰霊の森｜162人死亡の墜落跡地で聞こえる声と異変の真相",
  "jike-tunnel":              "【心霊】寺家トンネル｜手掘り100年の廃トンネルで目撃される人影の正体",
  "jommon-tunnel":            "【心霊】常紋トンネル｜工事で100人以上が死んだ北海道の鉄道トンネルの真相",
  "jomon-tunnel":             "【心霊】常紋トンネル｜タコ部屋労働で死んだ者の霊が出る北海道の廃線路",
  "junsaike-park":            "【心霊】じゅんさい池公園｜昼は穏やかな公園で夜に目撃される女の霊の真相",
  "jusanbutsu":               "【心霊】十三佛｜福岡の山奥の洞窟で目撃される霊と聞こえる声の正体",
  "kaimon-tunnel":            "【心霊】開聞トンネル｜照明なしの鹿児島廃トンネルで撮れる心霊写真の真相",
  "kamiya-park":              "【心霊】北区立神谷公園｜300人が仮埋葬された東京の公園で夜に聞こえる声の記録",
  "kamuikotan-tunnel":        "【心霊】神居古潭トンネル｜アイヌが禁じた霊域で目撃される異変の真相",
  "kejonuma-leisure-land":    "【心霊】化女沼レジャーランド｜廃観覧車が回る遊園地跡で聞こえる声の真相",
  "kohoku-bridge":            "【心霊】江北橋｜自殺者が絶えない東京の橋で目撃される投身者の霊の真相",
  "kubikari-shrine":          "【心霊】首狩神社｜丑の刻参りが絶えない愛知の山奥の禁忌神社の真相",
  "kyu-dogakuji-tunnel":      "【心霊】旧童学寺トンネル｜封鎖された徳島の廃トンネルで心霊写真が撮れる理由",
  "kyu-kobetsuzawa-tunnel":   "【心霊】旧小別沢トンネル｜住民が手掘りした廃トンネルで消えた人の正体",
  "kyu-komine-tunnel":        "【心霊】旧小峰トンネル｜八王子の廃トンネルで繰り返される死亡事故の真相",
  "kyu-zenba-tunnel":         "【心霊】旧善波トンネル｜17歳少年の死亡事故が起きた神奈川の峠の異変",
  "love-hotel-cosmo":         "【心霊】ラブホテルコスモ｜チェックアウトしないまま消えた宿泊客と子供の声の正体",
  "mary-mansion":             "【心霊】メリーさんの館｜六甲山に現れる洋館で目撃される首なし霊の正体",
  "masakado-kubizuka":        "【心霊】平将門の首塚｜大手町で1000年以上怨念を放つ首塚の真相と異変",
  "midoriyama-pass":          "【心霊】緑山峠｜TBS隣の廃道で目撃される異形の影と心霊写真の記録",
  "minamihata-dam":           "【心霊】南畑ダム｜深夜のトイレ窓から覗き込んだ女の霊の正体と異変",
  "misato-blue-house":        "【心霊】三郷の青い家｜墓地に隣接した廃屋で消えた住人の正体と異変",
  "mitsui-bridge":            "【心霊】三井大橋｜津久井湖の橋で繰り返される投身と目撃される霊の真相",
  "nanasato-satsujin-no-mori":"【心霊】七里殺人の森｜幕末の大量死亡の記憶が残る埼玉の雑木林の異変",
  "naruto-skyline":           "【心霊】鳴門スカイライン｜絶景の展望台を持つ廃ホテルで聞こえる声と目撃される霊の正体",
  "nashinoki-zuido":          "【心霊】梨の木隧道｜完全封鎖の大阪の廃トンネルで心霊写真が撮れる理由",
  "niigata-white-house":      "【心霊】ホワイトハウス｜地図に載らない新潟の山奥の廃屋で毎晩灯りが灯る理由",
  "niji-no-ohashi":           "【心霊】虹の大橋｜湖面100mの高さで自殺が絶えない神奈川の橋の異変",
  "ninja-mura":               "【心霊】忍者村｜理由なく突然廃業した福岡のテーマパーク跡で目撃される影と声の記録",
  "nishioka-suigenchi":       "【心霊】西岡水源池｜昼は桜の名所で夜に目撃される女の霊と異変の真相",
  "oga-prince-hotel":         "【心霊】男鹿プリンスホテル｜日本海の廃ホテルで撮れる心霊写真の真相",
  "okutama-ropeway":          "【心霊】奥多摩湖ロープウェイ｜開業わずか4年で廃業したロープウェイに残る霊の記録",
  "old-fukiage-tunnel":       "【心霊】旧吹上トンネル｜死亡事故が重なる青梅の廃トンネルで撮れる心霊写真の真相",
  "old-inunaki-tunnel":       "【心霊】旧犬鳴トンネル｜焼殺事件現場の封鎖トンネルで消えた訪問者の真相",
  "old-nogi-hospital":        "【心霊】旧野木病院｜廃精神科病院で目撃される白装束の集団と消えた侵入者の記録",
  "omitama-ogawa-noubyouin":  "【心霊】小美玉小川脳病院｜廃精神病院で目撃される患者の霊と異変の記録",
  "orange-house":             "【心霊】オレンジハウス｜解体業者が次々と怪我した千葉の廃屋の正体",
  "osaka-toge":               "【心霊】大坂峠｜義経伝説の県境峠道で目撃される武将の霊の正体",
  "osorezan":                 "【心霊】恐山｜死者が戻るとされる日本三大霊場で実際に目撃された霊の記録",
  "otamoi-coast":             "【心霊】オタモイ海岸｜火事で消えた断崖の遊園地跡で目撃される霊の正体",
  "oukasou-ryou":             "【心霊】鶯花荘寮｜廃温泉旅館の寮で繰り返す不審火と消えた従業員の真相",
  "oyama-kaizuka":            "【心霊】大山貝塚｜命を保証しないと警告する沖縄の禁足地と目撃記録",
  "ozako-tunnel":             "【心霊】小迫トンネル｜明治以前に手掘りされた大分の廃トンネルで目撃される異変",
  "purumeria":                "【心霊】海風洋館プルーメリア｜整形手術の失敗で死亡した女性の霊が出ると言われる廃ホテルの記録",
  "samukawa-shuraku":         "【心霊】寒川集落｜廃村から消えた住人が目撃される宮崎の山奥の異変",
  "sanshuen-hotel":           "【心霊】三州園ホテル｜死亡事故と火災が重なる愛知の廃ホテルの呪いの真相",
  "sendagaya-tunnel":         "【心霊】千駄ヶ谷トンネル｜墓地を壊して造った現役トンネルで今も目撃される霊の正体",
  "sennichi-department-fire": "【心霊】千日デパート火災跡｜118名が死亡した1972年大阪最悪の火災現場の真相",
  "shijushida-dam":           "【心霊】四十四田ダム｜観光地のダムで警備員だけが目撃する女の霊の真相",
  "shimoda-fujiya-hotel":     "【心霊】下田富士屋ホテル｜廃ホテルの特定の部屋から聞こえる女の声の正体",
  "shinai-hospital":          "【心霊】信愛病院｜熊本の廃病院で行方不明になった侵入者と霊の目撃記録",
  "shinmisato-tunnel":        "【心霊】采女ガード｜市の公報が「霊が出没する」と警告したトンネルの真相",
  "shirataka-okami":          "【心霊】白高大神｜廃神社に残る宗教団体の痕跡と目撃される女霊の正体",
  "shitodo-no-iwaya":         "【心霊】しとどの巌｜首なし地蔵が並ぶ洞窟で目撃される霊の正体",
  "skyrest-new-muroto":       "【心霊】スカイレストニュー室戸｜廃展望レストランで撮れる心霊写真の真相",
  "sss-utaki":                "【心霊】ＳＳＳ（アフシマノ嶽）｜地元が「命の保証ができない」と言う沖縄の御嶽の異変",
  "subana-tunnel":            "【心霊】須花トンネル｜3世代並ぶ峠道で目撃される人影と心霊写真の記録",
  "sugisawa-mura":            "【心霊】杉沢村｜村人が全員惨殺されたとされる青森の廃村伝説の真相",
  "taki-fudo":                "【心霊】滝不動｜刑場の記憶が残る霊場で目撃される母子の霊と異変の記録",
  "takube-pond":              "【心霊】宅部池｜少年の溺死事故から90年後も目撃される霊の正体",
  "tojinbo":                  "【心霊】東尋坊｜日本三大自殺名所の断崖で目撃される霊と心霊写真の真相",
  "tosho-ji-ruins":           "【心霊】腹切りやぐら｜北条氏が集団自刃した鎌倉の史跡で聞こえる声の異変",
  "totoro-house":             "【心霊】トトロの家｜田んぼの廃屋で聞こえる雄叫びと消えた少女の異変",
  "tougoku-yama":             "【心霊】東谷山｜名古屋最高峰の山頂で目撃される霊と藁人形の異変",
  "tsugane-otoshi-falls":     "【心霊】つがね落しの滝｜長崎の景勝地で目撃される人影と滝つぼの異変",
  "uchikoshi-bridge":         "【心霊】打越橋｜横浜の朱色アーチ橋で繰り返される投身と目撃される霊の記録",
  "umezawa-zuido":            "【心霊】海沢隧道｜手掘り岩盤むき出しの奥多摩廃トンネルで目撃される異変",
  "ushikubi-tunnel":          "【心霊】牛首トンネル｜牛の首が転がるとされる石川の廃トンネルの正体",
  "yabitsu-pass":             "【心霊】ヤビツ峠｜深夜に走ると助手席に乗ってくる霊がいるとされる神奈川の峠",
  "yami-hotel-chagall":       "【心霊】廃ホテルシャガール｜廃業後に事件が重なった徳島のラブホテルの真相",
  "yawatanoyabushirazu":      "【心霊】八幡の藪知らず｜入った者が行方不明になる千葉の禁足地の真相",
  "yokomuki-onsen-lodge":     "【心霊】横向温泉ロッジ｜40年放置の福島の廃ホテルで目撃される異変の正体",
  "yubetsu-coal-mine":        "【心霊】雄別炭鉱｜1万人が突然消えた北海道の廃炭鉱で相次ぐ心霊写真の真相",
};

const ARTICLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "articles");

let updated = 0;
let skipped = 0;

for (const [slug, newTitle] of Object.entries(TITLES)) {
  const filePath = join(ARTICLES_DIR, slug, "index.md");
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    console.warn(`SKIP (not found): ${slug}`);
    skipped++;
    continue;
  }

  const newContent = content.replace(
    /^title:[ \t]*"[^"]*"/m,
    `title: "${newTitle}"`
  );

  if (newContent === content) {
    console.warn(`SKIP (no change): ${slug}`);
    skipped++;
    continue;
  }

  writeFileSync(filePath, newContent, "utf-8");
  console.log(`OK: ${slug}`);
  updated++;
}

console.log(`\n完了: ${updated}件更新, ${skipped}件スキップ`);

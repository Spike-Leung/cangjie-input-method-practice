# 倉頡練習（Cangjie Practice）

一個用於學習和練習[倉頡輸入法](https://zh.wikipedia.org/wiki/倉頡輸入法)的 Web App。練習字母鍵位、記憶輔助字型、練習拆碼。

> 本項目通過 vibe coding 方式構建，用於練習 agent 輔助編碼，同時為倉頡輸入法學習者提供一個便捷的練習工具。

---

## 為什麼學倉頡？

- **形碼輸入。** 見字拆碼，不依賴發音。無論普通話、粵語、臺語，乃至日本漢字，均可直接輸入。繁簡中文通用。
- **重碼率極低。** 最長五碼，單字重碼極少。熟練者可達每分鐘百字以上，無需看螢幕選字，實現真正盲打。
- **一勞永逸。** 規則自 1980 年代至今穩定不變。一旦掌握，終身受用 — 輸入法框架會過時，拆碼邏輯永遠有效。

---

## 學習資源

- **[Wikibooks: 倉頡輸入法](https://zh.wikibooks.org/wiki/倉頡輸入法)** — 最完整的倉頡教程，含字根表、拆碼規則、例外說明。
- **[維基百科: 倉頡輸入法](https://zh.wikipedia.org/wiki/倉頡輸入法)** — 歷史背景、版本差異、字根列表。
- **[倉頡之友·馬來西亞](https://www.chinesecj.com/)** — 倉頡五代輸入法下載、編碼字典、學習工具。
- **[Wikipedia: Cangjie input method](https://en.wikipedia.org/wiki/Cangjie_input_method)** — 英文版綜述，附鍵盤佈局和拆碼規則。

---

## 功能

三個練習模式：

| 模式 | 路徑 | 練習內容 |
|------|------|---------|
| **字母鍵位練習** | `/letter-practice` | 24 個倉頡字母 + X/Z 特殊鍵位（共 26 鍵） |
| **輔助字型練習** | `/shape-practice` | 741 個輔助字形（含 X 難鍵 18 個），加權錯誤複習 |
| **倉頡拆碼練習** | `/code-practice` | 逐步拆解 6000 個常用字，按使用頻率排序 |

其他功能：

- **深色／淺色主題** — ☾/☀ 切換按鈕，localStorage 持久化。深色模式符合 APCA 對比度標準，適合長時間閱讀。
- **錯題收集** — 連續按錯 2 次自動收集到錯題集，可在編輯器中檢視或刪除。支援錯題模式單獨練習。
- **移動端支援** — 自適應佈局，最低支援 375px 螢幕。鍵盤按鍵、碼位槽、字型大小均等比例縮放。
- **提示同步** — 三個頁面共用提示開關狀態（localStorage）。Space 鍵隨時切換。
- **鍵盤視覺化** — 按鍵分色標記類別（哲理、筆畫、人體、字形），提示碼位序號疊加，正確／錯誤高亮。
- **漢典連結** — 每個字連結到 [zdic.net](https://www.zdic.net/) 和 [chidic.eduhk.hk](https://chidic.eduhk.hk/)，可查詢字源和筆順。
- **複製文字** — 一鍵複製當前候選字到剪貼板。

---

## 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（熱更新）
npm run dev

# 建構生產版本（型別檢查 + vite 構建）
npm run build

# 預覽生產版本
npm run preview
```

開發伺服器預設在 `http://localhost:5173`。

---

## 技術棧

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)（strict 模式）
- [Vite 6](https://vitejs.dev/)， `assetsInlineLimit: 0`（保持 SVG 外部引用）
- [React Router v6](https://reactrouter.com/)
- 純 CSS，使用 [邏輯屬性](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)

無 CSS 框架，無組件庫。

---

## 資料來源

- **輔助字形 SVG** — 741 張圖片來自 Wikimedia Commons（[Category: Cangjie input method](https://commons.wikimedia.org/wiki/Category:Cangjie_input_method)），含 X（難）鍵 18 張
- **拆碼字表** — 6000 個常用字編碼來自 [RIME 倉頡五代字典](https://github.com/rime/rime-cangjie)，合併 [Jun Da 語料字頻](https://lingua.mtsu.edu/chinese-computing/statistics/)、[知乎語料字頻](https://github.com/forfudan/chinese-characters-frequency) 及繁簡映射後按日常使用頻率排序
- 下載腳本（`download_svgs.py`、`download_cangjie.py`）在專案根目錄。

---

## 致謝

- **朱邦復先生** — 倉頡輸入法發明人，為普及中文電腦放棄專利
- **Wikimedia Commons 貢獻者** — 輔助字形 SVG 圖片
- **RIME 項目** — 開源倉頡五代碼表

---

## 許可證

本項目代碼採用 [GNU Affero General Public License v3.0](LICENSE) 授權。

第三方資源：
- `src/data/cangjieChars.ts` 衍生自 RIME 倉頡五代字典（LGPL-3.0）
- `public/data/` 中的 SVG 圖片來自 Wikimedia Commons（各自保留原始 Creative Commons 授權）

---

## 免責聲明

本項目僅供個人學習倉頡輸入法使用。項目中的字形圖片來自 Wikimedia Commons（各圖片保留其原始授權），字表數據衍生自 RIME 倉頡五代字典。本項目與朱邦復先生、RIME 項目及 Wikimedia 基金會無任何關聯。

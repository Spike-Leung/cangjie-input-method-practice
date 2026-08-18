# 倉頡練習（Cangjie Practice）

一個用於學習和練習 [倉頡輸入法](https://zh.wikipedia.org/wiki/倉頡輸入法) 的 Web App。練習字母鍵位、記憶輔助字型、練習拆碼。

> 本項目通過 vibe coding 方式構建，用於練習 agent 輔助編碼，同時為倉頡輸入法學習者提供一個便捷的練習工具。

---

## 為什麼學倉頡？

- 形碼輸入，見字拆碼，不依賴發音。繁簡中文通用。
- 重碼率低，最長五碼，單字重碼極少。
- 拆字比較有趣。

---

## 學習資源

- [Wikibooks: 倉頡輸入法](https://zh.wikibooks.org/wiki/倉頡輸入法)
- [第五代倉頡輸入法手冊](https://www.chinesecj.com/5cjbook/)
---

## 功能

三個練習模式：

| 模式             | 路徑               | 練習內容                 |
|------------------|--------------------|--------------------------|
| **字母鍵位練習** | `/letter-practice` | 熟悉倉頡字母和鍵位       |
| **輔助字型練習** | `/shape-practice`  | 熟悉众多的輔助字型       |
| **倉頡拆碼練習** | `/code-practice`   | 拆解常用字，熟悉拆字規則 |


其他功能：

- 「字母鍵位練習」和「輔助字型練習」可以限定練習範圍，去練習自己容易出錯的部分。
- 「倉頡拆碼練習」中的每個字連結到 [漢典](https://www.zdic.net/)，可查詢字源和筆順。

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

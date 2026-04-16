# instruction_add_deck_to_app.md

## เป้าหมาย
เพิ่มสำรับใหม่ **The Archetype: Asian Vogue Tarot** เข้าไปในแอพที่มีอยู่แล้ว โดยตอนนี้แอพมีสำรับเดิมอยู่ **1 deck** และสำรับนี้จะเป็น **deck ที่ 2**

การออกแบบต้องรองรับการเพิ่ม deck อื่น ๆ ในอนาคตได้ง่าย โดย **ห้าม hardcode logic สำหรับ 2 deck เท่านั้น**

---

## หลักการสถาปัตยกรรม
ปรับโครงสร้างแอพจากการรองรับสำรับเดียว ไปเป็น **multi-deck architecture** ดังนี้

1. ใช้แนวคิด **deck registry** เป็นศูนย์กลาง
2. แยกข้อมูลแต่ละสำรับออกเป็นโฟลเดอร์ของตัวเอง
3. ให้ทุกหน้าที่เกี่ยวกับไพ่โหลดข้อมูลผ่าน `deckId` หรือ `slug`
4. ห้ามผูกชื่อไฟล์หรือ path แบบตายตัวกับสำรับแรกเพียงสำรับเดียว
5. ออกแบบให้เพิ่ม deck ใหม่ในอนาคตได้โดยเพียง:
   - เพิ่มโฟลเดอร์ deck
   - เพิ่ม entry ใน registry
   - ไม่ต้องแก้ logic หลักจำนวนมาก

---

## โครงสร้างไฟล์ที่ต้องการ
สมมติใช้โฟลเดอร์ข้อมูลแบบนี้

```txt
app/
  data/
    decks/
      deck_001_dhamma_path_tarot/
        manifest.json
        cards.json
        meanings.json
        spreads.json
      deck_002_asian_vogue_tarot/
        manifest.json
        cards.json
        meanings.json
        spreads.json
        lookbook.json
        guidebook.json
    deck-registry.json
```

ถ้าโปรเจกต์เดิมมี path อื่น ให้ปรับตามของจริง แต่ต้องคงแนวคิดนี้ไว้

---

## ไฟล์ของ deck ใหม่
ใช้ข้อมูลจากไฟล์ที่เตรียมไว้แล้วของสำรับที่ 2:

- `manifest.json`
- `cards.json`
- `meanings.json`
- `spreads.json`
- `lookbook.json`
- `guidebook.json`

> หมายเหตุ: สำรับเดิมอาจมีเพียง 4 ไฟล์ แต่สำรับใหม่มีไฟล์เสริมเพิ่มขึ้น จึงต้องออกแบบ loader ให้รองรับ **optional files** เช่น `lookbook.json` และ `guidebook.json`

---

## งานที่ต้องทำ

### 1) สร้างโฟลเดอร์ของ deck ใหม่
สร้างโฟลเดอร์สำหรับสำรับใหม่ เช่น

```txt
app/data/decks/deck_002_asian_vogue_tarot/
```

แล้ววางไฟล์ JSON ของสำรับใหม่ทั้งหมดลงไป

---

### 2) สร้างหรือปรับ deck registry
สร้างไฟล์ `deck-registry.json` หรือถ้ามีอยู่แล้วให้ปรับให้รองรับหลายสำรับ เช่น

```json
[
  {
    "deck_id": "deck_001_dhamma_path_tarot",
    "slug": "dhamma-path-tarot",
    "title": {
      "th": "ไพ่พุทธธรรมทาโรต์",
      "en": "The Dhamma Path Tarot"
    },
    "path": "app/data/decks/deck_001_dhamma_path_tarot"
  },
  {
    "deck_id": "deck_002_asian_vogue_tarot",
    "slug": "asian-vogue-tarot",
    "title": {
      "th": "The Archetype: Asian Vogue Tarot",
      "en": "The Archetype: Asian Vogue Tarot"
    },
    "path": "app/data/decks/deck_002_asian_vogue_tarot"
  }
]
```

ถ้า registry เดิมเป็น TypeScript/JavaScript object ก็ใช้รูปแบบนั้นได้ แต่ต้องทำให้เพิ่ม deck ใหม่ง่ายในอนาคต

---

### 3) สร้าง deck loader กลาง
สร้าง utility กลาง เช่น

```txt
app/lib/deckLoader.ts
```

หน้าที่ของมัน:
- โหลด registry ทั้งหมด
- หา deck จาก `deck_id` หรือ `slug`
- โหลดไฟล์ `manifest.json`, `cards.json`, `meanings.json`, `spreads.json`
- โหลด `lookbook.json` และ `guidebook.json` แบบ optional
- รวมข้อมูลเป็น object เดียวที่หน้าแอพเรียกใช้สะดวก

ตัวอย่าง interface ที่ต้องการ:

```ts
export type DeckBundle = {
  manifest: any;
  cards: any[];
  meanings: Record<string, any>;
  spreads: any;
  lookbook?: any;
  guidebook?: any;
};

export async function getAllDecks(): Promise<any[]> {}
export async function getDeckById(deckId: string): Promise<DeckBundle> {}
export async function getDeckBySlug(slug: string): Promise<DeckBundle> {}
```

ข้อสำคัญ:
- ถ้าไฟล์ optional ไม่มี ให้คืนค่า `undefined` และแอพต้องไม่พัง
- ถ้า deck ไม่พบ ให้ throw error ที่อ่านง่าย

---

### 4) ปรับหน้ารายการสำรับ (Deck Selection / Library)
ถ้าแอพเดิมมีหน้าหลักที่แสดงสำรับ ให้เปลี่ยนจาก single deck เป็น map จาก registry

สิ่งที่ต้องแสดงอย่างน้อย:
- ชื่อสำรับ
- subtitle
- จำนวนไพ่
- ภาษา
- ปกสำรับ (ถ้ามี)
- ปุ่มเข้าไปดูรายละเอียดหรือเริ่มเปิดไพ่

ถ้ายังไม่มีหน้ารวมสำรับ ให้สร้างหน้าใหม่ เช่น

```txt
/decks
```

และให้สามารถกดเข้าสำรับแต่ละชุดได้ด้วย `slug`

ตัวอย่าง route:

```txt
/decks/dhamma-path-tarot
/decks/asian-vogue-tarot
```

---

### 5) ปรับ route ของหน้ารายละเอียดสำรับ
ทุกหน้าที่เกี่ยวกับไพ่ควรอิงกับ `deck slug` หรือ `deck_id` เช่น

```txt
/decks/[slug]
/decks/[slug]/cards
/decks/[slug]/cards/[cardId]
/decks/[slug]/read
/decks/[slug]/spreads
```

ห้ามใช้ route ที่ผูกกับสำรับเดิมเพียงสำรับเดียว เช่น:
- `/cards/F00`
- `/spread`
- `/reading`

เพราะจะชนกันเมื่อมีหลายสำรับ

---

### 6) ปรับ card detail page
หน้ารายละเอียดไพ่ต้องโหลดจาก
- `deck slug`
- `card_id`

และ merge ข้อมูลจาก:
- `cards.json`
- `meanings.json`
- `lookbook.json` (ถ้ามี)
- `guidebook.json` (ถ้ามี)

สิ่งที่ควรแสดงแบบยืดหยุ่น:

#### ส่วนหลัก
- image
- name (th/en)
- number / roman
- arcana

#### ส่วน meaning
- archetype
- symbolism
- upright
- reversed
- oracle_message
- fashion_caption

#### ส่วน lookbook (ถ้ามี)
- model_profile
- signature vibe
- editorial note

#### ส่วน guidebook (ถ้ามี)
- interpretive note
- reading focus

หากบาง deck ไม่มี field บางชุด ให้ซ่อน section นั้นไปอย่างสุภาพ

---

### 7) ปรับ logic การสุ่มไพ่ / เปิดไพ่
ระบบเปิดไพ่ต้องเลือกจากไพ่ในสำรับที่ผู้ใช้กำลังเปิดอยู่เท่านั้น

ข้อกำหนด:
- รับ `deckId` หรือ `slug` ก่อนสุ่ม
- ใช้ `cards.json` ของ deck นั้นเท่านั้น
- spread ที่ใช้ต้องมาจาก `spreads.json` ของ deck นั้น
- ห้ามดึงไพ่ข้ามสำรับโดยไม่ได้ตั้งใจ

ตัวอย่าง function:

```ts
export function drawRandomCards(cards: any[], count: number) {}
export async function drawFromDeck(deckId: string, count: number) {}
```

---

### 8) ปรับ spread system ให้ผูกกับ deck
สำรับแต่ละชุดอาจมี spread ไม่เหมือนกัน

ดังนั้น:
- หน้า spread ต้องโหลดจาก `deck.spreads`
- หาก deck ไหนไม่มี spread เฉพาะ ให้ fallback ไปยัง default spread ของระบบได้
- แต่สำรับใหม่ต้องใช้ spread ของตัวเองก่อน

---

### 9) รองรับ optional content layers
แอพต้องไม่ assume ว่าทุก deck มีข้อมูลเหมือนกัน 100%

รองรับอย่างน้อย 3 ระดับ:

#### ระดับขั้นต่ำ
- manifest
- cards
- meanings
- spreads

#### ระดับเสริม
- lookbook
- guidebook

#### ระดับอนาคต
อาจมีเพิ่ม เช่น
- `backstage.json`
- `fragrance.json`
- `audio.json`
- `rituals.json`

ดังนั้น loader และ UI ควรออกแบบให้ “เช็กก่อนใช้” เสมอ

---

### 10) สร้าง type กลางของระบบ deck
หากโปรเจกต์ใช้ TypeScript ให้สร้าง type กลาง เช่น

```txt
app/types/deck.ts
```

ตัวอย่าง:

```ts
export type BilingualText = {
  th?: string;
  en?: string;
};

export type ModelProfile = {
  model_name?: BilingualText;
  model_stats?: {
    height_cm?: number;
    chest_in?: number;
    waist_in?: number;
    shoe_eu?: number;
  };
  key_features?: {
    th?: string[];
    en?: string[];
  };
  signature_vibe?: BilingualText;
  editorial_note?: BilingualText;
};

export type CardRecord = {
  card_id: string;
  arcana: string;
  name: BilingualText;
  image?: string;
  number?: number;
  roman?: string;
  model_profile?: ModelProfile;
};
```

เป้าหมายคือให้ระบบรองรับ field เพิ่มในอนาคตโดยไม่พังง่าย

---

### 11) ตรวจ backward compatibility กับ deck เดิม
ต้องทำให้สำรับเดิมยังใช้งานได้ตามปกติ

เช็กลิสต์:
- deck เดิมยังเปิดได้
- หน้ารายละเอียดไพ่เดิมยังไม่พัง
- ระบบ random draw เดิมยังทำงาน
- spread เดิมยังทำงาน
- ถ้า deck เดิมไม่มี `lookbook.json` หรือ `guidebook.json` UI ต้องไม่ error

---

### 12) เพิ่ม seed data หรือ migration note
ถ้าแอพมีระบบ seed/import ให้เพิ่มขั้นตอน import deck ใหม่ด้วย

เช่น:
- copy files เข้าสู่ `data/decks/deck_002_asian_vogue_tarot`
- update registry
- rebuild cache ถ้ามี
- run type check
- run build

---

## สิ่งที่ห้ามทำ

1. ห้าม hardcode ชื่อ deck แค่ 2 สำรับ
2. ห้าม hardcode path ของสำรับแรกไว้ทั่วทั้งโปรเจกต์
3. ห้าม assume ว่า every deck has identical fields
4. ห้ามผูก route ไพ่โดยไม่มี `deck slug`
5. ห้ามเขียน logic ที่ทำให้การเพิ่ม deck ที่ 3, 4, 5 ต้องแก้หลายจุดซ้ำ ๆ

---

## ผลลัพธ์ที่ต้องการ
เมื่อทำเสร็จแล้ว แอพต้องสามารถ:

1. แสดงรายการสำรับได้มากกว่า 1 ชุด
2. เปิดดูรายละเอียดของ deck ที่ 2 ได้
3. เปิดดูรายละเอียดไพ่ของ deck ที่ 2 ได้
4. ใช้ spread ของ deck ที่ 2 ได้
5. สุ่มไพ่จาก deck ที่ 2 ได้โดยไม่ปนกับ deck อื่น
6. ยังใช้งาน deck เดิมได้ปกติ
7. พร้อมรองรับ deck ใหม่ในอนาคตด้วยการเพิ่มข้อมูลและ registry เป็นหลัก

---

## งานส่งมอบ
หลังทำเสร็จ ให้สรุปผลลัพธ์เป็นหัวข้อต่อไปนี้:

1. โครงสร้างไฟล์ใหม่
2. ไฟล์ที่สร้าง/แก้ไข
3. route ที่เพิ่มหรือเปลี่ยน
4. วิธีเพิ่ม deck ใหม่ในอนาคตแบบ step-by-step
5. จุดที่ยังควรพัฒนาต่อ

---

## แนวทางการทำงาน
ให้ลงมือแก้โค้ดจริงในโปรเจกต์อย่างระมัดระวัง โดยพยายามเปลี่ยนให้น้อยที่สุดเท่าที่จำเป็น แต่ต้องได้สถาปัตยกรรมที่รองรับ multi-deck อย่างถูกต้องและยืดหยุ่น

หากพบว่าของเดิมผูกกับ single-deck แน่นมาก ให้ refactor เฉพาะส่วนที่จำเป็นเพื่อให้รองรับหลายสำรับได้ในระยะยาว

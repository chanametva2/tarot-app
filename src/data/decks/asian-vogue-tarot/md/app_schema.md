# The Archetype: Asian Vogue Tarot — App Schema Guide

เอกสารนี้สรุปบทบาทของแต่ละไฟล์ JSON ในชุดข้อมูลสำรับ
**The Archetype: Asian Vogue Tarot (Limited Edition: The Luminous Skin Series)**
เพื่อใช้เป็นคู่มือเชื่อมต่อกับแอพ

---

## 1) ภาพรวมโครงสร้างไฟล์

ชุดข้อมูลหลักประกอบด้วย 6 ไฟล์

- `manifest.json`
- `cards.json`
- `meanings.json`
- `spreads.json`
- `lookbook.json`
- `guidebook.json`

แนวคิดหลักคือแยกข้อมูลออกเป็น 3 ชั้น

1. **Deck metadata layer** — ข้อมูลระดับสำรับ
2. **Card identity layer** — ข้อมูลประจำไพ่และนายแบบ
3. **Interpretation layer** — ข้อมูลสำหรับการอ่านไพ่และคู่มือ

---

## 2) บทบาทของแต่ละไฟล์

## `manifest.json`
ใช้เก็บข้อมูลระดับสำรับทั้งหมด

เหมาะสำหรับ:
- หน้าเลือกสำรับ
- หน้า collection overview
- หน้า settings ของสำรับ
- ข้อมูลที่แอพต้องใช้ตอนโหลด deck

ฟิลด์สำคัญที่ควรอยู่ในไฟล์นี้:
- `deck_id`
- `slug`
- `title`
- `subtitle`
- `author`
- `language_support`
- `card_count`
- `structure`
- `assets`
- `naming`
- `notes`

หน้าที่หลัก:
- ระบุว่าสำรับนี้คืออะไร
- มีไพ่กี่ใบ
- ใช้ภาษาอะไร
- ใช้ image naming แบบใด
- มีไฟล์ประกอบอะไรบ้าง

---

## `cards.json`
ใช้เก็บข้อมูลประจำไพ่แต่ละใบในระดับ metadata

เหมาะสำหรับ:
- หน้า gallery ของไพ่
- card list/grid view
- หน้า detail card เบื้องต้น
- ระบบสุ่มไพ่
- ระบบ preload รูป

ฟิลด์สำคัญที่ควรอยู่ในไฟล์นี้:
- `card_id`
- `arcana`
- `name`
- `number`
- `roman`
- `image`
- `model_profile`

### โครง `model_profile`
แนะนำให้ใช้โครงนี้เป็นมาตรฐาน

- `model_name`
- `model_stats`
- `key_features`
- `signature_vibe`
- `editorial_note`

หน้าที่หลัก:
- เป็นตัวบอกว่าไพ่ใบนี้คือใบไหน
- ใช้จับคู่กับรูปภาพ
- ใช้แสดงข้อมูลนายแบบและ look identity
- ใช้เป็นฐานในการ map ไปยัง `meanings.json`, `lookbook.json`, `guidebook.json`

---

## `meanings.json`
ใช้เก็บข้อมูลความหมายไพ่ในเชิงตีความแบบเต็ม

เหมาะสำหรับ:
- หน้าอ่านไพ่แบบละเอียด
- หน้า expand meanings
- หน้า tarot study mode
- backend logic สำหรับ card interpretation

ฟิลด์สำคัญที่ควรอยู่ในไฟล์นี้:
- `archetype`
- `visual_identity`
- `symbolism`
- `aesthetic_tone`
- `upright`
- `reversed`
- `oracle_message`
- `fashion_caption`

หน้าที่หลัก:
- ทำหน้าที่เป็น interpretation source หลัก
- รองรับทั้งโหมดดูความหมายเร็วและโหมดศึกษาเชิงลึก
- แยกจาก `cards.json` เพื่อไม่ให้ metadata กับ meanings ปนกัน

---

## `spreads.json`
ใช้เก็บโครง spread สำหรับการเปิดไพ่ในแอพ

เหมาะสำหรับ:
- หน้าเลือก spread
- ระบบ draw layout
- logic สำหรับ assign ไพ่ลงตำแหน่ง
- UI label ของแต่ละตำแหน่ง

ฟิลด์สำคัญที่ควรอยู่ในไฟล์นี้:
- `deck_id`
- `spreads`
  - `spread_id`
  - `name`
  - `card_count`
  - `positions`
    - `position`
    - `key`
    - `label`

หน้าที่หลัก:
- บอกว่า spread นี้ใช้กี่ใบ
- บอกความหมายของแต่ละตำแหน่ง
- ทำให้แต่ละสำรับมี spread เฉพาะตัวได้

---

## `lookbook.json`
ใช้เก็บข้อมูลเชิงแฟชั่นและภาพลักษณ์ของสำรับ

เหมาะสำหรับ:
- หน้าแฟชั่น lookbook
- หน้าโปรโมตสำรับ
- collector mode
- editorial/gallery presentation

ฟิลด์สำคัญที่ควรมี:
- `card_id`
- `name`
- `archetype`
- `visual_identity`
- `aesthetic_tone`
- `fashion_caption`
- `model_profile`

หน้าที่หลัก:
- แสดง narrative เชิงแฟชั่นของแต่ละใบ
- ใช้กับหน้า model spotlight
- รองรับการทำเว็บไซต์โปรโมตหรือ guidebook เชิง visual

ข้อแตกต่างจาก `cards.json`:
- `cards.json` = metadata ที่จำเป็นต่อระบบ
- `lookbook.json` = presentation layer สำหรับแฟชั่นและภาพลักษณ์

---

## `guidebook.json`
ใช้เก็บข้อมูลสำหรับการอ่านไพ่แบบคู่มือโดยเฉพาะ

เหมาะสำหรับ:
- หน้า guidebook mode
- หน้า meanings แบบอ่านต่อเนื่อง
- e-book / companion guide
- ระบบเรียนรู้ความหมายไพ่รายใบ

ฟิลด์สำคัญที่ควรมี:
- `card_id`
- `name`
- `archetype`
- `symbolism`
- `upright`
- `reversed`
- `oracle_message`
- `fashion_caption`
- `interpretive_note`
- `reading_focus`

หน้าที่หลัก:
- เป็นเลเยอร์การอ่านไพ่ที่ “พร้อมอ่าน” มากที่สุด
- ไม่เน้น metadata
- ไม่เน้น model profile เต็มๆ
- เน้นภาษาที่ user-facing

ข้อแตกต่างจาก `meanings.json`:
- `meanings.json` = source data ที่ยืดหยุ่นกว่า
- `guidebook.json` = curated reading layer สำหรับ user

---

## 3) ความสัมพันธ์ระหว่างไฟล์

ทุกไฟล์ควรเชื่อมกันด้วย `card_id`

ตัวอย่าง:
- `cards.json` → `F00`
- `meanings.json` → `F00`
- `lookbook.json` → `F00`
- `guidebook.json` → `F00`

ดังนั้นในแอพควรยึด `card_id` เป็น primary key กลาง

### แนวทาง mapping

- `manifest.json` โหลดก่อน
- `cards.json` ใช้สร้างรายการไพ่ทั้งหมด
- เมื่อ user กดดูไพ่ 1 ใบ:
  - โหลดข้อมูลพื้นฐานจาก `cards.json`
  - โหลด meaning จาก `meanings.json`
  - โหลด lookbook layer จาก `lookbook.json`
  - โหลด reading text จาก `guidebook.json`

---

## 4) Flow การใช้งานในแอพ

## กรณี 1: หน้าเลือกสำรับ
ใช้:
- `manifest.json`

แสดง:
- ชื่อสำรับ
- subtitle
- จำนวนไพ่
- cover image
- คำอธิบายสั้น

## กรณี 2: หน้าแสดงไพ่ทั้งหมด
ใช้:
- `cards.json`

แสดง:
- รูปไพ่
- ชื่อไพ่
- หมายเลขไพ่
- ชื่อนายแบบ

## กรณี 3: หน้าเปิดไพ่ 1 ใบ
ใช้:
- `cards.json`
- `meanings.json`
- `guidebook.json`

แสดง:
- รูปไพ่
- ชื่อไพ่
- archetype
- upright / reversed
- oracle message
- reading focus

## กรณี 4: หน้า lookbook / collector mode
ใช้:
- `cards.json`
- `lookbook.json`

แสดง:
- ชื่อนายแบบ
- model stats
- key features
- signature vibe
- editorial note
- fashion caption

## กรณี 5: หน้าเลือก spread
ใช้:
- `spreads.json`

แสดง:
- รายชื่อ spreads
- จำนวนไพ่
- ความหมายแต่ละ position

---

## 5) คำแนะนำเชิงสถาปัตยกรรม

## แนวทางแนะนำ

ให้แอพถือว่า:
- `cards.json` เป็น **source of truth** สำหรับ card registry
- `manifest.json` เป็น **source of truth** สำหรับ deck registry
- `spreads.json` เป็น **source of truth** สำหรับ spread registry
- `meanings.json`, `lookbook.json`, `guidebook.json` เป็น **content layers**

## ข้อดีของแนวนี้
- แก้ไขง่าย
- เพิ่มภาษาใหม่ง่าย
- เพิ่ม deck ใหม่ง่าย
- แยก concern ชัดเจน
- ทำ caching ง่าย

---

## 6) โครงสร้างโฟลเดอร์ที่แนะนำ

```text
/decks
  /asian-vogue-tarot
    manifest.json
    cards.json
    meanings.json
    spreads.json
    lookbook.json
    guidebook.json
    /images
      F00.webp
      F01.webp
      ...
      F21.webp
      cover.jpg
      back.jpg
```

---

## 7) การขยายในอนาคต

ถ้าจะขยายต่อ แนะนำไฟล์เพิ่มเติมดังนี้

### `app_text.json`
เก็บข้อความ UI เฉพาะสำรับ เช่น
- intro text
- onboarding text
- deck-specific prompt

### `reading_presets.json`
เก็บ preset รูปแบบการตีความ เช่น
- reflective mode
- shadow mode
- fashion-oracle mode
- collector mode

### `fragrance_profile.json`
ถ้าคุณจะเชื่อมกับ concept น้ำหอม/กลิ่น สามารถทำแยกได้เลย

### `audio_script.json`
ถ้าจะมีเสียงอ่านไพ่หรือ narration

---

## 8) ข้อสรุป

สำหรับสำรับนี้ โครงที่ดีที่สุดคือ:

- `manifest.json` → ระดับสำรับ
- `cards.json` → ระดับตัวไพ่และนายแบบ
- `meanings.json` → ความหมายเชิงตีความ
- `spreads.json` → โครงเปิดไพ่
- `lookbook.json` → เลเยอร์แฟชั่นและภาพลักษณ์
- `guidebook.json` → เลเยอร์คำอธิบายแบบพร้อมอ่าน

โครงแบบนี้เหมาะมากกับสำรับที่มีทั้ง
- tarot meaning
- editorial concept
- model identity
- collector value

และรองรับทั้งแอพ, เว็บไซต์, guidebook, และ promotional content ได้ในชุดเดียว

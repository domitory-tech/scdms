# ระบบจัดการคะแนนความประพฤตินักเรียน (Conduct Score Management System)

ระบบบริหารจัดการและติดตามคะแนนความประพฤตินักเรียนออนไลน์ รองรับการบันทึกคะแนน ตัด/เพิ่มคะแนน กฎเกณฑ์ตามระเบียบโรงเรียน และแดชบอร์ดสถิติ

- **ผู้ดูแลระบบ / ผู้ใช้งาน:** `tasawan@pcccr.ac.th`
- **เทคโนโลยี:** React 19, TypeScript, Tailwind CSS, Vite, Firebase Firestore & Authentication

---

## 🚀 การนำขึ้น GitHub (Deployment to GitHub) สำหรับ `tasawan@pcccr.ac.th`

### วิธีที่ 1: ผ่าน Google AI Studio (ง่ายและเร็วที่สุด)
1. ไปที่เมนู **Settings** (รูปเฟือง) หรือเมนูแชร์ของ Google AI Studio ด้านขวาบน
2. เลือก **Export to GitHub**
3. ล็อกอินหรืออนุญาตสิทธิ์เข้าถึงบัญชี GitHub ของท่าน (`tasawan@pcccr.ac.th`)
4. เลือกว่าจะสร้างเป็น **Public** หรือ **Private Repository**
5. ระบบจะทำการ Push โค้ดทั้งหมดขึ้น GitHub ให้ทันทีโดยอัตโนมัติ

---

### วิธีที่ 2: ผ่าน Git CLI (Command Line)

หากต้องการ Push จากเครื่องของคุณเอง หรือผ่าน Git Terminal:

1. **สร้าง Repository ใหม่บน GitHub:**
   - เข้าสู่ระบบ [GitHub](https://github.com) ด้วยบัญชีอีเมล `tasawan@pcccr.ac.th`
   - คลิกปุ่ม **New Repository** (เช่น ตั้งชื่อว่า `conduct-score-system`)
   - ไม่ต้องติ๊กเลือกสร้าง README หรือ .gitignore (เนื่องจากในโปรเจกต์มีเตรียมไว้แล้ว)

2. **เชื่อมต่อและ Push ขึ้น GitHub:**
   ```bash
   # ตรวจสอบการตั้งค่า User Git
   git config user.name "tasawan"
   git config user.email "tasawan@pcccr.ac.th"

   # เชื่อมต่อ Remote Repository (แทนที่ YOUR_GITHUB_USERNAME และ REPO_NAME)
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME.git

   # Push ไปยัง branch main
   git branch -M main
   git push -u origin main
   ```

---

## ⚙️ การตั้งค่า CI/CD อัตโนมัติ (GitHub Actions)

โปรเจกต์นี้มาพร้อมกับไฟล์ Workflow อยู่ที่ `.github/workflows/deploy.yml`:
- ตรวจสอบความถูกต้องของโค้ด (`npm run lint` / TypeScript check)
- ทำการ Build ไฟล์ Production (`npm run build`)
- เก็บ Artifact `dist/` อัตโนมัติเมื่อมีการ Push ไปยัง branch `main`

---

## 💻 การติดตั้งและรันโปรเจกต์บนเครื่องตนเอง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้น Dev Server (พอร์ต 3000)
npm run dev

# 3. ตรวจสอบ Lint / Type Check
npm run lint

# 4. ทดสอบ Build เพื่อขึ้น Production
npm run build
```

---

## 🔒 การเชื่อมต่อ Firebase

ไฟล์การตั้งค่า Firebase อยู่ที่ `firebase-applet-config.json` และการจัดการสิทธิ์ความปลอดภัยอยู่ที่ `firestore.rules`
เมื่อโคลนโปรเจกต์ไปรัน ให้แน่ใจว่าได้ระบุค่า Environment ใน `.env` ตามตัวอย่างใน `.env.example`

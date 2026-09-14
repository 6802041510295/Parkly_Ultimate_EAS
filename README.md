# Parkly — Smart Parking Finder (Android / EAS Ready)

Mini Project React Native + Expo ที่ทำมาให้พร้อมใช้กับ Google Maps บน Android และ EAS Build เป็น APK

## สิ่งที่มีในโปรเจกต์
- Google Maps (`react-native-maps`) พร้อม custom map style
- GPS ปัจจุบัน (`expo-location`)
- Marker แสดงจำนวนช่องว่าง + สถานะ Available / Almost Full / Full
- Search + filter (Nearest / Most spaces / Available / Covered / EV)
- Smart recommendation จากระยะทาง + จำนวนช่องว่าง + facility
- รายละเอียดลานจอดแบบ Bottom Sheet
- Favorite เก็บในเครื่องด้วย AsyncStorage
- เปิด Google Maps เพื่อนำทาง
- Demo Simulator สุ่มจำนวนช่องว่างตอนพรีเซนต์
- UI ธีม Cream + Wine Red ตาม reference ที่ให้มา
- EAS config สำหรับสร้าง APK โดยตรง

> ข้อมูลลานจอดและจำนวนช่องใน `src/data/parkingData.ts` เป็น **Demo Data** สำหรับ Mini Project และแก้ไขด้วยโค้ดได้ทั้งหมด

---

## 1) เปิดโปรเจกต์ครั้งแรก
ต้องใช้ Node.js 20.19+ (โปรเจกต์ตั้งไว้บน Expo SDK 56)

```cmd
cd "D:\\All work\\Mobile App\\Parkly_Ultimate_EAS"
npm install
```

ทดสอบ UI ได้ด้วย

```cmd
npx expo start
```

หรือ Web preview

```cmd
npx expo start --web
```

> Web จะเป็น schematic preview; Google Maps จริงจะอยู่ใน Android build

---

## 2) Package Name ที่ตั้งไว้
ใช้ค่านี้กับ Google Cloud:

```text
com.parkly.smartparking
```

ถ้าไม่จำเป็น **อย่าเปลี่ยน** หลังจากสร้าง SHA-1 / API key แล้ว

---

## 3) เตรียม EAS และเอา SHA-1
Login ก่อน:

```cmd
npx eas-cli@latest login
```

Link / configure โปรเจกต์:

```cmd
npx eas-cli@latest build:configure
```

ดูหรือสร้าง Android credentials:

```cmd
npx eas-cli@latest credentials -p android
```

ถ้ายังไม่มี keystore ให้ EAS สร้างให้ จากนั้นเก็บค่า **SHA-1 Certificate Fingerprint**

---

## 4) Google Cloud
ใน Google Cloud Project:

1. Enable **Maps SDK for Android**
2. Create API Key
3. Application restrictions = **Android apps**
4. Add Package name:

```text
com.parkly.smartparking
```

5. Add SHA-1 ที่ได้จาก EAS
6. API restrictions = **Maps SDK for Android**
7. Save

---

## 5) ใส่ Google Maps API Key — แก้แค่จุดเดียว
เปิดไฟล์:

```text
app.config.js
```

หา:

```js
const GOOGLE_MAPS_API_KEY = 'PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE';
```

เปลี่ยนเป็น Key ของตัวเอง เช่น

```js
const GOOGLE_MAPS_API_KEY = 'AIza...YOUR_KEY...';
```

ไฟล์นี้จะนำ Key ไปใช้ทั้ง `android.config.googleMaps.apiKey` และ config plugin ของ `react-native-maps` ให้แล้ว

---

## 6) Build เป็น APK สำหรับติดตั้งมือถือ

```cmd
npx eas-cli@latest build -p android --profile preview
```

หรือ

```cmd
npm run build:apk
```

เมื่อ EAS Build เสร็จจะได้ `.apk` ดาวน์โหลดและติดตั้งบน Android ได้โดยตรง

---

## คำสั่งที่ใช้บ่อย

```cmd
npm install
npx expo start -c
npm run check
npm run eas:credentials
npm run build:apk
```

## จุดที่แก้ข้อมูลลานจอด

```text
src/data/parkingData.ts
```

สามารถแก้ชื่อ, latitude, longitude, total, available, เวลาเปิดปิด และ facility ได้จากไฟล์เดียว

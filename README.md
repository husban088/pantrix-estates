# Pantrix Estates - Luxury Real Estate Website

White, luxury design with emerald and brass accents, smooth animations aur ek poora admin dashboard.

## Is project me kya kya hai

| Hissa | Technology | Kaam |
|---|---|---|
| `frontend/` | React 18, TypeScript, Tailwind CSS, Framer Motion | Website + Dashboard |
| `backend/` | Node.js, Express, TypeScript | API, login, upload, stats |
| Database | Firebase Firestore | Properties aur inquiries (key na ho to local JSON file) |
| Images | Cloudinary | Property photos upload (key na ho to `backend/uploads`) |
| `services/python-valuation` | Python (Flask) | Mortgage aur market value estimate |
| `services/java-commission` | Java | Commission calculator |
| `services/dotnet-leadscore` | C# / .NET 8 | Inquiry lead score (Hot / Warm / Cold) |

Docker ki zaroorat nahi. Python, Java aur .NET services **optional** hain: band hon tab bhi sab kuch chalta hai, kyunke Node backend wohi calculations khud kar leta hai. Dashboard ke Tools tab me dikhta hai ke kaun si service online hai.

## Zaroori cheezein install karein

1. **Node.js 18 ya naya** (LTS le lein): https://nodejs.org  
   Check: `node -v`

Sirf itna kaafi hai website aur dashboard chalane ke liye.

Optional (agar Python / Java / .NET services bhi chalani hain):
- Python 3.9+ : https://python.org (install karte waqt "Add to PATH" tick karein)
- Java 17+ (JDK) : https://adoptium.net  (check: `java -version`)
- .NET 8 SDK : https://dotnet.microsoft.com/download  (check: `dotnet --version`)

## Chalane ka tareeqa (3 steps)

Zip ko extract karein, phir us folder me terminal kholein:

```bash
npm install
npm run dev
```

`npm install` root, backend aur frontend teeno ki packages khud install kar deta hai (1 se 3 minute lagte hain).

Phir browser me kholein:

- Website: http://localhost:5173
- Dashboard: http://localhost:5173/dashboard
- API check: http://localhost:5000/api/health

Pehli baar chalne par 9 sample properties aur kuch sample inquiries khud ban jati hain.

## Dashboard (sab ke liye khula)

Dashboard par login ki zaroorat nahi. Navbar ke "Dashboard" button se ya seedha http://localhost:5173/dashboard par jakar koi bhi sab kuch dekh aur use kar sakta hai.

Dhyan: jab website internet par live karein to dashboard ko login ke peeche karna behtar hai, warna koi bhi properties delete kar sakta hai. Iske liye `backend/.env` me `REQUIRE_LOGIN=true` karein aur backend restart karein. Tab login `ADMIN_EMAIL` / `ADMIN_PASSWORD` se hoga (default `admin@pantrix.com` / `Admin@123`, live se pehle badal dein).

## Live test kaise karein (checklist)

1. Home page kholein: hero animation, search box, featured homes aur hover effects dekhein.
2. Home se "Search homes" dabayein, phir Properties page par filters (city, type, bedrooms, price) try karein.
3. Kisi property par click karein: gallery, mortgage calculator (sliders hilayein) aur inquiry form dekhein. Form bhej dein.
4. Navbar ka Dashboard button dabayein (login nahi chahiye). Overview me charts, Inquiries me aapki bheji hui inquiry (lead score ke saath) nazar aani chahiye.
5. Properties tab: "Add property" dabayein, details bharein, photos upload karein, save karein. Website par wo property turant dikhni chahiye.
6. Kisi property ko star karein to wo home page ke featured section me aa jati hai.
7. Phone par test: browser ko chhota karein ya phone se `http://<aapke-computer-ka-IP>:5173` kholein (dono same Wi-Fi par hon).

## Cloudinary set karna (images ke liye)

1. https://cloudinary.com par free account banayein.
2. Dashboard par **Cloud name**, **API Key**, **API Secret** milenge.
3. `backend/.env` me ye teen lines bharein:
   ```
   CLOUDINARY_CLOUD_NAME=aapka_cloud_name
   CLOUDINARY_API_KEY=aapki_key
   CLOUDINARY_API_SECRET=aapka_secret
   ```
4. Backend restart karein. Terminal me `Image storage: Cloudinary` likha aana chahiye.

## Firebase Firestore set karna (database ke liye)

1. https://console.firebase.google.com par project banayein.
2. **Build > Firestore Database > Create database** (location chunein, test mode theek hai kyunke backend Admin SDK use karta hai).
3. **Project settings (gear icon) > Service accounts > Generate new private key**. Ek JSON file download hogi.
4. JSON me se ye teen values `backend/.env` me daalein:
   ```
   FIREBASE_PROJECT_ID=json ka project_id
   FIREBASE_CLIENT_EMAIL=json ka client_email
   FIREBASE_PRIVATE_KEY="json ka private_key (poori line, double quotes ke saath)"
   ```
   `private_key` me `\n` jaisa hai waisa hi rehne dein.
5. Backend restart karein. Terminal me `Database: Firebase Firestore` aana chahiye. Pehli baar sample data Firestore me khud ban jayega.

JSON file ko kabhi GitHub par upload na karein.

## Optional services chalana

Har service alag terminal (ya double click) se:

| Service | Windows | Mac / Linux |
|---|---|---|
| Python (port 8001) | `services\run-python.bat` | `sh services/run-python.sh` |
| Java (port 8002) | `services\run-java.bat` | `sh services/run-java.sh` |
| .NET (port 8003) | `services\run-dotnet.bat` | `sh services/run-dotnet.sh` |

Phir Dashboard > Tools me "Check again" dabayein. Service online ho to calculation ke neeche `by python` / `by java` likha aata hai.

## Apni marzi ke changes

- Brand name, currency (USD), cities aur categories: `frontend/src/config.ts`
- Colors: `frontend/tailwind.config.js` (pine = green, brass = soft gold)
- Footer ka Pantrix link: `frontend/src/config.ts` me `PANTRIX_URL`

## Live hosting (jab tayyar hon)

- Frontend: `npm run build` chalayein, `frontend/dist` folder Vercel ya Netlify par upload karein. Hosting me environment variable `VITE_API_URL` backend ka URL rakhein.
- Backend: Render, Railway ya kisi VPS par `backend` folder deploy karein, start command `npm start`, aur `.env` ki saari values wahan dalein. Yaad rahe ke production me Firebase aur Cloudinary lagana behtar hai, kyunke local files hosting par restart par mit jati hain.

## Masle aur hal

- **Port already in use**: kisi aur app ne 5000 ya 5173 le rakha hai. `backend/.env` me `PORT` badlein aur `frontend/vite.config.ts` ke proxy me wohi port likhein.
- **Website par "Listings load nahi huin"**: backend band hai. `npm run dev` wale terminal me error dekhein.
- **Photos nahi dikh rahin**: sample photos internet se aati hain, internet chalu hona chahiye. Net na ho to khoobsurat placeholder dikhta hai.
- **Login chahiye / nahi chahiye**: `backend/.env` me `REQUIRE_LOGIN` true ya false karein, phir backend restart karein.
- **Sample data dobara chahiye**: backend band karke `backend/data/db.json` delete karein, phir dobara chalayein (Firebase me Firestore console se collections delete karein).

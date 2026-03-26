# 🍎 Nutriqo - AI-abil toitumise jälgimise rakendus

**README tõlked:** [English](./README.md) | [Русский (Russian)](./README.ru.md)

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![AI-Powered](https://img.shields.io/badge/AI--Powered-OpenAI-FF6B6B)

> **⚠️ Märkus:** See projekt kirjutati peamiselt AI (Claude) kasutades koostöös arendajaga. Koodibasis demonstreeritakse kaasaegset täisarengufullstack-arendamist AI-abiga.

## 📋 Sisukord

- [Ülevaade](#ülevaade)
- [Funktionaliteet](#funktionaliteet)
- [Tehnoloogiline virn](#tehnoloogiline-virn)
- [Projekti struktuur](#projekti-struktuur)
- [Alustamine](#alustamine)
- [Konfigureerimine](#konfigureerimine)
- [API dokumentatsioon](#api-dokumentatsioon)
- [Arhitektuur](#arhitektuur)
- [Arendus](#arendus)
- [Juurutamine](#juurutamine)
- [Kaasalülitamine](#kaasalülitamine)
- [Litsents](#litsents)

## 🎯 Ülevaade

**Nutriqo** on kaasaegne toitumise jälgimise rakendus, mis kasutab AI-d toidufotode analüüsimiseks ja kasutajate abistamiseks tasakaalustatud dieedi säilitamisel. Rakendus pakub reaalajas toiduanalüüsi (valgud, rasvad, süsivesikud), eesmärkide jälgimist ja preemiumfunktsioonid Stripe integratsiooniga.

<img width="1919" height="882" alt="1" src="https://github.com/user-attachments/assets/218e96c8-8194-4c7b-8b5f-b1a62d94c31d" />

<img width="1473" height="841" alt="Снимок экрана_20260326_204411" src="https://github.com/user-attachments/assets/2166f68e-3206-4b0f-b5e8-a3842b4613dd" />

### Peamised omadused

- 🤖 **AI-iga toidu fotode analüüs**: Kasutab OpenAI GPT-4 Vision tasandi toidufotode analüüsimiseks ja toiduväärtuse andmete väljavõtmiseks
- 📊 **Täiustatud statistika**: VKR (valgud, karbohüdraadid, rasvad) jälgimine koos põhjalike päeva- ja nädalaraportitega
- 💳 **Preemium-tellimused**: Stripe integratsioon preemiumfunktsioonidele $4,99/kuu eest
- 🔐 **Turvaline autentimine**: OAuth (Google) + E-post/parool NextAuth.js-iga
- 👮 **Administraatori armatuur**: Rolle põhinev juurdepääsukontroll kasutajate juhtimisega
- 🌗 **Tume/Hele teema**: Teema vahetamine ja kasutaja eelistuste säilimine
- 📱 **Reageav kujundus**: Mobiili-esmane lähenemine TailwindCSS-iga
- ⚡ **Kõrge jõudlus**: Next.js 16 koos Turbopack-ga välkkiireseks ehitamiseks

## ✨ Funktionaliteet

### Kasutaja funktionaliteet
- ✅ Toidukirjed jälgimisega käsitsi ja AI-ga toetatud fotoka üleslaadimisega
- ✅ Automaatne VKR (makronäärtused) arvutamine ja logimine
- ✅ Iga päeva/nädala toidustatistika ja eesmärkide jälgimine
- ✅ Igapäevased toidueesmärgid seadistamine ja haldamine
- ✅ Päeva lõpetamine automatiseeritud statistikaga
- ✅ Profiili haldamine ja tellimuse olek
- ✅ Muutmine tume- ja helekeste teemade vahel

### Premium funktionaliteet (vajalik tellimus)
- ✅ Toidufotode analüüs OpenAI GPT-4 Vision-iga
- ✅ AI-iga toidu tuvastamine ja toiduväärtusandmete väljavõtmine
- ✅ Täiustatud statistika ja trendi analüüs
- ✅ Prioriteetse toe saamine

### Administraatori funktionaliteet
- ✅ Armatuur platvormstatistikaga
- ✅ Täiskasvatasuslike kasutajate versioon rolle haldusega
- ✅ Kasutajate edutamine administraatori staatusele
- ✅ Kasutajate kustutamine ja konto haldamine
- ✅ Tellimuste ja tegevuse nähtavuse vaatamine
- ✅ Konversiooni määra ja platvormse tervise jälgimine

## 🛠 Tehnoloogiline virn

### Frontend
- **Raamistik**: Next.js 16.1.6 (Turbopack)
- **UI teek**: React 19.2.3
- **Keel**: TypeScript 5 (Strict Mode)
- **Stiilivoldus**: TailwindCSS 4
- **Ikoonid**: Lucide React
- **Teemad**: next-themes
- **Teatised**: react-hot-toast

### Backend ja teenused
- **Jookskeskkond**: Node.js
- **Andmebaas**: PocketBase 0.26.8
- **Autentimine**: NextAuth.js 4.24.13
- **Maksed**: Stripe API
- **AI**: OpenAI GPT-4o (nägemislikkus)
- **HTTP-klient**: Kohandatud axios-i põhinev teek

### DevOps ja tööriistad
- **Paketi haldur**: npm/pnpm
- **Testimine**: Jest 30.3.0
- **Liitavalitseja**: ESLint 9
- **Tüübi kontroll**: TypeScript ja Pylance
- **Keskkond**: .env.local saladuste jaoks

## 📁 Projekti struktuur

```
nutriqo-app/
├── src/
│   ├── app/                          # Next.js rakenduse kataloog
│   │   ├── api/                      # API teised (29 lõpp-punkti)
│   │   │   ├── auth/                 # Autentimise teised
│   │   │   ├── food/                 # Toidujälgimise teised
│   │   │   ├── goal/                 # Eesmärgi haldamise teised
│   │   │   ├── payment/              # Stripe integreerimine
│   │   │   ├── admin/                # Administraatori API
│   │   │   └── test/                 # Testimislõpp-punktid
│   │   ├── admin/                    # Administraatori UI lehed
│   │   ├── login/                    # Sisselogimise leht
│   │   ├── profile/                  # Kasutaja profiil
│   │   ├── statistics/               # Statistika armatuur
│   │   └── globals.css               # Ülemaailmne stii
│   │
│   ├── entities/                     # Äriüksused (FSD)
│   │   ├── food/                     # Toidu üksus
│   │   └── user/                     # Kasutaja üksus
│   │
│   ├── features/                     # Funktsioonimoodulid (FSD)
│   │   ├── add-food-entry/           # Toidu kirjendamise vorm
│   │   ├── auth/                     # Autentimise komponendid
│   │   ├── payment/                  # Makseintegratsioon
│   │   ├── set-daily-goals/          # Eesmärkide seadistamine
│   │   └── admin/                    # Administraatori funktsioonid
│   │
│   ├── shared/                       # Jagatud utiliidid
│   │   ├── api/                      # HTTP-klient
│   │   ├── auth/                     # Autentimise utiliidid
│   │   ├── lib/                      # Abilised funktsioonid
│   │   ├── providers/                # React pakkujad
│   │   ├── theme/                    # Teema konfigureerimine
│   │   └── ui/                       # Taaskasutatavad UI komponendid
│   │
│   └── widgets/                      # Keerulised UI komponendid
│       ├── daily-tracker/            # Päeva jälgimise vidin
│       └── header/                   # Päise komponent
│
├── types/
│   └── next-auth.d.ts                # NextAuth tüübi määratlused
│
├── public/                           # Staatused andmed
├── konfig-failid                     # tsconfig, jest, tailwind jne
└── package.json
```

### Arhitektuurimustand: FSD (Feature-Sliced Design)

See projekt järgib **Feature-Sliced Design** arhitektuurna:
- **entities/**: Peamised äriüksused (User, Food jne)
- **features/**: Sõltumatud ärifunktsioonid
- **shared/**: Jagatud kood ilma äriloogikate
- **widgets/**: Keerulised UI komponendid mitut funktsiooni ühendades

## 🚀 Alustamine

### Eeltingimused

- Node.js >= 18.17
- npm või pnpm
- PocketBase eksempel (kohalikult või hostitud)
- OpenAI API võti (fotode analüüsimiseks)
- Google OAuth mandaadid
- Stripe API võtmed

### Paigaldus

1. **Kloon repositooriumi**
   ```bash
   git clone https://github.com/lRaxSonl/Nutriqo.git
   cd Nutriqo/nutriqo-app
   ```

2. **Paigalda sõltuvused**
   ```bash
   npm install
   # või
   pnpm install
   ```

3. **Seadista keskkonnamuutujad** (vt [Konfigureerimine](#konfigureerimine))
   ```bash
   cp .env.example .env.local
   # Redigeeri .env.local oma mandaatidega
   ```

4. **Käivita arendustuuserver**
   ```bash
   npm run dev
   # Server jookseb aadressil http://localhost:3000
   ```

5. **Pääse rakendusele ligi**
   - Ava http://localhost:3000
   - Registreeri või logi sisse Google OAuth-iga
   - Alusta oma toitumise jälgimist!

### Ehitus toodangule

```bash
npm run build      # Loo optimeeritud ehitus
npm start          # Käivita toodangu server
```

## ⚙️ Konfigureerimine

### Vajalikud keskonnamuutujad

Loo `.env.local` kataloogis `nutriqo-app/`:

```env
# === POCKETBASE (Andmebaas ja autentimine) ===
POCKETBASE_URL=http://pocketbase-url.com
POCKETBASE_ADMIN_EMAIL=admin@email.com
POCKETBASE_ADMIN_PASSWORD=admin_secure_password

# === NEXTAUTH konfigureerimine ===
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32

# === GOOGLE OAUTH ===
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# === STRIPE (Maksed) ===
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# === OPENAI (Toidufotode analüüs) ===
OPENAI_API_KEY=sk-proj-...
```

### Valikulised keskonnamuutujad

```env
# PocketBase kasutajate kollektsioon nimi
POCKETBASE_USERS_COLLECTION=users

# Uudiskiri/e-posti seadistused (kui teostatud)
NODE_ENV=development
```

## 📡 API dokumentatsioon

### Baas URL
```
http://localhost:3000/api
```

### Autentimine
Enamik lõpp-punkte nõuavad `Authorization: Bearer <token>` päist.

### Peamised lõpp-punktid

#### Toidu juhtimine
- `POST /api/food/add-entry` - Lisa uus toidukirje
- `GET /api/food/get-entries` - Paigaldaja toidu kirjeja nimekiri
- `DELETE /api/food/delete-entry` - Eemalda toidukirje
- `POST /api/food/analyze-photo` - Analüüsi toidufoto (Premium)

#### Eesmärkide juhtimine
- `POST /api/goal/set-daily` - Seadista igapäevased toidueesmärgid
- `GET /api/goal/get-daily` - Saa täna eesmärgid
- `GET /api/goal/get-all` - Saa kõik kasutaja eesmärgid
- `PATCH /api/goal/update-daily` - Uuenda igapäe eesmärke
- `POST /api/goal/finish-daily` - Lõpeta päev ja saa statistika
- `DELETE /api/goal/delete-daily` - Kustyta konkreetne eesmärk

#### Maksed
- `POST /api/payment/checkout` - Loo Stripe ostu-seanss
- `POST /api/payment/activate-subscription` - Aktiveeri tellimus pärast makset

#### Administraator (nõuab administraatori rolli)
- `GET /api/admin/dashboard` - Armatuuri statistika
- `GET /api/admin/users` - Kõikide kasutajate nimekirja
- `PATCH /api/admin/users/[id]` - Uuenda kasutaja rolli
- `DELETE /api/admin/users/[id]` - Kustats kasutaja

Täielikud lõpp-punkti kirjeldused leiate failidest `src/app/api/*/route.ts`.

## 🏗️ Arhitektuur

### Autentimise voog

```
Kasutaja sisselogimise → NextAuth seanss
    ↓
OAuth/mundaatide pakkuja
    ↓
SignIn tagakutse (loob/leiab PocketBase kasutaja)
    ↓
JWT tagakutse (sünkroob roll, tellimuse olek)
    ↓
Session tagakutse (levitab ehtes)
    ↓
useSession() konks klientkomponentides
```

### Andmete sünkroonimise strateegia

```
PocketBase (Tõe allikas)
    ↓
JWT märgis (ajutine vahemälu)
    ↓
NextAuth seanss (Frontend juurdepääs)
    ↓
React komponenti olek
```

### Tellimuse süsteem

```
Kasutaja klõpsab tellimuselle
    ↓
Stripe ostu-seanss luuakse
    ↓
Kasutaja teeb makset
    ↓
activate-subscription lõpp-punkt
    ↓
subscriptionStatus seadistatakse 'active' PocketBase
    ↓
JWT tagakutse värskendab ja sünkrooib seansse
    ↓
Makseid seina kaob, funktsioonid avavad
```

## 👨‍💻 Arendus

### Testide käitamine

```bash
# Käivita kõik testid korraga
npm test

# Jälgimisrežiim (käivita uuesti muutuste korral)
npm run test:watch

# Katvusraportiga
npm run test:coverage
```

### Liitavaldamine

```bash
npm run lint
```

### Projekti statistika
- **29 API teised**: Täielikult funktsionaalsed lõpp-punktid
- **28+ ühikutestid**: Tead katmine
- **3 keelt**: Inglise, vene ja eesti dokumentatsioon
- **Tipikult ohutu**: 100% TypeScript range režiimis
- **CI/CD valmis**: Ehituse artefaktid on optimeeritud juurutamiseks

### Koodiline kvaliteedi standardid
- ✅ TypeScript range režiim
- ✅ ESLint konfigureeritud parimate tavade jaoks
- ✅ Põhjalik tõrke logimine
- ✅ Sisendi valideerimine kõigil API lõpp-punktidel
- ✅ Turvaline autentimine kogu süsteemis

## 🌐 Juurutamine

### Vercel (soovitatud)

```bash
# Ühenda GitHub repositoorium Vercelile
# Seadista keskonnamuutujad Vercel armaturil
# Automaatne juurutamine peaharust kiirendamisel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next standalone /app
CMD ["npm", "start"]
```

### Keskkonna-spetsiifiline juurutamine

1. **Arendus**: `npm run dev` (kohalik arvuti)
2. **Lavastus**: Juuruta etapilisse keskkonda testande-andmetega
3. **Toodang**: Juuruta tegeliku PocketBase ja Stripe mandaatidega
   - Kasuta turvalist salasuse juhtimist (Vercel, GitLab CI jne)
   - Luba toodangu jälgimine
   - Seadista CORS oma domeenile

## 🤝 Kaasalülitamine

1. Harguta repositoorium
2. Loo funktsiooni haru: `git checkout -b feature/amazing-feature`
3. Kinnita muudatused: `git commit -m 'Add amazing feature'`
4. Tõuka harule: `git push origin feature/amazing-feature`
5. Ava Pull Request

### Arendustandardid
- Järgige TypeScript range režiimi
- Lisa testid uue funktsiooni jaoks
- Uuenda dokumentatsiooni
- Hoidke kindlates ja kirjeldavates kinnitustes
- Kommenteeri keeruliste äriloogika

## 📄 Litsents

See projekt on litsenseeritud **MIT litsentsi** all – vt [LICENSE](LICENSE) faili üksikasjade jaoks.

## 🙏 Tänutundmused

- **AI arendus**: See projekt töötati välja peamiselt AI-ga (Claude)
- **OpenAI**: GPT-4 Vision mudel toiduanalüüsiks
- **Stripe**: Maksetöötlus
- **Next.js meeskond**: Suurepärane raamistik ja dokumentatsioon
- **PocketBase**: Lihtsustatud taustatarkvara lahendus
- **TailwindCSS**: Utiliitaarse esimese CSS raamistik
- **TypeScript**: Tipikindlus ja arendusite kogemus

## 📞 Tugi

- 📧 GitHub probleemsed: [Teata vigadest](https://github.com/lRaxSonl/Nutriqo/issues)
- 💬 Arutelud: [Küsi küsimusi](https://github.com/lRaxSonl/Nutriqo/discussions)
- 📖 Dokumentatsioon: Kontrolli seda README ja `/src` kommentaare

## 🚀 Tuleviku kava

- [ ] Mobiilirakendus (React Native)
- [ ] Ribakood skanneriga toitudele
- [ ] Sotsiaalse funktsionaalsuseg (sõprade jälgimine, väljakutsed)
- [ ] REST API kolmandate osapoolte integratsioonideks
- [ ] Täiustatud retsepti koostaja
- [ ] Toiduplaan AI-ga
- [ ] Integreerimine fitnessi jälgijatega
- [ ] Multi-keel UI tugi

---

**Viimati värskendatud:** 26. märts 2026  
**Tehtud armastusega ❤️ AI ja TypeScripti kasutades**

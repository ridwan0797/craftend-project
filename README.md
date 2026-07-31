# skill-cli

CLI untuk browse dan install kumpulan "skill" (folder instruksi/script) dari
sebuah registry publik, mirip cara kerja `npx create-*` tapi untuk skill kamu
sendiri.

## Cara kerja singkat

1. Kamu simpan skill-skill kamu di sebuah repo GitHub publik, misal:
   ```
   YOUR_SKILLS_REPO/
     skills/
       docx-writer/
         SKILL.md
       pdf-tools/
         SKILL.md
         scripts/...
     registry/
       index.json   <- daftar semua skill + lokasinya
   ```
2. `registry/index.json` berisi metadata tiap skill (lihat contoh di folder
   `registry/` project ini).
3. User install lewat CLI ini, memilih skill mana saja yang mau didownload,
   lalu skill tersebut di-copy ke folder lokal mereka.

## Instalasi (untuk development lokal)

```bash
cd skill-cli
npm install
npm link          # supaya perintah `skill-cli` bisa dipanggil global
```

Setelah dipublish ke npm, orang lain cukup:

```bash
npx skill-cli list
npx skill-cli install
```

(tanpa perlu install apa pun secara permanen)

## Perintah

### Lihat semua skill yang tersedia
```bash
skill-cli list
skill-cli list --registry https://raw.githubusercontent.com/USERNAME/REPO/main/registry/index.json
```

### Install secara interaktif (multi-select)
```bash
skill-cli install
```
Akan muncul checkbox list, pilih pakai spasi, konfirmasi dengan Enter.

### Install langsung tanpa interaktif
```bash
skill-cli install docx-writer pdf-tools
```

### Ubah folder tujuan instalasi
```bash
skill-cli install --dir ./my-skills
```

## Setel registry default

Supaya user tidak perlu selalu ketik `--registry`, ubah `DEFAULT_REGISTRY`
di `bin/cli.js`, atau minta mereka set environment variable:

```bash
export SKILL_CLI_REGISTRY="https://raw.githubusercontent.com/USERNAME/REPO/main/registry/index.json"
```

## Cara menambah skill baru ke registry kamu

1. Buat folder baru di repo skills kamu, misal `skills/nama-skill/`, isi
   dengan `SKILL.md` + file pendukung.
2. Tambahkan entri baru di `registry/index.json`:
   ```json
   {
     "id": "nama-skill",
     "name": "Nama Skill",
     "description": "Deskripsi singkat",
     "category": "kategori",
     "version": "1.0.0",
     "source": {
       "type": "github",
       "owner": "USERNAME",
       "repo": "REPO",
       "ref": "main",
       "path": "skills/nama-skill"
     }
   }
   ```
3. Push ke GitHub. Selesai — otomatis muncul di `skill-cli list` untuk semua
   user (karena CLI selalu fetch registry secara live, bukan bundled).

## Publish CLI ke npm (supaya publik bisa `npx skill-cli`)

```bash
npm login
npm publish --access public
```

Pastikan field `name` di `package.json` belum dipakai orang lain di npm
registry (cek di https://www.npmjs.com/).

## Catatan teknis

- Download folder dari GitHub memakai GitHub Contents API (tanpa perlu
  clone/git). Untuk repo publik ini gratis tapi dibatasi 60 request/jam per
  IP tanpa autentikasi. Kalau kena limit, set `GITHUB_TOKEN` di environment
  untuk menaikkan limit ke 5000/jam.
- Saat ini hanya mendukung source bertipe GitHub. Bisa dikembangkan untuk
  mendukung tipe lain (GitLab, npm package, tarball URL, dst) dengan
  menambah handler baru di `src/github.js` dan validasi di
  `src/registry.js`.
- Semua skill yang dipilih di-download ulang tiap kali `install` dipanggil
  (tidak ada caching). Cocok untuk versi awal; bisa ditambah nanti kalau
  perlu offline mode / versioning lokal.

## Roadmap ide lanjutan
- `skill-cli update` — cek versi skill yang sudah terinstall vs registry.
- `skill-cli search <keyword>` — filter skill berdasarkan nama/kategori.
- Dukungan private registry dengan token auth.
- Lockfile (`skills.lock.json`) supaya instalasi reproducible.

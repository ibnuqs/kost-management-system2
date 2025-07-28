# 🔐 GITHUB SETUP GUIDE

## Step 1: Buat Personal Access Token

1. **Buka https://github.com/settings/tokens**
2. **Klik "Generate new token" → "Generate new token (classic)"**
3. **Note:** `Kost Management System Deploy`
4. **Expiration:** `90 days` (atau sesuai kebutuhan)
5. **Select scopes:** Centang `repo` (full control of private repositories)
6. **Klik "Generate token"**
7. **COPY TOKEN** yang muncul (simpan baik-baik!)

## Step 2: Buat Repository di GitHub

1. **Buka https://github.com/ibnuqs**
2. **Klik "New" (tombol hijau)**
3. **Repository name:** `kost-management-system`
4. **Description:** `Complete boarding house management system with IoT integration`
5. **Private** ✅ (recommended)
6. **JANGAN centang "Add README"** (kita sudah punya)
7. **Klik "Create repository"**

## Step 3: Setup Authentication di PC

Jalankan command ini (ganti YOUR_TOKEN dengan token dari Step 1):

```bash
# Setup GitHub credentials
git config --global credential.helper store
git config --global user.name "ibnuqs"
git config --global user.email "your-email@example.com"

# Push dengan username dan token
git push -u origin main
# Username: ibnuqs
# Password: YOUR_PERSONAL_ACCESS_TOKEN
```

## Step 4: Test Push

Setelah setup, test dengan:
```bash
git push origin main
```

## Alternative: SSH Key Setup (Lebih Aman)

Kalau mau lebih aman, bisa pakai SSH key:

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_rsa.pub

# Add ke GitHub Settings → SSH and GPG keys → New SSH key
# Lalu ganti remote URL:
git remote set-url origin git@github.com:ibnuqs/kost-management-system.git
```

## Quick Commands Setelah Setup

```bash
# Update dan deploy cepat
git add .
git commit -m "Update features"
git push origin main
./quick-commands.sh fast-deploy
```

---

**Status Git Remote:**
- ✅ Remote origin added: https://github.com/ibnuqs/kost-management-system.git
- ⏳ Waiting for authentication setup
- ⏳ Waiting for initial push
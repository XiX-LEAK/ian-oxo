# 🔐 Guide de Test - Authentification Supabase

## ✅ Corrections Effectuées

1. **URL Supabase corrigée** : `https://qoynvpciuxhipessvojj.supabase.co`
2. **Messages d'erreur en français** : Tous traduits et améliorés
3. **Logs de debug** : Ajoutés pour identifier les problèmes
4. **Validation renforcée** : Vérifications côté client avant envoi

## 🚀 Comment Tester

### 1. Ouvrir l'application
- Aller sur `http://localhost:3001`
- Cliquer sur "Se connecter" dans le header

### 2. Créer un compte
- Cliquer sur "Créer un compte"
- Entrer un **email valide** (vous devez avoir accès à cette boîte mail)
- Entrer un **mot de passe** (minimum 6 caractères)
- Cliquer sur "✨ Créer le compte"

### 3. Vérification
- Vous devriez voir "Compte créé ! Vérifiez votre email"
- **Aller dans votre boîte mail** et cliquer sur le lien de confirmation

### 4. Se connecter
- Retourner sur l'app
- Utiliser le même email/mot de passe
- Cliquer sur "🚀 Se connecter"

## 🔍 Debug

Si problème, **ouvrir la console navigateur** (F12) pour voir :
- Les logs de connexion Supabase
- Les erreurs détaillées
- L'état des variables d'environnement

## 📧 Email de Test

Pour tester rapidement, utilisez :
- Un email temporaire : `10minutemail.com`
- Ou votre vrai email Gmail/Outlook

## ⚠️ Problèmes Courants

- **"Failed to fetch"** → URL Supabase incorrecte (maintenant corrigée)
- **"Email not confirmed"** → Cliquer sur le lien dans l'email
- **Messages en anglais** → Maintenant tout en français
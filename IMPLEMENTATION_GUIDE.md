# Implementation Guide: Custom Dev Client, Cloudinary, and Turso

This guide walks you through implementing the three core features needed to make QuickLog production-ready.

## Overview

| Feature | Purpose | Timeline |
|---------|---------|----------|
| **Custom Dev Client** | Enable image picker on your device | 10-15 min setup + 5-10 min build |
| **Cloudinary** | Store images in cloud | 10 min setup + 5 min integration |
| **Turso Database** | Persist receipts to backend | 10 min setup + 5 min integration |

## Implementation Order

Follow these steps in order for best results:

### 1️⃣ Custom Dev Client Build (10-15 minutes)

**Why first?** You need this to test image picker functionality.

**Steps:**
1. Read `DEV_CLIENT_BUILD.md`
2. Install EAS CLI: `npm install -g eas-cli`
3. Authenticate: `eas login`
4. Build: `eas build --platform android --profile development`
5. Wait for build (5-10 minutes)
6. Download and install APK on your device
7. Start dev server: `npm run dev`
8. Connect device via QR code

**Verify:** Image picker works when you tap Gallery/Camera buttons

---

### 2️⃣ Cloudinary Integration (10 minutes)

**Why second?** Images need to be uploaded to cloud storage.

**Steps:**
1. Read `CLOUDINARY_SETUP.md`
2. Create Cloudinary account at https://cloudinary.com
3. Get credentials:
   - Cloud Name
   - Upload Preset (create one named `quicklog-receipts`)
4. Set environment variables:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_UPLOAD_PRESET=quicklog-receipts
   ```
5. The `lib/cloudinary-service.ts` module is ready to use

**Verify:** 
- Upload an image through the app
- Check Cloudinary Media Library for the image
- Verify it's in the `quicklog-receipts` folder

**Note:** The create-receipt screen will need to be updated to use Cloudinary. See "Integration Steps" below.

---

### 3️⃣ Turso Database Connection (10 minutes)

**Why third?** Backend storage for persistent data.

**Steps:**
1. Read `TURSO_SETUP.md`
2. Create Turso account at https://turso.tech
3. Create database: `quicklog-delivery`
4. Get credentials:
   - Database URL
   - Auth Token
5. Set environment variables:
   ```bash
   TURSO_CONNECTION_URL=libsql://xxxxx.turso.io
   TURSO_AUTH_TOKEN=your_token
   ```
6. Initialize schema: `npm run db:push`

**Verify:**
- Check Turso dashboard → Database → Browser
- Query: `SELECT * FROM receipts;`
- Should be empty (no data yet)

---

## Integration Steps

### Update Create Receipt Screen

The `app/create-receipt.tsx` needs to be updated to use Cloudinary for image uploads.

**Current behavior:**
- Images stored as local file URIs
- Lost when app is uninstalled

**New behavior:**
- Images uploaded to Cloudinary
- URLs stored in receipt
- Persistent across devices

**Code changes needed:**

```typescript
// In app/create-receipt.tsx

import { uploadImageToCloudinary } from '@/lib/cloudinary-service';

// Update pickFromGallery function:
const pickFromGallery = async () => {
  // ... existing code to get image ...
  
  // NEW: Upload to Cloudinary
  const uploadResult = await uploadImageToCloudinary(
    imageUri,
    process.env.CLOUDINARY_CLOUD_NAME || '',
    process.env.CLOUDINARY_UPLOAD_PRESET || '',
  );
  
  if (uploadResult.success && uploadResult.url) {
    // Save Cloudinary URL instead of local URI
    setFormData({
      ...formData,
      images: [...formData.images, uploadResult.url],
    });
  } else {
    Alert.alert('Upload Failed', uploadResult.error || 'Unknown error');
  }
};

// Same for pickFromCamera function
```

### Update Receipt Context

The `lib/receipt-context.tsx` needs to sync receipts to Turso backend.

**Current behavior:**
- Receipts stored only in AsyncStorage
- Each device has separate data

**New behavior:**
- Receipts synced to Turso
- All devices see same data
- Admin dashboard shows all receipts

**Code changes needed:**

```typescript
// In lib/receipt-context.tsx

// Add Turso sync function:
const syncReceiptToTurso = async (receipt: Receipt) => {
  try {
    const response = await fetch('/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receipt),
    });
    
    if (!response.ok) throw new Error('Sync failed');
    
    // Mark as synced
    await updateReceiptSync(receipt.id, true);
  } catch (err) {
    console.error('Sync error:', err);
  }
};

// Call when online:
useEffect(() => {
  if (isOnline && syncQueue.length > 0) {
    syncQueue.forEach(receiptId => {
      const receipt = receipts.find(r => r.id === receiptId);
      if (receipt) syncReceiptToTurso(receipt);
    });
  }
}, [isOnline]);
```

---

## Testing Checklist

After implementing all three features, verify:

### ✅ Custom Dev Client
- [ ] App launches on custom dev client
- [ ] Image picker opens when tapping Gallery/Camera
- [ ] Can select/capture images

### ✅ Cloudinary
- [ ] Images upload successfully
- [ ] Images appear in Cloudinary Media Library
- [ ] Images display in receipt preview

### ✅ Turso Database
- [ ] Receipt data appears in Turso dashboard
- [ ] Admin can view all receipts
- [ ] Receipts persist after app restart

### ✅ End-to-End Flow
- [ ] Staff creates receipt with images
- [ ] Images upload to Cloudinary
- [ ] Receipt data syncs to Turso
- [ ] Admin sees receipt in dashboard
- [ ] Works offline (syncs when online)

---

## Troubleshooting

### Image Picker Not Working
- Verify custom dev client is installed (not stock Expo Go)
- Check app name in Settings
- Restart dev server: `npm run dev`

### Images Not Uploading to Cloudinary
- Verify `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` are set
- Check upload preset is set to "Unsigned"
- Check browser console for errors
- Verify network connection

### Data Not Syncing to Turso
- Verify `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are correct
- Run `npm run db:push` to initialize schema
- Check server logs: `npm run dev` (server output)
- Verify network connection

---

## Environment Variables Summary

Create a `.env` file with:

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=quicklog-receipts

# Turso
TURSO_CONNECTION_URL=libsql://xxxxx.turso.io
TURSO_AUTH_TOKEN=your_auth_token
```

Or set via Manus webdev secrets interface.

---

## Next Steps

After completing all three features:

1. **Test thoroughly** on your device
2. **Optimize performance** (image compression, query indexing)
3. **Add monitoring** (error tracking, analytics)
4. **Deploy to production** (see `DEPLOYMENT.md`)
5. **Scale infrastructure** (add more regions, increase quotas)

---

## Support Resources

- **Custom Dev Client**: https://docs.expo.dev/develop/development-builds/
- **Cloudinary**: https://cloudinary.com/documentation
- **Turso**: https://docs.turso.tech
- **QuickLog Docs**: See `README.md` and `FEATURES.md`

---

**Ready to start?** Begin with Step 1: Custom Dev Client Build!

# Custom Dev Client Build Guide

## Overview

Stock Expo Go doesn't include the `expo-image-picker` native module. To enable full image capture functionality, you need to build a **custom dev client** — a native Android APK with all Expo modules pre-built.

## Prerequisites

- **Node.js**: v18+ (you have v22.13.0 ✓)
- **npm**: v9+ (you have npm ✓)
- **Android SDK**: Installed and configured
- **Android Device or Emulator**: For testing the APK
- **Git**: For version control

## Step 1: Install EAS CLI

EAS (Expo Application Services) manages the build process. Install it globally:

```bash
npm install -g eas-cli
```

Verify installation:

```bash
eas --version
```

## Step 2: Authenticate with Expo

Log in to your Expo account (or create one at https://expo.dev):

```bash
eas login
```

You'll be prompted to enter your Expo credentials. If you don't have an account, create one first.

## Step 3: Configure EAS Build

The project already has `eas.json` configured. Verify it contains:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

This configuration tells EAS to build a development client (not a production APK).

## Step 4: Build the Development Client

Run the build command:

```bash
eas build --platform android --profile development
```

**What happens:**
- EAS builds your app with all native modules (including expo-image-picker)
- The build runs in the cloud and takes 5-10 minutes
- You'll receive a download link for the APK when complete

**Monitor the build:**
- You can check build status at: https://expo.dev/builds
- Or monitor in terminal (it will show progress)

## Step 5: Download and Install the APK

Once the build completes:

1. **Download the APK** from the link provided
2. **Transfer to your Android device** (via USB or cloud storage)
3. **Install the APK**:
   - Open file manager on device
   - Tap the APK file
   - Allow installation from unknown sources if prompted
   - Tap "Install"

## Step 6: Run the Dev Server

Start the Metro bundler on your computer:

```bash
cd /home/ubuntu/quicklog-delivery-app
npm run dev
```

You'll see output like:

```
Starting Metro Bundler
Expo dev server is running at: exp://192.168.x.x:8081
```

## Step 7: Connect Your Device

**Option A: QR Code (Easiest)**
1. Open the custom dev client app on your device
2. Point camera at the QR code shown in terminal
3. App will load automatically

**Option B: Manual Connection**
1. Open the custom dev client app
2. Tap "Connect by URL"
3. Enter the URL from terminal (e.g., `exp://192.168.x.x:8081`)

## Step 8: Test Image Picker

1. Log in as Staff (Phone: 0111111111, PIN: 1111)
2. Tap the **+** button to create a receipt
3. Tap **Gallery** or **Camera** button
4. Image picker should now work! 🎉

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Build fails** | Check that `eas.json` exists and is valid. Run `eas build --platform android --profile development --verbose` for details. |
| **App won't connect** | Ensure your computer and device are on the same WiFi network. Try restarting Metro with `npm run dev`. |
| **Image picker still crashes** | Make sure you installed the custom dev client APK, not stock Expo Go. Check app name in settings. |
| **QR code not scanning** | Try Manual Connection with the URL instead. |
| **Build takes too long** | EAS builds can take 5-15 minutes. Check build status at https://expo.dev/builds. |

## Next Steps

Once the custom dev client is working:

1. **Test receipt creation** with images
2. **Proceed to Cloudinary integration** for cloud image storage
3. **Connect Turso database** for persistent data

## Additional Resources

- [Expo Development Client Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Troubleshooting Guide](https://docs.expo.dev/build/troubleshooting/)

---

**Questions?** Check the Expo documentation or reach out to the Expo community.

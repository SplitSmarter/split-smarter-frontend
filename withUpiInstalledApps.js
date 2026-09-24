const {
    withAndroidManifest,
    withDangerousMod,
    withMainApplication,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const UPI_PACKAGES = [
    'com.google.android.apps.nbu.paisa.user',
    'com.phonepe.app',
    'net.one97.paytm',
    'in.org.npci.upiapp',
    'com.whatsapp',
    'com.cred.android',
];

function getAndroidPackageName(config) {
    return config.android?.package || config.modRequest?.androidPackage || 'com.onewordmax.splitsmart';
}

function moduleJavaSource(packageName) {
    return `package ${packageName};

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Base64;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class UPIInstalledAppsModule extends ReactContextBaseJavaModule {
    private static final int REQUEST_CODE_UPI_PAYMENT = 1001;
    private final ReactApplicationContext mReactContext;
    private Promise mPaymentPromise;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == REQUEST_CODE_UPI_PAYMENT) {
                if (mPaymentPromise == null) return;

                WritableMap responseMap = Arguments.createMap();

                if (data != null) {
                    Bundle extras = data.getExtras();
                    String responseStr = data.getStringExtra("response");

                    if (responseStr != null && !responseStr.isEmpty()) {
                        responseMap.putString("rawResponse", responseStr);
                        parseAndPopulateResponse(responseStr, responseMap);
                    } else if (extras != null) {
                        for (String key : extras.keySet()) {
                            Object value = extras.get(key);
                            if (value != null) {
                                responseMap.putString(key, value.toString());
                            }
                        }
                    } else {
                        responseMap.putString("Status", "FAILURE");
                        responseMap.putString("message", "Empty response intent");
                    }
                } else {
                    responseMap.putString("Status", "FAILURE");
                    responseMap.putString("message", "User cancelled or no response from app");
                }

                mPaymentPromise.resolve(responseMap);
                mPaymentPromise = null;
            }
        }
    };

    public UPIInstalledAppsModule(ReactApplicationContext context) {
        super(context);
        this.mReactContext = context;
        this.mReactContext.addActivityEventListener(mActivityEventListener);
    }

    @NonNull
    @Override
    public String getName() {
        return "UPIInstalledAppsModule";
    }

    @ReactMethod
    public void getInstalledUPIApps(Promise promise) {
        try {
            WritableArray installedAppList = Arguments.createArray();
            Uri uri = Uri.parse("upi://pay");
            Intent upiIntent = new Intent(Intent.ACTION_VIEW, uri);

            PackageManager pm = mReactContext.getPackageManager();
            List<ResolveInfo> resolveInfoList = pm.queryIntentActivities(upiIntent, PackageManager.MATCH_ALL);

            if (resolveInfoList != null) {
                for (ResolveInfo resolveInfo : resolveInfoList) {
                    WritableMap appInfoMap = Arguments.createMap();
                    String appName = resolveInfo.loadLabel(pm).toString();
                    String pkgName = resolveInfo.activityInfo.packageName;

                    appInfoMap.putString("name", appName);
                    appInfoMap.putString("packageName", pkgName);

                    Drawable icon = resolveInfo.loadIcon(pm);
                    String base64Icon = drawableToBase64(icon);
                    appInfoMap.putString("icon", base64Icon);

                    installedAppList.pushMap(appInfoMap);
                }
            }
            promise.resolve(installedAppList);
        } catch (Exception ex) {
            promise.reject("UPI_MODULE_ERROR", ex.getMessage(), ex);
        }
    }

    @ReactMethod
    public void openTargetUPIApp(String targetPackage, String upiUriString, Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Activity doesn't exist");
            return;
        }

        if (mPaymentPromise != null) {
            promise.reject("PENDING_PAYMENT", "A payment transaction is already in progress");
            return;
        }

        mPaymentPromise = promise;

        try {
            Uri uri = Uri.parse(upiUriString);
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            PackageManager pm = currentActivity.getPackageManager();

            // Resolve specific activity inside the target package to bypass chooser
            List<ResolveInfo> matches = pm.queryIntentActivities(intent, PackageManager.MATCH_ALL);
            ResolveInfo targetInfo = null;

            for (ResolveInfo info : matches) {
                if (info.activityInfo.packageName.equalsIgnoreCase(targetPackage)) {
                    targetInfo = info;
                    break;
                }
            }

            if (targetInfo != null) {
                intent.setComponent(new ComponentName(
                    targetInfo.activityInfo.packageName,
                    targetInfo.activityInfo.name
                ));
            } else {
                intent.setPackage(targetPackage);
            }

            currentActivity.startActivityForResult(intent, REQUEST_CODE_UPI_PAYMENT);
        } catch (Exception ex) {
            mPaymentPromise = null;
            promise.reject("UPI_LAUNCH_ERROR", ex.getMessage(), ex);
        }
    }

    private void parseAndPopulateResponse(String responseStr, WritableMap map) {
        String[] pairs = responseStr.split("&");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=");
            if (keyValue.length >= 2) {
                map.putString(keyValue[0], keyValue[1]);
            } else if (keyValue.length == 1) {
                map.putString(keyValue[0], "");
            }
        }
    }

    private String drawableToBase64(Drawable drawable) {
        try {
            Bitmap bitmap;
            if (drawable instanceof BitmapDrawable && ((BitmapDrawable) drawable).getBitmap() != null) {
                bitmap = ((BitmapDrawable) drawable).getBitmap();
            } else {
                bitmap = Bitmap.createBitmap(
                    Math.max(drawable.getIntrinsicWidth(), 1),
                    Math.max(drawable.getIntrinsicHeight(), 1),
                    Bitmap.Config.ARGB_8888
                );
                Canvas canvas = new Canvas(bitmap);
                drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                drawable.draw(canvas);
            }
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
            byte[] byteArray = byteArrayOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP);
        } catch (Exception e) {
            return null;
        }
    }
}
`;
}

function packageJavaSource(packageName) {
    return `package ${packageName};

import androidx.annotation.NonNull;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class UPIInstalledAppsPackage implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new UPIInstalledAppsModule(reactContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
`;
}

function addPackageToMainApplication(contents, language) {
    if (contents.includes('UPIInstalledAppsPackage()')) {
        return contents;
    }

    if (language === 'kt') {
        if (contents.includes('PackageList(this).packages.apply {')) {
            return contents.replace(
                'PackageList(this).packages.apply {',
                'PackageList(this).packages.apply {\n              add(UPIInstalledAppsPackage())'
            );
        }
        if (contents.includes('PackageList(this).packages')) {
            return contents.replace(
                'PackageList(this).packages',
                'PackageList(this).packages.apply { add(UPIInstalledAppsPackage()) }'
            );
        }
        return contents;
    }

    if (contents.includes('new PackageList(this).getPackages()')) {
        return contents.replace(
            /return packages;/,
            'packages.add(new UPIInstalledAppsPackage());\n      return packages;'
        );
    }

    return contents;
}

function withUpiNativeSources(config) {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const packageName = getAndroidPackageName(config);
            const packageDir = path.join(
                config.modRequest.platformProjectRoot,
                'app/src/main/java',
                ...packageName.split('.')
            );
            fs.mkdirSync(packageDir, {recursive: true});
            fs.writeFileSync(
                path.join(packageDir, 'UPIInstalledAppsModule.java'),
                moduleJavaSource(packageName)
            );
            fs.writeFileSync(
                path.join(packageDir, 'UPIInstalledAppsPackage.java'),
                packageJavaSource(packageName)
            );
            return config;
        },
    ]);
}

function withUpiPackageRegistration(config) {
    return withMainApplication(config, (config) => {
        config.modResults.contents = addPackageToMainApplication(
            config.modResults.contents,
            config.modResults.language
        );
        return config;
    });
}

function withUpiPackageQueries(config) {
    return withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;
        if (!manifest.queries) {
            manifest.queries = [];
        }

        const existing = JSON.stringify(manifest.queries);
        if (!existing.includes('android:scheme":"upi') && !existing.includes('upi')) {
            manifest.queries.push({
                intent: [
                    {
                        action: [{$: {'android:name': 'android.intent.action.VIEW'}}],
                        data: [{$: {'android:scheme': 'upi'}}],
                    },
                ],
            });
        }

        const listedPackages = new Set();
        for (const query of manifest.queries) {
            for (const pkg of query.package || []) {
                if (pkg.$?.['android:name']) {
                    listedPackages.add(pkg.$['android:name']);
                }
            }
        }

        const missingPackages = UPI_PACKAGES.filter((name) => !listedPackages.has(name));
        if (missingPackages.length > 0) {
            manifest.queries.push({
                package: missingPackages.map((name) => ({$: {'android:name': name}})),
            });
        }

        return config;
    });
}

module.exports = function withUpiInstalledApps(config) {
    config = withUpiNativeSources(config);
    config = withUpiPackageRegistration(config);
    config = withUpiPackageQueries(config);
    return config;
};
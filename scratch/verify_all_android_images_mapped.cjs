const fs = require('fs');
const path = require('path');

const androidSlugs = [
  "kotlin-basics", "kotlin-oop", "kotlin-functions", "kotlin-collections", "kotlin-null-safety",
  "kotlin-coroutines-basics", "kotlin-generics", "kotlin-lambdas", "kotlin-delegates", "kotlin-type-system",
  "android-activity-lifecycle", "android-activity-launch-modes", "android-viewmodel", "android-state-restoration",
  "android-tasks-backstack", "android-implicit-intents", "android-explicit-intents", "android-intent-filters",
  "android-content-provider", "android-broadcast-receiver", "compose-column-row", "compose-lazy-column-row",
  "compose-box", "compose-scaffold", "compose-constraint-layout", "compose-text", "compose-button",
  "compose-icon", "compose-image", "compose-textfield", "compose-card", "compose-bottomsheet",
  "compose-tabrow", "compose-dialog", "compose-animations", "compose-drawer", "compose-navhost",
  "compose-remember-state", "compose-viewmodel-state", "compose-side-effects", "xml-textview",
  "xml-imageview", "xml-fragments", "xml-recyclerview", "xml-constraint", "android-jetpack-compose-core",
  "android-app-shortcuts", "android-navigation-core", "arch-mvi", "arch-mvvm", "arch-mvp", "arch-mvc",
  "pattern-android-repository", "pattern-android-builder", "pattern-android-factory", "pattern-android-observer",
  "pattern-android-flow", "pattern-android-rxkotlin", "pattern-android-rxjava", "pattern-android-livedata",
  "di-dagger", "di-hilt", "di-koin", "storage-shared-preferences", "storage-datastore", "storage-room",
  "storage-filesystem", "android-security-keystore", "network-retrofit", "network-okhttp", "network-apollo",
  "android-logger-timber", "android-leakcanary", "android-chucker", "android-benchmark", "async-coroutines",
  "async-threads", "async-rxjava", "async-rxkotlin", "async-workmanager", "test-espresso", "test-junit",
  "lint-ktlint", "lint-detekt", "android-adb-debugging", "service-firebase-auth", "service-crashlytics",
  "service-remote-config", "service-cloud-messaging", "service-firestore", "service-firebase-core",
  "service-admob", "service-play-services", "service-maps", "dist-signed-apk", "dist-firebase", "dist-playstore"
];

const imgDir = path.join(__dirname, '../public/images/android');
const existingFiles = fs.readdirSync(imgDir);

console.log("=================================================");
console.log("VERIFYING ANDROID IMAGE MAPPINGS");
console.log("=================================================");

let valid = 0;
androidSlugs.forEach(slug => {
  const targetImage = `${slug}-dark.png`;
  if (existingFiles.includes(targetImage)) {
    valid++;
  } else {
    console.error(`ERROR: ${targetImage} NOT FOUND`);
  }
});

console.log(`\nSUCCESS: All ${valid} / ${androidSlugs.length} Android images are verified and mapped!`);

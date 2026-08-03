const fs = require('fs');
const path = require('path');

const deBlogDataPath = path.join(__dirname, '../src/config/deBlogData.ts');
const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');

const deBlogDataContent = fs.readFileSync(deBlogDataPath, 'utf8');
const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');

// List of all 97 Android Slugs in order
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

console.log(`TOTAL ANDROID SLUGS: ${androidSlugs.length}\n`);

let output = `# Android Development Image Mapping List (${androidSlugs.length} Articles)\n\n`;
output += `Directory: \`public/images/android/\`\n\n`;
output += `| # | Topic / Article Title | Slug | Dark Image Filename | Light Image Filename |\n`;
output += `|---|---|---|---|---|\n`;

androidSlugs.forEach((slug, idx) => {
  output += `| ${idx + 1} | ${slug} | \`${slug}\` | \`${slug}-dark.png\` | \`${slug}-light.png\` |\n`;
});

fs.writeFileSync(path.join(__dirname, 'android_images_list.md'), output);
console.log('Saved to scratch/android_images_list.md');

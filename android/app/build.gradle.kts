import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Ключ подписи релизной сборки: keystore.properties рядом с settings.gradle.kts (в репозиторий не попадает).
// Без него релиз собирается неподписанным — отладочная сборка от него не зависит.
val keystore = Properties().apply {
    val file = rootProject.file("keystore.properties")
    if (file.exists()) file.inputStream().use { load(it) }
}

// Игра лежит в корне репозитория и общая для сайта, Яндекс Игр и приложения.
// В приложение она попадает как есть, кроме platform.js: вместо обёртки SDK Яндекса — своя, из src/main/web.
val gameDir = rootProject.file("..")
val gameFiles = listOf("index.html", "style.css", "data.js", "data2.js", "data3.js", "sizes.js", "speeds.js", "game.js")
val webAssets = layout.buildDirectory.dir("generated/webAssets")

val syncWeb = tasks.register<Sync>("syncWeb") {
    from(gameDir) { include(gameFiles) }
    from("src/main/web")
    into(webAssets)
}

android {
    namespace = "ru.lexlord.glazomer"
    compileSdk = 35

    defaultConfig {
        applicationId = "ru.lexlord.glazomer"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // Тесты на устройстве по умолчанию идут на отладочной сборке; с -PtestRelease — на той, что уходит в магазин.
    testBuildType = if (project.hasProperty("testRelease")) "release" else "debug"

    signingConfigs {
        if (keystore.containsKey("storeFile")) {
            create("release") {
                storeFile = rootProject.file(keystore.getProperty("storeFile"))
                storePassword = keystore.getProperty("storePassword")
                keyAlias = keystore.getProperty("keyAlias")
                keyPassword = keystore.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
            if (project.hasProperty("testRelease")) proguardFiles("proguard-test.pro")
            testProguardFiles("proguard-test.pro")
            signingConfig = signingConfigs.findByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets["main"].assets.srcDir(webAssets)

    testOptions {
        unitTests.all {
            it.dependsOn(syncWeb)
            it.inputs.dir(webAssets)
            it.inputs.file(File(gameDir, "platform.js"))
            it.systemProperty("glazomer.assets", webAssets.get().asFile.path)
            it.systemProperty("glazomer.game", gameDir.path)
        }
    }
}

tasks.named("preBuild") { dependsOn(syncWeb) }

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")

    testImplementation("junit:junit:4.13.2")

    androidTestImplementation("androidx.test:core-ktx:1.6.1")
    androidTestImplementation("androidx.test:runner:1.6.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation("androidx.test.espresso:espresso-intents:3.6.1")
}

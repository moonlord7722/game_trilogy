package ru.lexlord.glazomer

import android.app.Activity
import android.app.Instrumentation
import android.content.Intent
import android.content.pm.PackageManager
import android.os.SystemClock
import android.view.MotionEvent
import androidx.lifecycle.Lifecycle
import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso
import androidx.test.espresso.intent.Intents
import androidx.test.espresso.intent.matcher.IntentMatchers.hasAction
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Игра внутри приложения на устройстве: тесты нажимают настоящие кнопки страницы и читают то, что видит игрок.
 * Каждый тест начинается с чистого сохранения, то есть с обучения.
 */
@RunWith(AndroidJUnit4::class)
class GameTest {

    private lateinit var scenario: ActivityScenario<MainActivity>

    @Before
    fun open() {
        scenario = ActivityScenario.launch(MainActivity::class.java)
        awaitPage()
        js("localStorage.clear()")
        reload()
    }

    @After
    fun close() {
        if (scenario.state != Lifecycle.State.DESTROYED) {
            scenario.onActivity { assertEquals("ошибки на странице", emptyList<String>(), it.pageErrors.toList()) }
        }
        scenario.close()
    }

    // ---------- запуск ----------

    @Test
    fun firstLaunchOpensTutorialFromAppAssets() {
        assertEquals(MainActivity.HOME, js("return location.href"))
        assertEquals("Глазомер", js("return document.title"))
        assertEquals("Обучение", text("level"))
        assertEquals("Пропустить", text("exit"))
        assertTrue(hidden("start"))
        assertEquals("в приложении нет рекламы", false, js("return Platform.hasAds"))
    }

    @Test
    fun allSilhouettesAreLoaded() {
        // 139 предметов общей коллекции и 12 секретных.
        skipTutorial()
        tap("open-album")
        assertEquals(151, js("return document.querySelectorAll('#album-grid figure').length"))
        assertEquals(20, js("return document.querySelectorAll('#album-grid figure svg').length"))
        assertTrue(text("album-count").contains("20 из"))
    }

    @Test
    fun appAsksForNoInternetPermission() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val info = context.packageManager.getPackageInfo(context.packageName, PackageManager.GET_PERMISSIONS)
        val asked = info.requestedPermissions.orEmpty().toList()
        assertFalse("$asked", asked.any { it.startsWith("android.permission.") })
    }

    @Test
    fun pageCannotReachOutside() {
        skipTutorial()
        js("window.probe = null; fetch('/sdk.js').then((r) => { window.probe = r.status; }, () => { window.probe = 'failed'; })")
        until("ответ на /sdk.js") { js("return window.probe") != null }
        assertEquals(404, js("return window.probe"))

        js("location.href = 'https://example.com/'")
        Thread.sleep(1500)
        assertEquals(MainActivity.HOME, js("return location.href"))
        assertFalse("меню пропало", hidden("start"))
    }

    // ---------- игра ----------

    @Test
    fun tutorialRoundLeadsToMenu() {
        assertEquals("Отпустить весы", text("main"))
        tap("main")
        awaitRoundEnd("Играть")
        assertTrue(text("verdict"), Regex(""" · \+\d+$""").containsMatchIn(text("verdict")))
        tap("main")
        assertFalse(hidden("start"))
        assertEquals(true, save().getBoolean("tutorial"))
    }

    @Test
    fun dailyPartyPlaysThroughInEveryMode() {
        skipTutorial()
        listOf("Вес" to "Отпустить весы", "Размер" to "Замерить", "Скорость" to "Дать старт").forEachIndexed { i, (title, go) ->
            tap("#modes button:nth-child(${i + 1})")
            assertEquals(title, js("return document.querySelector('#modes .on').textContent"))
            val total = playDaily(go)
            assertTrue("$title: $total", total in 0..600)
            tap("change")
            until("меню после итогов «$title»") { !hidden("start") }
            assertEquals(true, js("return document.getElementById('play-daily').disabled"))
            assertTrue(text("play-daily").contains("Сыграна: $total из 600"))
        }
        assertEquals("после партии дня открыта свободная игра", false, js("return document.getElementById('play-free').disabled"))
        assertEquals(3, save().getJSONObject("daily").length())
        assertEquals(1, save().getJSONObject("streak").getInt("count"))
    }

    @Test
    fun sliderAndStepperChangeTheAnswer() {
        skipTutorial()
        tap("play-daily")
        awaitGuess("Отпустить весы")
        js("const s = document.getElementById('slider'); s.value = 40; s.dispatchEvent(new Event('input', { bubbles: true }))")
        val before = text("count")
        tap("plus")
        assertTrue("«+» не изменил ответ: $before", text("count") != before)
        tap("minus")
        assertEquals(before, text("count"))
    }

    @Test
    fun hintIsSpentOncePerRound() {
        skipTutorial()
        tap("play-daily")
        awaitGuess("Отпустить весы")
        val had = save().getInt("hints")
        tap("#hints [data-hint=range]")
        assertEquals(had - 1, save().getInt("hints"))
        assertEquals("Подсказки: ${had - 1}", text("hint-count"))
        assertEquals("после подсказки остальные в этом раунде выключены", 3, js("return document.querySelectorAll('#hints [data-hint]:disabled').length"))
    }

    // ---------- сохранение ----------

    @Test
    fun progressSurvivesActivityRecreation() {
        skipTutorial()
        tap("play-daily")
        playRound("Отпустить весы")
        scenario.recreate()
        awaitPage()
        assertFalse("после пересоздания снова обучение", hidden("start"))
        assertTrue(text("play-daily"), text("play-daily").contains("Продолжить: раунд 2 из 6"))
    }

    @Test
    fun progressSurvivesAppRestart() {
        skipTutorial()
        tap("open-settings")
        tap("#pairs button:nth-child(2)")
        tap("settings-back")
        until("настройки закрыты") { hidden("settings") }
        val colors = save().getJSONArray("colors").toString()
        scenario.close()
        scenario = ActivityScenario.launch(MainActivity::class.java)
        awaitPage()
        assertFalse("после перезапуска снова обучение", hidden("start"))
        assertEquals(colors, save().getJSONArray("colors").toString())
    }

    // ---------- системные кнопки ----------

    @Test
    fun backClosesPanelsThenTheApp() {
        skipTutorial()
        tap("open-album")
        assertFalse(hidden("album"))
        Espresso.pressBackUnconditionally()
        until("коллекция закрыта") { hidden("album") }

        tap("open-settings")
        assertFalse(hidden("settings"))
        Espresso.pressBackUnconditionally()
        until("настройки закрыты") { hidden("settings") }
        assertFalse(hidden("start"))

        Espresso.pressBackUnconditionally()
        until("приложение закрыто") { scenario.state == Lifecycle.State.DESTROYED }
    }

    @Test
    fun backFromDailyPartyReturnsToMenuAndKeepsIt() {
        skipTutorial()
        tap("play-daily")
        playRound("Отпустить весы")
        Espresso.pressBackUnconditionally()
        until("меню") { !hidden("start") }
        assertTrue(text("play-daily").contains("Продолжить: раунд 2 из 6"))
    }

    @Test
    fun backFromFreePartyAsksFirst() {
        skipTutorial()
        playDaily("Отпустить весы")
        tap("again")
        awaitGuess("Отпустить весы")
        assertEquals("свободная партия без пометки «день»", "Лёгкий", text("level"))

        Espresso.pressBackUnconditionally()
        until("вопрос о выходе") { !hidden("leave") }
        tap("leave-stay")
        assertTrue(hidden("leave"))
        assertTrue("партия закрылась", hidden("start"))

        Espresso.pressBackUnconditionally()
        until("вопрос о выходе") { !hidden("leave") }
        tap("leave-go")
        until("меню") { !hidden("start") }
    }

    @Test
    fun shareOpensSystemSheetWithResult() {
        skipTutorial()
        val total = playDaily("Отпустить весы")
        assertEquals("Поделиться результатом", text("share"))
        Intents.init()
        try {
            Intents.intending(hasAction(Intent.ACTION_CHOOSER))
                .respondWith(Instrumentation.ActivityResult(Activity.RESULT_OK, null))
            tap("share")
            until("окно «Поделиться»") { Intents.getIntents().any { it.action == Intent.ACTION_CHOOSER } }
            val chooser = Intents.getIntents().first { it.action == Intent.ACTION_CHOOSER }
            @Suppress("DEPRECATION")
            val send = chooser.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)!!
            assertEquals(Intent.ACTION_SEND, send.action)
            assertEquals("text/plain", send.type)
            val shared = send.getStringExtra(Intent.EXTRA_TEXT)!!
            assertTrue(shared, shared.startsWith("Глазомер · вес · лёгкий — $total из 600\n"))
            assertEquals("шесть раундов — шесть значков", 6, shared.substringAfter("\n").codePointCount(0, shared.substringAfter("\n").length))
        } finally {
            Intents.release()
        }
    }

    // ---------- вёрстка ----------

    @Test
    fun everyScreenFitsWithoutScrolling() {
        fun assertFits(screen: String, bottomOf: String) {
            assertTrue("$screen: страница прокручивается", js("return document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth") as Boolean)
            assertTrue("$screen: «$bottomOf» ниже края экрана", js("const b = document.querySelector('$bottomOf').getBoundingClientRect(); return b.height > 0 && b.bottom <= innerHeight && b.right <= innerWidth") as Boolean)
        }
        assertFits("обучение", "#main")
        skipTutorial()
        assertFits("меню", "#extras")
        listOf("Отпустить весы", "Замерить", "Дать старт").forEachIndexed { i, go ->
            tap("#modes button:nth-child(${i + 1})")
            tap("play-daily")
            awaitGuess(go)
            assertFits(go, "#main")
            assertTrue("$go: сцена схлопнулась", (js("return document.getElementById('stage').getBoundingClientRect().height") as Number).toInt() > 120)
            Espresso.pressBackUnconditionally()
            until("меню") { !hidden("start") }
        }
    }

    // ---------- помощники ----------

    /** Выполняет код на странице и возвращает его результат. */
    private fun js(code: String): Any? {
        val raw = evaluate(code) ?: throw AssertionError("страница не ответила: $code")
        val value = JSONTokener(raw).nextValue()
        return if (value == JSONObject.NULL) null else value
    }

    /** Ответ страницы как есть или null, если его нет: пока страница грузится, ответ может не прийти вовсе. */
    private fun evaluate(code: String, seconds: Long = 15): String? {
        val done = CountDownLatch(1)
        var raw: String? = null
        scenario.onActivity { activity ->
            activity.webView.evaluateJavascript("(() => { $code })()") {
                raw = it
                done.countDown()
            }
        }
        return if (done.await(seconds, TimeUnit.SECONDS)) raw else null
    }

    private fun until(what: String, seconds: Int = 15, check: () -> Boolean) {
        val deadline = System.currentTimeMillis() + seconds * 1000
        while (System.currentTimeMillis() < deadline) {
            if (check()) return
            Thread.sleep(100)
        }
        fail("не дождались: $what")
    }

    /** Страница загружена и игра запущена. */
    private fun awaitPage() = until("загрузка игры", 30) {
        evaluate("return document.readyState === 'complete' && !window.stale && typeof Platform === 'object'", 2) == "true"
    }

    private fun reload() {
        js("window.stale = true")
        scenario.onActivity { it.webView.reload() }
        awaitPage()
    }

    private fun selector(target: String) = if (target.any { it in "#. [" }) target else "#$target"

    /**
     * Нажимает пальцем на середину кнопки. Нажатие настоящее, а не вызов click() на странице:
     * так проверяется, что кнопка ничем не закрыта (длинная карточка итогов прокручивается к ней), а запись в истории страницы,
     * сделанная без жеста игрока, не считается шагом для системной кнопки «назад».
     */
    private fun tap(target: String) {
        val at = js(
            "const b = document.querySelector('${selector(target)}');" +
                "if (!b || b.disabled || !b.getClientRects().length) return null;" +
                "b.scrollIntoView({ block: 'nearest' });" +
                "window.tapped = false; b.addEventListener('click', () => { window.tapped = true; }, { once: true });" +
                "const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, devicePixelRatio]"
        ) as JSONArray? ?: throw AssertionError("нет кнопки ${selector(target)} или она выключена")
        val corner = IntArray(2)
        scenario.onActivity { it.webView.getLocationOnScreen(corner) }
        val x = corner[0] + (at.getDouble(0) * at.getDouble(2)).toFloat()
        val y = corner[1] + (at.getDouble(1) * at.getDouble(2)).toFloat()
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val down = SystemClock.uptimeMillis()
        listOf(MotionEvent.ACTION_DOWN to down, MotionEvent.ACTION_UP to down + 40).forEach { (action, time) ->
            val event = MotionEvent.obtain(down, time, action, x, y, 0)
            instrumentation.sendPointerSync(event)
            event.recycle()
        }
        until("нажатие на ${selector(target)}") { js("return window.tapped") == true }
    }

    private fun text(id: String) = js("return document.getElementById('$id').textContent") as String

    private fun hidden(id: String) = js("return document.getElementById('$id').hidden") as Boolean

    private fun save() = JSONObject(js("return localStorage.getItem('glazomer-save')") as String)

    private fun skipTutorial() {
        tap("exit")
        assertFalse(hidden("start"))
    }

    private fun mainIs(label: String) =
        js("const b = document.getElementById('main'); return !b.disabled && b.textContent === '$label'") == true

    private fun awaitGuess(go: String) = until("раунд ждёт ответа «$go»") { mainIs(go) && hidden("start") && hidden("summary") }

    /** Ждёт, пока раунд доиграет все свои показы, и возвращает подпись главной кнопки. */
    private fun awaitRoundEnd(vararg labels: String): String {
        var label = ""
        until("конец раунда", 60) { labels.firstOrNull { mainIs(it) }?.also { label = it } != null }
        return label
    }

    /** Отвечает на текущий раунд как есть и возвращает подпись кнопки после него. */
    private fun playRound(go: String): String {
        awaitGuess(go)
        tap("main")
        return awaitRoundEnd("Дальше", "Итоги")
    }

    /** Играет партию дня из меню до итогов и возвращает сумму очков. */
    private fun playDaily(go: String): Int {
        tap("play-daily")
        repeat(6) { round ->
            assertEquals("${round + 1} / 6", text("round"))
            assertEquals(if (round < 5) "Дальше" else "Итоги", playRound(go))
            tap("main")
        }
        until("итоги") { !hidden("summary") }
        assertEquals(6, js("return document.querySelectorAll('#sum-list li').length"))
        val total = text("sum-total").substringBefore(" ").toInt()
        assertEquals(total, (js("return [...document.querySelectorAll('#sum-list li span:last-child')].reduce((s, e) => s + Number(e.textContent), 0)") as Number).toInt())
        return total
    }
}

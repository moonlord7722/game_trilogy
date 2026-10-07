package ru.lexlord.glazomer

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Проверки того, что уезжает в assets: игра из корня репозитория плюс platform.js приложения.
 * Ловят расхождения, когда игра меняется, а приложение — нет.
 */
class BundleTest {

    private val assets = File(System.getProperty("glazomer.assets")!!)
    private val game = File(System.getProperty("glazomer.game")!!)

    private fun asset(name: String) = File(assets, name).readText()

    /** Файлы, которые подключает страница. */
    private val linked = Regex("""(?:src|href)="([^"]+)"""").findAll(asset("index.html")).map { it.groupValues[1] }.toSet()

    /** Объект, который возвращает обёртка площадки: всё после последнего `return {`. */
    private fun api(source: String) = source.substringAfterLast("return {")

    private fun defines(source: String, member: String) =
        Regex("""(?<![.\w])(?:get\s+)?$member\s*[:(,}]""").containsMatchIn(api(source))

    @Test
    fun `страница подключает только файлы из сборки`() {
        assertTrue("страница ничего не подключает", linked.isNotEmpty())
        linked.forEach { assertTrue("$it нет в сборке", File(assets, it).isFile) }
    }

    @Test
    fun `в сборке нет лишних файлов`() {
        assertEquals(linked + "index.html", assets.list()!!.toSet())
    }

    @Test
    fun `файлы игры совпадают с корнем репозитория`() {
        (linked + "index.html" - "platform.js").forEach {
            assertArrayEquals("$it устарел", File(game, it).readBytes(), File(assets, it).readBytes())
        }
    }

    @Test
    fun `обёртка площадки в сборке своя, а не Яндекс Игр`() {
        val platform = asset("platform.js")
        assertTrue(platform.contains("GlazomerApp"))
        assertTrue("в приложение попал SDK Яндекса", !platform.contains("YaGames") && !platform.contains("sdk.js"))
    }

    @Test
    fun `игра не ссылается на адреса в сети`() {
        val url = Regex("""https?://[^\s"'`)<]+""")
        assets.listFiles()!!.forEach { file ->
            val outside = url.findAll(file.readText()).map { it.value }.filterNot { it.startsWith("http://www.w3.org/") }.toList()
            assertTrue("${file.name}: $outside", outside.isEmpty())
        }
    }

    @Test
    fun `обёртка приложения умеет всё, что игра просит у площадки`() {
        val used = Regex("""\bPlatform\.(\w+)""").findAll(asset("game.js")).map { it.groupValues[1] }.toSet()
        assertTrue("игра не обращается к площадке", used.size > 3)
        val missing = used.filterNot { defines(asset("platform.js"), it) }
        assertTrue("в app/src/main/web/platform.js нет: $missing", missing.isEmpty())
    }

    @Test
    fun `обёртка приложения повторяет набор обёртки Яндекс Игр`() {
        val web = File(game, "platform.js").readText()
        // Из «init, ready, get hasAds() { ... },» остаются одни имена.
        val members = api(web).substringBeforeLast("};").replace(Regex("""\([^)]*\)\s*\{[^{}]*\}"""), "")
            .split(",").map { it.trim().removePrefix("get ").trim() }.filter { it.isNotEmpty() }
        assertTrue("набор обёртки Яндекс Игр не разобран: $members", members.containsAll(listOf("init", "rewarded", "hasAds")))
        members.forEach { assertTrue("странное имя «$it»", Regex("""\w+""").matches(it)) }
        val missing = members.filterNot { defines(asset("platform.js"), it) }
        assertTrue("в app/src/main/web/platform.js нет: $missing", missing.isEmpty())
    }
}

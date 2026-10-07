package ru.lexlord.glazomer

import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.addCallback
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Единственный экран: игра из assets во встроенном браузере.
 * Страница открывается с адреса [HOME]; менять его нельзя — к адресу привязано сохранение игрока (localStorage).
 */
class MainActivity : ComponentActivity() {

    lateinit var webView: WebView
        private set

    /** Ошибки страницы: сообщения консоли уровня error. */
    val pageErrors = CopyOnWriteArrayList<String>()

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Бумага светлая в любой теме телефона, поэтому значки системных панелей всегда тёмные.
        val bars = SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT)
        enableEdgeToEdge(bars, bars)
        super.onCreate(savedInstanceState)

        val paper = getColor(R.color.paper)
        webView = WebView(this)
        val root = FrameLayout(this).apply {
            setBackgroundColor(paper)
            addView(webView, MATCH_PARENT, MATCH_PARENT)
        }
        setContentView(root)
        // Игра занимает экран между системными панелями и вырезом камеры.
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val safe = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom)
            WindowInsetsCompat.CONSUMED
        }

        val debuggable = applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0
        WebView.setWebContentsDebuggingEnabled(debuggable)

        val assets = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.apply {
            setBackgroundColor(paper)
            overScrollMode = View.OVER_SCROLL_NEVER
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
            // Долгое нажатие — это удержание кнопок «+» и «−», а не выделение текста.
            setOnLongClickListener { true }
            isHapticFeedbackEnabled = false
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                // Вёрстка рассчитана на один экран без прокрутки: системный размер шрифта её не раздвигает.
                textZoom = 100
                setSupportZoom(false)
                allowFileAccess = false
                allowContentAccess = false
            }
            addJavascriptInterface(Bridge(), "GlazomerApp")
            webViewClient = object : WebViewClient() {
                // Всё, чего нет в assets, считается отсутствующим: наружу страница не ходит.
                override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse =
                    assets.shouldInterceptRequest(request.url) ?: notFound()

                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                    !isLocal(request.url)
            }
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                    if (message.messageLevel() == ConsoleMessage.MessageLevel.ERROR) {
                        val text = "${message.message()} (${message.sourceId()}:${message.lineNumber()})"
                        pageErrors += text
                        Log.e(TAG, text)
                    }
                    return true
                }
            }
        }

        // Системная «назад» идёт через историю страницы, как кнопки «‹ Меню» и «Назад» в самой игре.
        // Из меню истории нет — приложение закрывается.
        onBackPressedDispatcher.addCallback(this) {
            if (webView.canGoBack()) webView.goBack() else finish()
        }

        // После пересоздания экрана страница грузится заново: партию дня и прогресс игра сама поднимает из сохранения.
        webView.loadUrl(HOME)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        (webView.parent as? FrameLayout)?.removeView(webView)
        webView.destroy()
        super.onDestroy()
    }

    private fun isLocal(url: Uri) = url.scheme == "https" && url.host == WebViewAssetLoader.DEFAULT_DOMAIN

    private fun notFound() =
        WebResourceResponse("text/plain", "utf-8", 404, "Not Found", emptyMap(), ByteArrayInputStream(ByteArray(0)))

    /** То, что страница может попросить у приложения: см. app/src/main/web/platform.js. */
    private inner class Bridge {
        @JavascriptInterface
        fun share(text: String) {
            val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
            runOnUiThread { startActivity(Intent.createChooser(send, null)) }
        }
    }

    companion object {
        const val HOME = "https://${WebViewAssetLoader.DEFAULT_DOMAIN}/assets/index.html"
        private const val TAG = "Glazomer"
    }
}

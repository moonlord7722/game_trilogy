# Правила только для прогона тестов на релизной сборке (-PtestRelease); в APK для магазина они не участвуют.
# Тесты пользуются библиотеками из приложения и полями экрана, которые сжатие иначе выбросило бы.
# Мост страницы (MainActivity$Bridge) сюда нарочно не входит: проверяется, что он переживает сжатие сам.
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-keep class androidx.** { *; }
-keep class ru.lexlord.glazomer.MainActivity { *; }
-dontwarn **

# Собирает архив игры для загрузки в черновик Яндекс Игр: dist/glazomer.zip.
# Запуск: python pack.py
import os
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
FILES = ['index.html', 'style.css', 'platform.js', 'data.js', 'data2.js', 'data3.js', 'sizes.js', 'game.js']
OUT = os.path.join(ROOT, 'dist', 'glazomer.zip')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in FILES:
        z.write(os.path.join(ROOT, name), name)

with zipfile.ZipFile(OUT) as z:
    total = sum(i.file_size for i in z.infolist())
    for i in z.infolist():
        print(f'{i.file_size:>8}  {i.filename}')
print(f'{total:>8}  всего без сжатия, архив {os.path.getsize(OUT)} байт: {OUT}')
